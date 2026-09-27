<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Concerns\BelongsToPharmacy;
use Laravel\Scout\Searchable;

class PharmacyProduct extends Model
{
    use HasFactory, BelongsToPharmacy, Searchable;


    protected $table = 'pharmacy_products';

    protected $fillable = [
        'pharmacy_id',
        'product_id',
        'category_id',
        'stock',
        'unit_cost',
        'selling_price',
        'is_discountable',
        'is_available',
        'is_out_of_stock',
        'is_expired',
        'lead_time_days',
        'ordered_at',
    ];

    protected $casts = [
        'is_discountable' => 'boolean',
        'is_available' => 'boolean',
        'is_out_of_stock' => 'boolean',
        'is_expired' => 'boolean',
    ];

    public function pharmacy()
    {
        return $this->belongsTo(Pharmacy::class, 'pharmacy_id');
    }

    public function product()
    {
        return $this->belongsTo(Products::class)->withoutGlobalScopes();
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function batches()
    {
        return $this->hasMany(ProductBatch::class, 'pharmacy_product_id');
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class, 'pharmacy_product_id');
    }

    /**
     * Get the indexable data array for the model.
     *
     * @return array<string, mixed>
     */
    public function toSearchableArray(): array
    {
        $product = $this->product;
        $category = $this->category;

        return [
            'id' => (int) $this->id,
            'pharmacy_id' => (int) $this->pharmacy_id,
            'product_id' => (int) $this->product_id,
            'category_id' => (int) $this->category_id,
            'product_name' => (string) ($product?->product_name ?? ''),
            'generic_name' => (string) ($product?->generic_name ?? ''),
            'brand_name' => (string) ($product?->brand_name ?? ''),
            'description' => (string) ($product?->description ?? ''),
            'category_name' => (string) ($category?->category_name ?? ''),
            'stock' => (int) ($this->stock ?? 0),
            'selling_price' => (float) ($this->selling_price ?? 0),
            'is_available' => (bool) $this->is_available,
            'is_out_of_stock' => (bool) $this->is_out_of_stock,
            'is_expired' => (bool) $this->is_expired,
        ];
    }
}

