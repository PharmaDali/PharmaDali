<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AdminChangePasswordOtpNotification extends Notification
{
    use Queueable;

    public function __construct(public string $otp)
    {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $name = $notifiable->first_name ?? 'Admin';

        return (new MailMessage)
            ->subject('Password Change OTP - PharmaDali Admin')
            ->greeting("Hello {$name},")
            ->line('You requested to change your password for your PharmaDali Admin account.')
            ->line('Your One-Time Password (OTP) is:')
            ->line("# {$this->otp}")
            ->line('This code is valid for 5 minutes. Please do not share this code with anyone.')
            ->line('If you did not request a password change, please contact system administrator immediately.');
    }

    public function toArray(object $notifiable): array
    {
        return [];
    }
}
