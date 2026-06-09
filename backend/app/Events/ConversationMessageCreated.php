<?php

namespace App\Events;

use App\Models\ConversationMessage;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ConversationMessageCreated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public ConversationMessage $message)
    {
        $this->message->load(['sender', 'conversation']);
    }

    public function broadcastOn(): array
    {
        return [new PrivateChannel('conversations.' . $this->message->conversation_id)];
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
                'body' => $this->message->body,
                'read_at' => $this->message->read_at,
                'created_at' => $this->message->created_at,
                'sender' => $this->message->sender,
            ],
        ];
    }
}