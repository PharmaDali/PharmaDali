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
            $rawAmount = $data['amount_received'] ?? null;
            $amountReceived = ($rawAmount !== null && $rawAmount !== '') ? (float) $rawAmount : $additionalPayment;

            if ($amountReceived < $additionalPayment) {
                $formattedReceived = number_format($amountReceived, 2);
                $formattedRequired = number_format($additionalPayment, 2);
                throw new \Exception("Amount received (PHP {$formattedReceived}) is less than the additional payment required (PHP {$formattedRequired}).");
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
