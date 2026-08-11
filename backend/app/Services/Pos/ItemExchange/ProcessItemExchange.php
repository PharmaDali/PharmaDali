<?php

namespace App\Services\Pos\ItemExchange;

use App\Models\Order;
use App\Models\ItemExchange;
use App\Services\Pos\ItemExchange\Actions\ValidateReturnItems;
use App\Services\Pos\ItemExchange\Actions\ValidateReplacementItems;
use App\Services\Pos\ItemExchange\Actions\CalculateExchangeBalance;
use App\Services\Pos\ItemExchange\Actions\ProcessReturnedStock;
use App\Services\Pos\ItemExchange\Actions\ProcessReplacementStock;
use App\Events\ItemExchanged;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProcessItemExchange
{
    public function __construct(
        private readonly GetOrderExchangeEligibility $eligibilityAction,
        private readonly ValidateReturnItems $validateReturnItems,
        private readonly ValidateReplacementItems $validateReplacementItems,
        private readonly CalculateExchangeBalance $calculateExchangeBalance,
        private readonly ProcessReturnedStock $processReturnedStock,
        private readonly ProcessReplacementStock $processReplacementStock,
    ) {}

    /**
     * Process an item exchange transaction.
     */
    public function execute(array $data, $user): ItemExchange
    {
        if (!$user) {
            throw new \Exception("Unauthorized");
        }

        $orderId = $data['order_id'] ?? null;
        $order = Order::with(['items', 'exchanges.returnedItems'])
            ->where('id', $orderId)
            ->orWhere('order_number', $orderId)
            ->firstOrFail();

        $pharmacyId = (int) ($user->pharmacy_id ?? $user->pharmacy?->id ?? $order->pharmacy_id);

        if ((int) $order->pharmacy_id !== $pharmacyId) {
            throw new \Exception("Unauthorized: Order does not belong to your pharmacy.");
        }

        // Eligibility check
        $eligibility = $this->eligibilityAction->execute($order, $user);
        if (!$eligibility['eligible']) {
            throw new \Exception($eligibility['reason']);
        }

        $exchange = DB::transaction(function () use ($order, $data, $user, $pharmacyId) {
            $returns = $this->validateReturnItems->execute($order, $data['returned_items'] ?? []);
            $replacements = $this->validateReplacementItems->execute($pharmacyId, $data['replacement_items'] ?? []);
            $payment = $this->calculateExchangeBalance->execute($returns['totalValue'], $replacements['totalValue'], $data);

            $exchangeNumber = 'EXC-' . strtoupper(Str::random(10));

            $createdExchange = ItemExchange::create([
                'exchange_number' => $exchangeNumber,
                'order_id' => $order->id,
                'pharmacy_id' => $pharmacyId,
                'processed_by' => $user->id,
                'total_returned_value' => round($returns['totalValue'], 2),
                'total_replacement_value' => round($replacements['totalValue'], 2),
                'additional_payment' => $payment['additionalPayment'],
                'payment_method' => $data['payment_method'] ?? 'cash',
                'amount_received' => $payment['amountReceived'],
                'change_amount' => $payment['changeAmount'],
                'reason' => $data['reason'] ?? 'Item Exchange',
                'notes' => $data['notes'] ?? null,
            ]);

            $this->processReturnedStock->execute($createdExchange, $returns['items'], $pharmacyId, $order);
            $this->processReplacementStock->execute($createdExchange, $replacements['items'], $pharmacyId, $exchangeNumber);

            return $createdExchange->load([
                'order',
                'processedBy',
                'returnedItems.pharmacyProduct.product',
                'replacementItems.pharmacyProduct.product',
            ]);
        });

        // Dispatch ItemExchanged event
        ItemExchanged::dispatch($exchange);

        return $exchange;
    }
}
