<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Discount extends Model
{
    use HasFactory;

    protected $fillable = [
        'pharmacy_id',
        'name',
        'code',
        'percentage',
        'requires_id_number',
        'is_active',
        'description',
    ];

    protected $casts = [
        'percentage' => 'float',
        'requires_id_number' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function pharmacy(): BelongsTo
    {
        return $this->belongsTo(Pharmacy::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
