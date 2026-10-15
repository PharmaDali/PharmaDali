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

    protected $appends = [
        'is_reuploaded',
        'prescription_image_url',
        'image_url',
        'image_path',
    ];

    public function getPrescriptionImageUrlAttribute(): ?string
    {
        if (!$this->prescription_image_path) {
            return null;
        }

        return app(\App\Services\Media\PrivateMediaUrlGenerator::class)->generateUrl($this->prescription_image_path);
    }

    public function getImagePathAttribute(): ?string
    {
        return $this->prescription_image_path;
    }

    public function getImageUrlAttribute(): ?string
    {
        return $this->prescription_image_url;
    }

    public function getIsReuploadedAttribute(): bool
    {
        return (bool) ($this->updated_at && $this->created_at && $this->updated_at->gt($this->created_at));
    }

    public function orderItem()
    {
        return $this->belongsTo(OrderItem::class);
    }

    public function verifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }
}
