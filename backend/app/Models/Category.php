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

    public function branchProducts()
    {
        return $this->hasMany(BranchProduct::class);
    }

    public function branches()
    {
        return $this->belongsToMany(Branch::class, 'branch_products')
            ->withPivot(['product_id', 'stock', 'selling_price', 'is_available', 'expiry_date'])
            ->withTimestamps();
    }

    public function products()
    {
        return $this->belongsToMany(Products::class, 'branch_products')
            ->withPivot(['branch_id', 'stock', 'selling_price', 'is_available', 'expiry_date'])
            ->withTimestamps();
    }
}
