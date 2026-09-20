<?php

namespace App\Enums;

enum TransactionType: string
{
    case STOCK_IN = 'stock_in';
    case STOCK_OUT = 'stock_out';
    case ADJUSTMENT = 'adjustment';
    case WASTE = 'waste';
    case PRODUCT_DELETED = 'product_deleted';

    public function label(): string
    {
        return match($this) {
            self::STOCK_IN => 'Stock In',
            self::STOCK_OUT => 'Stock Out',
            self::ADJUSTMENT => 'Adjustment',
            self::WASTE => 'Waste',
            self::PRODUCT_DELETED => 'Product Deleted',
        };
    }
}
