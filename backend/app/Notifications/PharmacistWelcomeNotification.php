<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PharmacistWelcomeNotification extends Notification
{
    use Queueable;

    public function __construct(
        private string $employeeNumber,
        private string $temporaryPassword,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $downloadUrl = url('/download/pharmacist-app');
        $firstName   = $notifiable->first_name ?? 'Pharmacist';
        $baseUrl     = rtrim(config('app.url'), '/');

        $intentUrl = 'intent://'
            . parse_url($downloadUrl, PHP_URL_HOST)
            . parse_url($downloadUrl, PHP_URL_PATH)
            . '#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url='
            . rawurlencode($downloadUrl)
            . ';end';

        return (new MailMessage)
            ->subject('Welcome to PharmaDali – Your Account & Mobile App are Ready')
            ->view('emails.pharmacist_welcome', [
                'firstName'         => $firstName,
                'employeeNumber'    => $this->employeeNumber,
                'temporaryPassword' => $this->temporaryPassword,
                'downloadUrl'       => $downloadUrl,
                'intentUrl'         => $intentUrl,
                'smartphoneIcon'    => $baseUrl . '/images/icons/smartphone_white.png',
                'downloadIcon'      => $baseUrl . '/images/icons/download_white.png',
                'idIcon'            => $baseUrl . '/images/icons/id_badge.png',
                'keyIcon'           => $baseUrl . '/images/icons/key.png',
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [];
    }
}
