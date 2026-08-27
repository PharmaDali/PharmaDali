<?php

namespace App\Enums;

enum OrderStatus: string
{
    case PENDING = 'pending';
    case REVIEWING = 'reviewing';
    case PREPARING = 'preparing';
    case READY_FOR_PICKUP = 'ready_for_pickup';
    case COMPLETED = 'completed';
    case OVERDUE = 'overdue';
    case CANCELLED = 'cancelled';
    case STAND_BY = 'stand_by';

    public function label(): string
    {
        return match($this) {
            self::PENDING => 'Pending',
            self::REVIEWING => 'Reviewing',
            self::PREPARING => 'Preparing',
            self::READY_FOR_PICKUP => 'Ready for Pickup',
            self::COMPLETED => 'Completed',
            self::OVERDUE => 'Overdue',
            self::CANCELLED => 'Cancelled',
            self::STAND_BY => 'Stand By',
        };
    }
}
