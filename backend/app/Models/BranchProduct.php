<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class BranchProduct extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'branch_id',
        'product_id',
        'category_id',
        'stock',
        'selling_price',
        'is_discountable',
        'is_available',
        'expiry_date',
    ];

    public function branch()
    {
        return $this->belongsTo(Branch::class);
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
        return $this->hasMany(ProductBatch::class);
    }
}
