<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use App\Models\Concerns\BelongsToPharmacy;

class Products extends Model
{
    use HasFactory, BelongsToPharmacy;

    protected $fillable = [
        'pharmacy_id',
        'product_type',
        'product_name',
        'generic_name',
        'brand_name',
        'description',
        'form',
        'strength',
        'size',
        'is_prescribed',
    ];

    public function pharmacyProducts()
    {
        return $this->hasMany(PharmacyProduct::class, 'product_id');
    }

    public function categories()
    {
        return $this->belongsToMany(Category::class, 'pharmacy_products', 'product_id', 'category_id')
            ->withPivot(['pharmacy_id', 'stock', 'selling_price', 'is_available'])
            ->withTimestamps();
    }

    public function pharmacies()
    {
        return $this->belongsToMany(Pharmacy::class, 'pharmacy_products', 'product_id', 'pharmacy_id')
            ->withPivot(['category_id', 'stock', 'selling_price', 'is_available'])
            ->withTimestamps();
    }
}
