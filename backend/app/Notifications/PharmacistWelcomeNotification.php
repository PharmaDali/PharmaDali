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

        return (new MailMessage)
            ->subject('Welcome to PharmaDali – Your Account & Mobile App are Ready')
            ->markdown('emails.pharmacist_welcome', [
                'firstName'         => $firstName,
                'employeeNumber'    => $this->employeeNumber,
                'temporaryPassword' => $this->temporaryPassword,
                'downloadUrl'       => $downloadUrl,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [];
    }
}
