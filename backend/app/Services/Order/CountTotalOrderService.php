<?php

namespace App\Services\Order;

use App\Models\Order;

class CountTotalOrderService
{
    public function handle(): int
    {
        return Order::count();
    }
}