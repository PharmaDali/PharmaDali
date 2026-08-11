<?php

namespace App\Events;

use App\Models\ItemExchange;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ItemExchanged
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly ItemExchange $exchange
    ) {}
}
