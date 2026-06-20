<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Concerns\BelongsToTenant;

class PharmacyProduct extends Model
{
    use HasFactory, BelongsToTenant;

    protected $table = 'pharmacy_products';

    protected $fillable = [
        'pharmacy_id',
        'product_id',
        'category_id',
        'stock',
        'selling_price',
        'is_discountable',
        'is_available',
        'expiry_date',
    ];

    public function pharmacy()
    {
        return $this->belongsTo(Pharmacy::class, 'pharmacy_id');
    }

    public function product()
    {
        return $this->belongsTo(Products::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function batches()
    {
        return $this->hasMany(ProductBatch::class, 'pharmacy_product_id');
    }
}
