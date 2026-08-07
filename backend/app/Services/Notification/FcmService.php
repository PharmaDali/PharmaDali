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

        $stringData = array_map(function ($val) {
            return is_null($val) ? '' : (string) $val;
        }, $data);

        try {
            $credentialsPath = storage_path('app/firebase/service-account.json');
            if (!file_exists($credentialsPath)) {
                $credentialsPath = storage_path('firebase/service-account.json');
            }

            if (!file_exists($credentialsPath)) {
                \Log::warning("Firebase service-account.json missing. Falling back to Expo Push.");
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
                'android' => [
                    'priority' => 'high',
                    'notification' => [
                        'channel_id' => 'default',
                    ],
                ],
                'data' => $stringData,
            ]);

            $messaging->send($message);
            \Log::info('Direct FCM Push Notification Sent via Firebase', [
                'token' => $user->fcm_token,
                'title' => $title,
            ]);
        } catch (\Throwable $e) {
            \Log::error('FCM Send Error: ' . $e->getMessage());
            if (str_contains($e->getMessage(), 'requested entity was not found')) {
                $user->update(['fcm_token' => null]);
            }
        }
    }

    private function sendExpoPushNotification(string $token, string $title, string $body, array $data = []): void
    {
        try {
            $payload = [
                'to' => $token,
                'title' => $title,
                'body' => $body,
                'data' => $data,
                'sound' => 'default',
                'priority' => 'high',
                'channelId' => 'default',
                'badge' => 1,
            ];

            $response = \Illuminate\Support\Facades\Http::withHeaders([
                'Accept' => 'application/json',
                'Accept-Encoding' => 'gzip, deflate',
                'Content-Type' => 'application/json',
            ])->post('https://exp.host/--/api/v2/push/send', $payload);

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
