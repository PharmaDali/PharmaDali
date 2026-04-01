<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Products extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_type',
        'product_name',
        'generic_name',
        'brand_name',
        'description',
        'form',
        'strength',
    ];

    public function branchProducts()
    {
        return $this->hasMany(BranchProduct::class, 'product_id');
    }

    public function categories()
    {
        return $this->belongsToMany(Category::class, 'branch_products', 'product_id', 'category_id')
            ->withPivot(['branch_id', 'stock', 'selling_price', 'is_available', 'expiry_date'])
            ->withTimestamps();
    }

    public function branches()
    {
        return $this->belongsToMany(Branch::class, 'branch_products', 'product_id', 'branch_id')
            ->withPivot(['category_id', 'stock', 'selling_price', 'is_available', 'expiry_date'])
            ->withTimestamps();
    }
}
