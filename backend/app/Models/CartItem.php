<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CartItem extends Model
{
    protected $fillable = [
        'cart_id',
        'pharmacy_product_id',
        'quantity',
        'price_snapshot',
    ];

    public function cart()
    {
        return $this->belongsTo(Cart::class);
    }

    public function pharmacyProduct()
    {
        return $this->belongsTo(PharmacyProduct::class, 'pharmacy_product_id');
    }
}
