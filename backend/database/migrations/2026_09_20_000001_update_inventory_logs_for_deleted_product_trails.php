<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() === 'mysql') {
            Schema::table('inventory_logs', function (Blueprint $table) {
                // Drop existing foreign key on pharmacy_product_id if present
                try {
                    $table->dropForeign(['pharmacy_product_id']);
                } catch (\Throwable $e) {
                }
            });

            Schema::table('inventory_logs', function (Blueprint $table) {
                // Make pharmacy_product_id nullable and set null on delete
                $table->unsignedBigInteger('pharmacy_product_id')->nullable()->change();
                $table->foreign('pharmacy_product_id')->references('id')->on('pharmacy_products')->onDelete('set null');

                // Add snapshot columns for audit trail persistence if not present
                if (!Schema::hasColumn('inventory_logs', 'product_name')) {
                    $table->string('product_name')->nullable()->after('pharmacy_product_id');
                }
                if (!Schema::hasColumn('inventory_logs', 'unit_cost')) {
                    $table->decimal('unit_cost', 10, 2)->nullable()->after('quantity');
                }
                if (!Schema::hasColumn('inventory_logs', 'selling_price')) {
                    $table->decimal('selling_price', 10, 2)->nullable()->after('unit_cost');
                }
            });

            // Convert transaction_type enum to varchar to support 'product_deleted' and future audit types
            try {
                DB::statement("ALTER TABLE inventory_logs MODIFY COLUMN transaction_type VARCHAR(50) NOT NULL");
            } catch (\Throwable $e) {
            }
        }

        // Backfill existing logs with product name, unit cost, and selling price
        try {
            DB::statement("
                UPDATE inventory_logs il
                JOIN pharmacy_products pp ON il.pharmacy_product_id = pp.id
                JOIN products p ON pp.product_id = p.id
                SET il.product_name = TRIM(CONCAT(p.product_name, IF(p.strength IS NOT NULL AND p.strength != '' AND LOWER(p.strength) NOT IN ('n/a', 'na', 'n.a', 'n.a.'), CONCAT(' ', p.strength), ''), IF(p.size IS NOT NULL AND p.size != '' AND LOWER(p.size) NOT IN ('n/a', 'na', 'n.a', 'n.a.'), CONCAT(' ', p.size), ''))),
                    il.unit_cost = pp.unit_cost,
                    il.selling_price = pp.selling_price
                WHERE il.product_name IS NULL
            ");
        } catch (\Throwable $e) {
            // In case sqlite or test DB is used without full joins
        }
    }

    public function down(): void
    {
        Schema::table('inventory_logs', function (Blueprint $table) {
            $table->dropForeign(['pharmacy_product_id']);
            $table->dropColumn(['product_name', 'unit_cost', 'selling_price']);
        });

        DB::statement("ALTER TABLE inventory_logs MODIFY COLUMN transaction_type ENUM('stock_in', 'stock_out', 'adjustment', 'waste') NOT NULL");

        Schema::table('inventory_logs', function (Blueprint $table) {
            $table->unsignedBigInteger('pharmacy_product_id')->nullable(false)->change();
            $table->foreign('pharmacy_product_id')->references('id')->on('pharmacy_products')->onDelete('cascade');
        });
    }
};
