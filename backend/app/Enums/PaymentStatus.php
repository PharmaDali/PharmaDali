<?php

namespace App\Enums;

enum PaymentStatus: string
{
    case UNPAID = 'unpaid';
    case PAID = 'paid';
    case FAILED = 'failed';

    public function label(): string
    {
        return match($this) {
            self::UNPAID => 'Unpaid',
            self::PAID => 'Paid',
            self::FAILED => 'Failed',
        };
    }
}
