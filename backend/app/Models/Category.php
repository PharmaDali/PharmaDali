<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{

    use HasFactory;

    protected $fillable = [
        'category_name',
        'description',
    ];

    public function pharmacyProducts()
    {
        return $this->hasMany(PharmacyProduct::class);
    }

    public function pharmacies()
    {
        return $this->belongsToMany(Pharmacy::class, 'pharmacy_products', 'category_id', 'pharmacy_id')
            ->withPivot(['product_id', 'stock', 'selling_price', 'is_available', 'expiry_date'])
            ->withTimestamps();
    }

    public function products()
    {
        return $this->belongsToMany(Products::class, 'pharmacy_products', 'category_id', 'product_id')
            ->withPivot(['pharmacy_id', 'stock', 'selling_price', 'is_available', 'expiry_date'])
            ->withTimestamps();
    }
}
