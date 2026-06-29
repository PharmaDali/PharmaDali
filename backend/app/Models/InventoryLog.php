<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Concerns\BelongsToPharmacy;

class InventoryLog extends Model
{
    use HasFactory, BelongsToPharmacy;

    protected $fillable = [
        'pharmacy_id',
        'pharmacy_product_id',
        'product_batch_id',
        'user_id',
        'transaction_type',
        'quantity',
        'reason',
    ];

    public function pharmacyProduct()
    {
        return $this->belongsTo(PharmacyProduct::class);
    }

    public function batch()
    {
        return $this->belongsTo(ProductBatch::class, 'product_batch_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
