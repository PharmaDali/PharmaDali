<?php

namespace App\Policies;

use App\Models\Conversation;
use App\Models\Order;
use App\Models\User;

class ConversationPolicy
{
    public function view(User $user, Conversation $conversation): bool
    {
        if ($user->role === 'customer') {
            return (int) $conversation->customer_user_id === (int) $user->id;
        }

        if (in_array($user->role, ['pharmacist', 'branch_admin'], true)) {
            return $conversation->pharmacy_id !== null
                && (int) $conversation->pharmacy_id === (int) $user->branch_id;
        }

        return false;
    }

    public function createForOrder(User $user, Order $order): bool
    {
        if ($user->role === 'customer') {
            return $user->customer && (int) $user->customer->id === (int) $order->customer_id;
        }

        if (in_array($user->role, ['pharmacist', 'branch_admin'], true)) {
            return $user->branch_id !== null && (int) $user->branch_id === (int) $order->branch_id;
        }

        return false;
    }

    public function sendMessage(User $user, Conversation $conversation): bool
    {
        return $this->view($user, $conversation);
    }

    public function addInternalNote(User $user, Conversation $conversation): bool
    {
        return in_array($user->role, ['pharmacist', 'branch_admin'], true)
            && $this->view($user, $conversation);
    }

    public function assign(User $user, Conversation $conversation): bool
    {
        return in_array($user->role, ['pharmacist', 'branch_admin'], true)
            && $this->view($user, $conversation);
    }
}
