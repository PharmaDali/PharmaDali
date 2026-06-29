<?php

namespace App\Listeners;

use App\Events\InventoryUpdated;
use App\Services\Inventory\RestockPredictorService;

class ClearPriorityRestocksCache
{
    /**
     * Create the event listener.
     */
    public function __construct(
        private readonly RestockPredictorService $restockPredictorService
    ) {}

    /**
     * Handle the event.
     *
     * @param  \App\Events\InventoryUpdated  $event
     * @return void
     */
    public function handle(InventoryUpdated $event): void
    {
        $this->restockPredictorService->clearPriorityRestocksCache($event->pharmacyId);
    }
}
