<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ProductBatch extends Model
{
    use HasFactory;

    protected $fillable = [
        'pharmacy_product_id',
        'batch_number',
        'stock',
        'expiry_date',
        'manufactured_date',
        'received_at',
    ];

    protected $casts = [
        'expiry_date'      => 'date',
        'manufactured_date'=> 'date',
        'received_at'      => 'datetime',
        'stock'            => 'integer',
    ];

    public function pharmacyProduct()
    {
        return $this->belongsTo(PharmacyProduct::class);
    }
}
