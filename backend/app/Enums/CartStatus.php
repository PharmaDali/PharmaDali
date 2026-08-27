<?php

namespace App\Enums;

enum CartStatus: string
{
    case ACTIVE = 'active';
    case COMPLETED = 'completed';

    public function label(): string
    {
        return match($this) {
            self::ACTIVE => 'Active',
            self::COMPLETED => 'Completed',
        };
    }
}
