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
        'hero_title',
        'hero_subtitle_template',
        'is_enabled',
        'background_color',
        'font_color',
    ];

    protected $casts = [
        'is_enabled' => 'boolean',
    ];

    public function formatHeroSubtitle(string $productName): string
    {
        $template = $this->hero_subtitle_template
            ?: "Based on your recent purchase of {product_name}, here are complementary items you might like";
        return str_replace(['{product_name}', ':product_name'], $productName, $template);
    }

    public function pharmacyCategories()
    {
        return $this->hasMany(PharmacyCategory::class);
    }

    public function pharmacyProducts()
    {
        return $this->hasMany(PharmacyProduct::class);
    }

    public function pharmacies()
    {
        return $this->belongsToMany(Pharmacy::class, 'pharmacy_products', 'category_id', 'pharmacy_id')
            ->withPivot(['product_id', 'stock', 'selling_price', 'is_available'])
            ->withTimestamps();
    }

    public function products()
    {
        return $this->belongsToMany(Products::class, 'pharmacy_products', 'category_id', 'product_id')
            ->withPivot(['pharmacy_id', 'stock', 'selling_price', 'is_available'])
            ->withTimestamps();
    }
}
