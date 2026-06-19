<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Conversation extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'pharmacy_id',
        'customer_user_id',
        'assigned_pharmacist_user_id',
        'status',
        'last_message_at',
        'closed_at',
    ];

    protected $casts = [
        'last_message_at' => 'datetime',
        'closed_at' => 'datetime',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function pharmacy(): BelongsTo
    {
        return $this->belongsTo(Pharmacy::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'customer_user_id');
    }

    public function assignedPharmacist(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_pharmacist_user_id');
    }

    public function pharmacist(): BelongsTo
    {
        return $this->assignedPharmacist();
    }

    public function messages(): HasMany
    {
        return $this->hasMany(ConversationMessage::class);
    }

    public function participants(): HasMany
    {
        return $this->hasMany(ConversationParticipant::class);
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(ConversationAssignment::class);
    }

    public function latestMessage(): HasOne
    {
        return $this->hasOne(ConversationMessage::class)->latestOfMany();
    }

    public function scopeForUser($query, User $user)
    {
        return $query->where(function ($builder) use ($user) {
            if ($user->role === 'customer') {
                $builder->where('customer_user_id', $user->id);
                return;
            }

            if (in_array($user->role, ['pharmacist', 'branch_admin', 'pharmacy_admin'], true)) {
                $builder->where('pharmacy_id', $user->pharmacy_id)
                    ->orWhere('assigned_pharmacist_user_id', $user->id);
            }
        });
    }
}