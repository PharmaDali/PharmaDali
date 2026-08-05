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

        // If the token is an Expo Push Token, send via Expo Push API
        if (str_starts_with($user->fcm_token, 'ExponentPushToken') || str_starts_with($user->fcm_token, 'ExpoPushToken')) {
            $this->sendExpoPushNotification($user->fcm_token, $title, $body, $data);
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

    private function sendExpoPushNotification(string $token, string $title, string $body, array $data = []): void
    {
        try {
            $response = \Illuminate\Support\Facades\Http::post('https://exp.host/--/api/v2/push/send', [
                'to' => $token,
                'title' => $title,
                'body' => $body,
                'data' => $data,
                'sound' => 'default',
                'priority' => 'high',
            ]);

            \Log::info('Expo Push Notification Sent', [
                'token' => $token,
                'title' => $title,
                'status' => $response->status(),
                'response' => $response->json(),
            ]);
        } catch (\Exception $e) {
            \Log::error('Expo Push Notification Error: ' . $e->getMessage());
        }
    }
}
