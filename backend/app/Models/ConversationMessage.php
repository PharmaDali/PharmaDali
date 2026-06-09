<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;
use App\Models\User;
use Illuminate\Support\Str;

class ConversationMessage extends Model
{
    use HasFactory;

    protected $fillable = [
        'conversation_id',
        'sender_user_id',
        'message_type',
        'visibility',
        'body',
        'metadata',
        'read_at',
    ];

    protected $casts = [
        'read_at' => 'datetime',
        'metadata' => 'array',
    ];

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class);
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_user_id');
    }

    public function scopeVisibleTo(Builder $query, User $user): Builder
    {
        if ($user->role === 'customer') {
            return $query->where(function ($builder) {
                $builder->where('visibility', 'public')
                    ->orWhere('message_type', 'system');
            });
        }

        return $query;
    }

    public function isInternalNote(): bool
    {
        return $this->message_type === 'internal_note' || $this->visibility === 'staff_only';
    }

    public function isSystemMessage(): bool
    {
        return $this->message_type === 'system';
    }
}