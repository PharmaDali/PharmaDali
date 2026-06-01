<?php

namespace App\Services\Notification;

use Kreait\Firebase\Messaging\CloudMessage;
use Kreait\Firebase\Messaging\Notification;
use App\Models\User;

class FcmService
{
    public function sendPushNotification(User $user, string $title, string $body, array $data = [])
    {
        if (!$user->fcm_token) {
            return;
        }

        $messaging = app('firebase.messaging');

        $message = CloudMessage::fromArray([
            'token' => $user->fcm_token,
            'notification' => [
                'title' => $title,
                'body' => $body,
            ],
            'data' => $data,
        ]);

        try {
            $messaging->send($message);
        } catch (\Exception $e) {
            \Log::error('FCM Send Error: ' . $e->getMessage());
            // If token is invalid, clear it
            if (str_contains($e->getMessage(), 'requested entity was not found')) {
                $user->update(['fcm_token' => null]);
            }
        }
    }
}
