<?php

namespace App\Services\Pos;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\PharmacyProduct;
use App\Models\Pharmacy;
use App\Models\ItemExchange;
use App\Models\ExchangeReturnedItem;
use App\Models\ExchangeReplacementItem;
use App\Services\Inventory\InventoryLogService;
use App\Events\InventoryUpdated;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;

class ItemExchangeService
{
    public function __construct(
        private readonly InventoryLogService $logService,
    ) {}

    /**
     * Get eligibility and available return limits for an order.
     */
    public function getOrderExchangeEligibility(Order $order, $user): array
    {
        $pharmacyId = $user->pharmacy_id ?? $user->pharmacy?->id ?? $order->pharmacy_id ?? 1;
        $pharmacy = Pharmacy::find($pharmacyId);
        $windowDays = max(1, (int) ($pharmacy?->item_exchange_window_days ?? 1));
        $allowExchange = (bool) ($pharmacy?->allow_item_exchange ?? true);

        if (!$allowExchange) {
            return [
                'eligible' => false,
                'reason' => 'Item exchange feature is disabled in pharmacy settings.',
                'items' => [],
            ];
        }

        if ($order->status !== 'completed') {
            return [
                'eligible' => false,
                'reason' => "Only completed orders can be exchanged (Order #{$order->order_number} status is currently '{$order->status}').",
                'items' => [],
            ];
        }

        // Check pharmacy store operating hours (PHT Asia/Manila)
        $nowPht = now('Asia/Manila');
        $orderDate = $order->completed_at ?? $order->placed_at ?? $order->created_at;
        $orderCarbon = $orderDate ? Carbon::parse($orderDate)->setTimezone('Asia/Manila') : $nowPht;

        // Same calendar day check
        $isSameCalendarDay = $orderCarbon->format('Y-m-d') === $nowPht->format('Y-m-d');

        // Operating hours check (default open if opening/closing hours not specified)
        $isOpenNow = true;
        $openingStr = '12:00 AM';
        $closingStr = '11:59 PM';

        if ($pharmacy?->opening_hour && $pharmacy?->closing_hour) {
            $openingStr = Carbon::parse($pharmacy->opening_hour)->format('g:i A');
            $closingStr = Carbon::parse($pharmacy->closing_hour)->format('g:i A');

            $currentMinutes = ($nowPht->hour * 60) + $nowPht->minute;
            $openingMinutes = $this->timeToMinutes($pharmacy->opening_hour);
            $closingMinutes = $this->timeToMinutes($pharmacy->closing_hour);

            if ($closingMinutes === 0) {
                $closingMinutes = 1440;
            }

            if ($openingMinutes < $closingMinutes) {
                $isOpenNow = $currentMinutes >= $openingMinutes && $currentMinutes <= $closingMinutes;
            } else if ($openingMinutes > $closingMinutes) {
                // Overnight operating schedule (e.g. 20:00 - 06:00)
                $isOpenNow = $currentMinutes >= $openingMinutes || $currentMinutes <= $closingMinutes;
            }
        }

        if ($windowDays === 1) {
            if (!$isSameCalendarDay) {
                return [
                    'eligible' => false,
                    'reason' => "Item exchange is only allowed on the same day of purchase during store operating hours ({$openingStr} - {$closingStr}) per pharmacy policy.",
                    'items' => [],
                ];
            }

            if (!$isOpenNow) {
                return [
                    'eligible' => false,
                    'reason' => "Item exchange can only be processed during pharmacy operating hours ({$openingStr} - {$closingStr}).",
                    'items' => [],
                ];
            }
        } else {
            $daysDiff = $orderCarbon->diffInDays($nowPht);
            if ($daysDiff > $windowDays) {
                return [
                    'eligible' => false,
                    'reason' => "Item exchange is only allowed within {$windowDays} days of purchase.",
                    'items' => [],
                ];
            }
        }

        // Load items and calculate previously exchanged quantities
        $order->load(['items.pharmacyProduct.product', 'exchanges.returnedItems']);

        if ($order->exchanges && $order->exchanges->isNotEmpty()) {
            return [
                'eligible' => false,
                'reason' => 'This order has already been exchanged and cannot be exchanged again.',
                'items' => [],
            ];
        }

        $exchangedQuantities = [];
        foreach ($order->exchanges as $exchange) {
            foreach ($exchange->returnedItems as $retItem) {
                $exchangedQuantities[$retItem->order_item_id] = ($exchangedQuantities[$retItem->order_item_id] ?? 0) + $retItem->quantity;
            }
        }

        $items = [];
        $hasReturnableItems = false;

        foreach ($order->items as $item) {
            $alreadyReturned = $exchangedQuantities[$item->id] ?? 0;
            $maxReturnable = max(0, $item->quantity - $alreadyReturned);

            if ($maxReturnable > 0) {
                $hasReturnableItems = true;
            }

            $items[] = [
                'order_item_id' => $item->id,
                'pharmacy_product_id' => $item->pharmacy_product_id,
                'product_name' => $item->product_name,
                'purchased_quantity' => $item->quantity,
                'already_returned_quantity' => $alreadyReturned,
                'max_returnable_quantity' => $maxReturnable,
                'unit_price_snapshot' => (float) $item->unit_price_snapshot,
                'line_total' => (float) $item->line_total,
            ];
        }

        if (!$hasReturnableItems) {
            return [
                'eligible' => false,
                'reason' => 'All items in this order have already been returned or exchanged.',
                'items' => $items,
            ];
        }

        return [
            'eligible' => true,
            'reason' => null,
            'window_days' => $windowDays,
            'items' => $items,
        ];
    }

