<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasOne;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'pharmacy_product_id',
        'quantity',
        'unit_price_snapshot',
        'line_total',
        'product_name',
    ];

    protected $casts = [
        'unit_price_snapshot' => 'decimal:2',
        'line_total' => 'decimal:2',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function pharmacyProduct()
    {
        return $this->belongsTo(PharmacyProduct::class);
    }

    public function orderItemPrescription(): HasOne
    {
        return $this->hasOne(OrderItemPrescription::class);
    }
}
