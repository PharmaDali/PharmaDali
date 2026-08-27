<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

use App\Enums\PrescriptionStatus;

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

    protected $casts = [
        'status' => PrescriptionStatus::class,
        'verified_at' => 'datetime',
    ];

    public function orderItem()
    {
        return $this->belongsTo(OrderItem::class);
    }

    public function verifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }
}
