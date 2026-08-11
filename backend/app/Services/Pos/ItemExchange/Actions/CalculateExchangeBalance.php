<?php

namespace App\Services\Pos\ItemExchange\Actions;

class CalculateExchangeBalance
{
    /**
     * Calculate financial balance breakdown under No Cash Refund policy.
     */
    public function execute(float $totalReturnedValue, float $totalReplacementValue, array $data): array
    {
        $netDifference = round($totalReplacementValue - $totalReturnedValue, 2);

        if ($netDifference > 0) {
            $additionalPayment = $netDifference;
            $amountReceived = isset($data['amount_received']) ? (float) $data['amount_received'] : $additionalPayment;
            if ($amountReceived < $additionalPayment) {
                throw new \Exception("Amount received (₱{$amountReceived}) is less than the additional payment required (₱{$additionalPayment}).");
            }
            $changeAmount = max(0, round($amountReceived - $additionalPayment, 2));
        } else {
            // NO CASH REFUND POLICY
            $additionalPayment = 0.00;
            $amountReceived = 0.00;
            $changeAmount = 0.00;
        }

        return [
            'additionalPayment' => $additionalPayment,
            'amountReceived' => $amountReceived,
            'changeAmount' => $changeAmount,
        ];
    }
}
