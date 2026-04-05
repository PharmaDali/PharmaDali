<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CartItem extends Model
{
    protected $fillable = [
        'cart_id',
        'product_id',
        'quantity',
        'price_snapshot',
    ];

    public function cart()
    {
        return $this->belongsTo(Cart::class);
    }

    public function branchProduct()
    {
        return $this->belongsTo(BranchProduct::class, 'product_id');
    }
}
