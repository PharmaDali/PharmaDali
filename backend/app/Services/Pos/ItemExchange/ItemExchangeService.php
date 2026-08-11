<?php

namespace App\Services\Pos\ItemExchange;

use App\Models\ItemExchange;
use App\Models\Order;
use Illuminate\Pagination\LengthAwarePaginator;

class ItemExchangeService
{
    public function __construct(
        private readonly GetOrderExchangeEligibility $eligibilityAction,
        private readonly ProcessItemExchange $processExchangeAction,
        private readonly GetExchangeDetails $getDetailsAction,
        private readonly GetExchangeHistory $getHistoryAction,
    ) {}

    /**
     * Check exchange eligibility for an order.
     */
    public function getEligibility(Order $order, $user): array
    {
        return $this->eligibilityAction->execute($order, $user);
    }

    /**
     * Process an item exchange transaction.
     */
    public function process(array $data, $user): ItemExchange
    {
        return $this->processExchangeAction->execute($data, $user);
    }

    /**
     * Get details for a specific exchange record.
     */
    public function getDetails(int $id, $user): ItemExchange
    {
        return $this->getDetailsAction->execute($id, $user);
    }

    /**
     * Get paginated exchange history for pharmacy.
     */
    public function getHistory(array $filters, $user): LengthAwarePaginator
    {
        return $this->getHistoryAction->execute($filters, $user);
    }
}
