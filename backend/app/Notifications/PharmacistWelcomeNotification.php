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
        return (new MailMessage)
            ->subject('Welcome to PharmaDali – Your Account is Ready')
            ->greeting("Hello {$notifiable->first_name},")
            ->line('Your pharmacist account has been created. Below are your login credentials:')
            ->line("**Employee Number:** {$this->employeeNumber}")
            ->line("**Temporary Password:** {$this->temporaryPassword}")
            ->line('Please log in and change your password as soon as possible.')
            ->line('If you did not expect this email, please contact your branch administrator immediately.');
    }

    public function toArray(object $notifiable): array
    {
        return [];
    }
}
