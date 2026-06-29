<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class InventoryUpdated
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public int $pharmacyId;

    /**
     * Create a new event instance.
     *
     * @param int $pharmacyId
     */
    public function __construct(int $pharmacyId)
    {
        $this->pharmacyId = $pharmacyId;
    }
}
