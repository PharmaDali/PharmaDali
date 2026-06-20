<?php

namespace App\Events;

use App\Models\ConversationMessage;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Spatie\Multitenancy\Jobs\NotTenantAware;

class ConversationMessageCreated implements ShouldBroadcast, NotTenantAware
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public ConversationMessage $message)
    {
        $this->message->load(['sender', 'conversation']);
    }

    public function broadcastOn(): array
    {
        $channels = [];

        if ($this->message->visibility !== 'staff_only') {
            $channels[] = new PrivateChannel('conversations.' . $this->message->conversation_id);
            $channels[] = new PrivateChannel('conversations.' . $this->message->conversation_id . '.staff');
        }

        if (in_array($this->message->message_type, ['internal_note', 'system'], true) || $this->message->visibility === 'staff_only') {
            $channels[] = new PrivateChannel('conversations.' . $this->message->conversation_id . '.staff');
        }

        return $channels;
    }

    public function broadcastAs(): string
    {
        return 'conversation.message.created';
    }

    public function broadcastWith(): array
    {
        return [
            'conversation_id' => $this->message->conversation_id,
            'message' => [
                'id' => $this->message->id,
                'conversation_id' => $this->message->conversation_id,
                'sender_user_id' => $this->message->sender_user_id,
                'message_type' => $this->message->message_type,
                'visibility' => $this->message->visibility,
                'body' => $this->message->body,
                'metadata' => $this->message->metadata,
                'read_at' => $this->message->read_at,
                'created_at' => $this->message->created_at,
                'sender' => $this->message->sender,
            ],
        ];
    }
}