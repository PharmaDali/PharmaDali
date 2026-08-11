<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ExchangeReturnedItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'item_exchange_id',
        'order_item_id',
        'pharmacy_product_id',
        'quantity',
        'unit_price_snapshot',
        'subtotal',
        'condition',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'unit_price_snapshot' => 'decimal:2',
        'subtotal' => 'decimal:2',
    ];

    public function exchange()
    {
        return $this->belongsTo(ItemExchange::class, 'item_exchange_id');
    }

    public function orderItem()
    {
        return $this->belongsTo(OrderItem::class);
    }

    public function pharmacyProduct()
    {
        return $this->belongsTo(PharmacyProduct::class);
    }
}
