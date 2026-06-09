<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Conversation extends Model
{
    protected $fillable = [
        'branch_id',
        'customer_user_id',
        'pharmacist_user_id',
        'last_message_at',
    ];

    protected $casts = [
        'last_message_at' => 'datetime',
    ];

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'customer_user_id');
    }

    public function pharmacist(): BelongsTo
    {
        return $this->belongsTo(User::class, 'pharmacist_user_id');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(ConversationMessage::class);
    }

    public function latestMessage(): HasOne
    {
        return $this->hasOne(ConversationMessage::class)->latestOfMany();
    }

    public function scopeForUser($query, User $user)
    {
        return $query->where(function ($builder) use ($user) {
            $builder->where('customer_user_id', $user->id)
                ->orWhere('pharmacist_user_id', $user->id);
        });
    }
}