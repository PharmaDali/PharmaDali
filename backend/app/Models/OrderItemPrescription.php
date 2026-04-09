<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItemPrescription extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_item_id',
        'prescription_image_path',
        'verified_by',
        'verified_at',
        'status',
        'rejection_reason',
    ];

    public function orderItem()
    {
        return $this->belongsTo(OrderItem::class);
    }
}