    /**
     * Process an item exchange transaction.
     */
    public function processExchange(array $data, $user): ItemExchange
    {
        if (!$user) {
            throw new \Exception("Unauthorized");
        }

        $orderId = $data['order_id'] ?? null;
        $order = Order::with(['items', 'exchanges.returnedItems'])
            ->where('id', $orderId)
            ->orWhere('order_number', $orderId)
            ->firstOrFail();

        if ($order->pharmacy_id !== $user->pharmacy_id) {
            throw new \Exception("Unauthorized: Order does not belong to your pharmacy.");
        }

        // Eligibility check
        $eligibility = $this->getOrderExchangeEligibility($order, $user);
        if (!$eligibility['eligible']) {
            throw new \Exception($eligibility['reason']);
        }

        $returnedItemsInput = $data['returned_items'] ?? [];
        $replacementItemsInput = $data['replacement_items'] ?? [];

        if (empty($returnedItemsInput)) {
            throw new \Exception("At least one returned item must be selected for exchange.");
        }

        if (empty($replacementItemsInput)) {
            throw new \Exception("At least one replacement item must be selected for exchange.");
        }

        return DB::transaction(function () use ($order, $returnedItemsInput, $replacementItemsInput, $data, $user) {
            // Build return item lookup map and validate quantities
            $orderItemsMap = $order->items->keyBy('id');

            $exchangedQuantities = [];
            foreach ($order->exchanges as $exchange) {
                foreach ($exchange->returnedItems as $retItem) {
                    $exchangedQuantities[$retItem->order_item_id] = ($exchangedQuantities[$retItem->order_item_id] ?? 0) + $retItem->quantity;
                }
            }

            $totalReturnedValue = 0.00;
            $preparedReturnedItems = [];

            foreach ($returnedItemsInput as $retInput) {
                $orderItemId = $retInput['order_item_id'];
                $returnQty = (int) ($retInput['quantity'] ?? 0);
                $condition = strtolower($retInput['condition'] ?? 'resalable');

                if ($returnQty <= 0) {
                    continue;
                }

                if (!$orderItemsMap->has($orderItemId)) {
                    throw new \Exception("Item ID {$orderItemId} does not belong to Order #{$order->order_number}.");
                }

                $orderItem = $orderItemsMap->get($orderItemId);
                $alreadyReturned = $exchangedQuantities[$orderItemId] ?? 0;
                $maxReturnable = $orderItem->quantity - $alreadyReturned;

                if ($returnQty > $maxReturnable) {
                    throw new \Exception("Cannot return {$returnQty} units of {$orderItem->product_name}. Only {$maxReturnable} units are eligible.");
                }

                $unitPrice = (float) $orderItem->unit_price_snapshot;
                $subtotal = round($unitPrice * $returnQty, 2);
                $totalReturnedValue += $subtotal;

                $preparedReturnedItems[] = [
                    'order_item' => $orderItem,
                    'pharmacy_product_id' => $orderItem->pharmacy_product_id,
                    'quantity' => $returnQty,
                    'unit_price_snapshot' => $unitPrice,
                    'subtotal' => $subtotal,
                    'condition' => in_array($condition, ['resalable', 'damaged', 'expired']) ? $condition : 'resalable',
                ];
            }

            if (empty($preparedReturnedItems)) {
                throw new \Exception("Valid returned items with quantity > 0 are required.");
            }

            // Validate replacement items stock & calculate replacement total
            $totalReplacementValue = 0.00;
            $preparedReplacementItems = [];

            foreach ($replacementItemsInput as $repInput) {
                $productId = $repInput['pharmacy_product_id'] ?? $repInput['id'] ?? null;
                $repQty = (int) ($repInput['quantity'] ?? $repInput['qty'] ?? 0);

                if ($repQty <= 0) {
                    continue;
                }

                $pharmacyProduct = PharmacyProduct::with('product')->where('pharmacy_id', $user->pharmacy_id)->findOrFail($productId);

                if ($pharmacyProduct->stock < $repQty) {
                    $prodName = $pharmacyProduct->product->product_name ?? 'Item';
                    throw new \Exception("Insufficient stock for replacement product {$prodName}. Requested: {$repQty}, Available: {$pharmacyProduct->stock}");
                }

                $unitPrice = (float) $pharmacyProduct->selling_price;
                $subtotal = round($unitPrice * $repQty, 2);
                $totalReplacementValue += $subtotal;

                $preparedReplacementItems[] = [
                    'pharmacy_product' => $pharmacyProduct,
                    'quantity' => $repQty,
                    'unit_price_snapshot' => $unitPrice,
                    'subtotal' => $subtotal,
                ];
            }

            if (empty($preparedReplacementItems)) {
                throw new \Exception("Valid replacement items with quantity > 0 are required.");
            }

            // Calculate payment breakdown
            $netDifference = round($totalReplacementValue - $totalReturnedValue, 2);

            $additionalPayment = 0.00;
            $amountReceived = 0.00;
            $changeAmount = 0.00;

            if ($netDifference > 0) {
                $additionalPayment = $netDifference;
                $amountReceived = isset($data['amount_received']) ? (float) $data['amount_received'] : $additionalPayment;
                if ($amountReceived < $additionalPayment) {
                    throw new \Exception("Amount received (₱{$amountReceived}) is less than the additional payment required (₱{$additionalPayment}).");
                }
                $changeAmount = max(0, round($amountReceived - $additionalPayment, 2));
            } else {
                // NO CASH REFUND POLICY
                // Excess credit is forfeited (₱0.00 refund given to customer)
                $additionalPayment = 0.00;
                $amountReceived = 0.00;
                $changeAmount = 0.00;
            }

            $exchangeNumber = 'EXC-' . strtoupper(Str::random(10));

            // Create ItemExchange record
            $exchange = ItemExchange::create([
                'exchange_number' => $exchangeNumber,
                'order_id' => $order->id,
                'pharmacy_id' => $user->pharmacy_id,
                'processed_by' => $user->id,
                'total_returned_value' => round($totalReturnedValue, 2),
                'total_replacement_value' => round($totalReplacementValue, 2),
                'additional_payment' => $additionalPayment,
                'payment_method' => $data['payment_method'] ?? 'cash',
                'amount_received' => $amountReceived,
                'change_amount' => $changeAmount,
                'reason' => $data['reason'] ?? 'Item Exchange',
                'notes' => $data['notes'] ?? null,
            ]);

            // Process returned items stock & record DB rows
            foreach ($preparedReturnedItems as $retData) {
                ExchangeReturnedItem::create([
                    'item_exchange_id' => $exchange->id,
                    'order_item_id' => $retData['order_item']->id,
                    'pharmacy_product_id' => $retData['pharmacy_product_id'],
                    'quantity' => $retData['quantity'],
                    'unit_price_snapshot' => $retData['unit_price_snapshot'],
                    'subtotal' => $retData['subtotal'],
                    'condition' => $retData['condition'],
                ]);

                // Instantiating PharmacyProduct model and saving so Eloquent observer fires!
                $pharmacyProduct = PharmacyProduct::findOrFail($retData['pharmacy_product_id']);

                if ($retData['condition'] === 'resalable') {
                    $pharmacyProduct->stock += $retData['quantity'];
                    $pharmacyProduct->save();

                    $this->logService->logStockIn(
                        pharmacyId: $user->pharmacy_id,
                        pharmacyProductId: $pharmacyProduct->id,
                        batchId: null,
                        quantity: $retData['quantity'],
                        reason: "Item Exchange Return (Resalable): Order {$order->order_number}"
                    );
                } else {
                    // Damaged / Expired return: log waste entry without adding to active stock
                    $this->logService->logStockOut(
                        pharmacyId: $user->pharmacy_id,
                        pharmacyProductId: $pharmacyProduct->id,
                        batchId: null,
                        quantity: $retData['quantity'],
                        reason: "Item Exchange Return (" . ucfirst($retData['condition']) . "): Order {$order->order_number}"
                    );
                }
            }

            // Process replacement items stock & record DB rows
            foreach ($preparedReplacementItems as $repData) {
                ExchangeReplacementItem::create([
                    'item_exchange_id' => $exchange->id,
                    'pharmacy_product_id' => $repData['pharmacy_product']->id,
                    'quantity' => $repData['quantity'],
                    'unit_price_snapshot' => $repData['unit_price_snapshot'],
                    'subtotal' => $repData['subtotal'],
                ]);

                // Instantiating PharmacyProduct model and saving so Eloquent observer fires!
                $pharmacyProduct = $repData['pharmacy_product'];
                $pharmacyProduct->stock -= $repData['quantity'];
                $pharmacyProduct->save();

                $this->logService->logStockOut(
                    pharmacyId: $user->pharmacy_id,
                    pharmacyProductId: $pharmacyProduct->id,
                    batchId: null,
                    quantity: $repData['quantity'],
                    reason: "Item Exchange Replacement: Exchange {$exchangeNumber}"
                );
            }

            return $exchange->load([
                'order',
                'processedBy',
                'returnedItems.pharmacyProduct.product',
                'replacementItems.pharmacyProduct.product',
            ]);
        });
    }

