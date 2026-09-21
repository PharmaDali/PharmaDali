<?php

namespace App\Console\Commands;

use App\Models\CartItem;
use App\Models\Pharmacy;
use App\Models\PharmacyProduct;
use App\Models\Products;
use App\Services\Inventory\InventoryLogService;
use App\Services\Inventory\RestockPredictorService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class SanitizeInventoryCommand extends Command
{
    protected $signature = 'inventory:sanitize 
                            {--pharmacy= : ID of the pharmacy to sanitize (defaults to all or interactive)}
                            {--dry-run : Preview items to be deleted or unlisted without making changes}
                            {--force : Execute the operation without interactive confirmation}';

    protected $description = 'Sanitize pharmacy catalog by permanently deleting products without batch stocks and safe-unlisting those with order history.';

    public function handle(
        InventoryLogService $logService,
        RestockPredictorService $restockPredictorService
    ): int {
        $isDryRun = (bool) $this->option('dry-run');
        $force = (bool) $this->option('force');
        $pharmacyIdOption = $this->option('pharmacy');

        $this->info('');
        $this->info('========================================================================');
        $this->info('             PHARMADALI - INVENTORY DATA SANITIZATION                  ');
        $this->info('========================================================================');
        $this->info($isDryRun ? 'MODE: [DRY-RUN] (No modifications will be made to the database)' : 'MODE: [LIVE EXECUTION]');
        $this->info('');

        // Resolve target pharmacies
        $pharmaciesQuery = Pharmacy::query();
        if ($pharmacyIdOption) {
            $pharmaciesQuery->where('id', (int) $pharmacyIdOption);
        }
        $pharmacies = $pharmaciesQuery->get();

        if ($pharmacies->isEmpty()) {
            $this->error($pharmacyIdOption ? "Pharmacy with ID {$pharmacyIdOption} not found." : "No pharmacies found in the system.");
            return self::FAILURE;
        }

        foreach ($pharmacies as $pharmacy) {
            $this->processPharmacy($pharmacy, $isDryRun, $force, $logService, $restockPredictorService);
        }

        $this->info('');
        $this->info('Sanitization routine finished.');
        return self::SUCCESS;
    }

    private function processPharmacy(
        Pharmacy $pharmacy,
        bool $isDryRun,
        bool $force,
        InventoryLogService $logService,
        RestockPredictorService $restockPredictorService
    ): void {
        $this->line("<fg=cyan>Scanning Pharmacy #{$pharmacy->id}: {$pharmacy->pharmacy_name}...</>");

        // Candidate products:
        // Either have NO batches at all, OR have batches but all batches have 0 or negative stock.
        $candidates = PharmacyProduct::query()
            ->where('pharmacy_id', $pharmacy->id)
            ->where(function ($query) {
                $query->whereDoesntHave('batches')
                    ->orWhereDoesntHave('batches', function ($batchQuery) {
                        $batchQuery->where('stock', '>', 0);
                    });
            })
            ->with(['product', 'batches'])
            ->get();

        if ($candidates->isEmpty()) {
            $this->info("  ✓ No obsolete zero-batch products found for this pharmacy. Everything looks clean.");
            return;
        }

        $deleteList = [];
        $unlistList = [];

        foreach ($candidates as $pharmacyProduct) {
            $hasOrders = DB::table('order_items')
                ->where('pharmacy_product_id', $pharmacyProduct->id)
                ->exists();

            $orderCount = $hasOrders
                ? DB::table('order_items')->where('pharmacy_product_id', $pharmacyProduct->id)->count()
                : 0;

            $product = $pharmacyProduct->product;
            $nameParts = array_filter([
                $product?->product_name,
                ($product?->strength && !in_array(strtolower(trim($product->strength)), ['n/a', 'na', 'n.a', 'n.a.'])) ? trim($product->strength) : null,
                ($product?->size && !in_array(strtolower(trim($product->size)), ['n/a', 'na', 'n.a', 'n.a.'])) ? trim($product->size) : null,
            ]);
            $displayName = implode(' ', $nameParts) ?: ($product?->product_name ?? 'Unknown Product');

            $row = [
                'id' => $pharmacyProduct->id,
                'product_id' => $pharmacyProduct->product_id,
                'name' => $displayName,
                'legacy_stock' => $pharmacyProduct->stock ?? 0,
                'batches_count' => $pharmacyProduct->batches->count(),
                'orders_count' => $orderCount,
                'model' => $pharmacyProduct,
            ];

            if ($hasOrders) {
                $unlistList[] = $row;
            } else {
                $deleteList[] = $row;
            }
        }

        $this->line("  Found <fg=yellow>" . count($candidates) . "</> candidate products without active batch inventory.");
        $this->line("  - Safe to <fg=red;options=bold>HARD DELETE</> (0 orders): <fg=white>" . count($deleteList) . "</>");
        $this->line("  - Safe to <fg=yellow;options=bold>UNLIST & ZERO</> (has order history): <fg=white>" . count($unlistList) . "</>");
        $this->line('');

        // Display Table of candidates
        $tableRows = [];
        foreach ($deleteList as $item) {
            $tableRows[] = [
                $item['id'],
                $item['name'],
                $item['legacy_stock'],
                $item['batches_count'],
                $item['orders_count'],
                '<fg=red>DELETE</>',
            ];
        }
        foreach ($unlistList as $item) {
            $tableRows[] = [
                $item['id'],
                $item['name'],
                $item['legacy_stock'],
                $item['batches_count'],
                $item['orders_count'],
                '<fg=yellow>UNLIST & ZERO</>',
            ];
        }

        $this->table(
            ['PP ID', 'Product Name', 'Legacy Stock', 'Batches', 'Orders', 'Planned Action'],
            $tableRows
        );

        if ($isDryRun) {
            $this->comment("Dry-run preview complete. To execute changes, run this command without --dry-run.");
            return;
        }

        if (!$force && !$this->confirm("Are you sure you want to permanently delete " . count($deleteList) . " products and unlist " . count($unlistList) . " products for '{$pharmacy->pharmacy_name}'?", false)) {
            $this->warn("Operation cancelled by user.");
            return;
        }

        // Execute changes inside a transaction
        DB::transaction(function () use ($pharmacy, $deleteList, $unlistList, $logService, $restockPredictorService) {
            $deletedCount = 0;
            $unlistedCount = 0;

            // 1. Process Permanent Deletions
            foreach ($deleteList as $item) {
                /** @var PharmacyProduct $pharmacyProduct */
                $pharmacyProduct = $item['model'];
                $productId = $pharmacyProduct->product_id;

                // Remove from shopping carts so customers don't have broken cart entries
                CartItem::where('pharmacy_product_id', $pharmacyProduct->id)->delete();

                // Log audit trail
                try {
                    $logService->logProductDeleted(
                        pharmacyId: $pharmacyProduct->pharmacy_id,
                        pharmacyProductId: $pharmacyProduct->id,
                        productName: $item['name'],
                        quantity: (int) $item['legacy_stock'],
                        unitCost: $pharmacyProduct->unit_cost ? (float) $pharmacyProduct->unit_cost : null,
                        sellingPrice: $pharmacyProduct->selling_price ? (float) $pharmacyProduct->selling_price : null,
                        reason: "Sanitized obsolete seeded product without batch stocks (never ordered)"
                    );
                } catch (\Throwable $e) {
                }

                // Delete any zero-stock batch rows if any exist
                $pharmacyProduct->batches()->delete();

                // Delete the branch catalog entry
                $pharmacyProduct->delete();
                $deletedCount++;

                // If no other pharmacy is referencing this master product catalog entry, clean it up
                $remainingLinks = PharmacyProduct::where('product_id', $productId)->count();
                if ($remainingLinks === 0) {
                    Products::where('id', $productId)->delete();
                }
            }

            // 2. Process Unlistings (Products with Order History)
            foreach ($unlistList as $item) {
                /** @var PharmacyProduct $pharmacyProduct */
                $pharmacyProduct = $item['model'];

                // Remove from active shopping carts
                CartItem::where('pharmacy_product_id', $pharmacyProduct->id)->delete();

                // Reset legacy stock to 0 and permanently unlist
                $pharmacyProduct->update([
                    'stock'           => 0,
                    'is_available'    => false,
                    'is_out_of_stock' => true,
                    'is_expired'      => false,
                ]);

                // Delete any zero-stock batch rows
                $pharmacyProduct->batches()->delete();

                $unlistedCount++;
            }

            // Clear priority restocks cache
            try {
                $restockPredictorService->clearPriorityRestocksCache($pharmacy->id);
            } catch (\Throwable $e) {
            }

            $this->info("  ✓ Successfully processed Pharmacy #{$pharmacy->id}:");
            $this->info("    - Permanently deleted: {$deletedCount} products");
            $this->info("    - Unlisted & zeroed:   {$unlistedCount} products");
        });
    }
}