    /**
     * Get details of a single exchange.
     */
    public function getExchangeDetails(int $exchangeId, $user): ItemExchange
    {
        $exchange = ItemExchange::with([
            'order.customer.user',
            'processedBy',
            'pharmacy',
            'returnedItems.pharmacyProduct.product',
            'returnedItems.orderItem',
            'replacementItems.pharmacyProduct.product',
        ])->findOrFail($exchangeId);

        if ($exchange->pharmacy_id !== $user->pharmacy_id) {
            throw new \Exception("Unauthorized access to exchange record.");
        }

        return $exchange;
    }

    /**
     * Get paginated exchange history for pharmacy.
     */
    public function getExchangeHistory(array $filters, $user)
    {
        $search = $filters['search'] ?? null;
        $perPage = $filters['per_page'] ?? 15;

        $query = ItemExchange::with([
            'order',
            'processedBy',
            'returnedItems.pharmacyProduct.product',
            'replacementItems.pharmacyProduct.product',
        ])->where('pharmacy_id', $user->pharmacy_id);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('exchange_number', 'like', "%{$search}%")
                  ->orWhereHas('order', function ($oq) use ($search) {
                      $oq->where('order_number', 'like', "%{$search}%");
                  });
            });
        }

        return $query->latest()->paginate($perPage);
    }

    /**
     * Convert H:i / H:i:s time string to minutes from midnight.
     */
    protected function timeToMinutes($time): int
    {
        if (!$time) return 0;
        if (is_numeric($time)) return (int) $time;
        try {
            $c = \Carbon\Carbon::parse($time);
            return ($c->hour * 60) + $c->minute;
        } catch (\Throwable $e) {
            return 0;
        }
    }
}
