<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PharmacistChangePasswordOtpNotification extends Notification
{
    use Queueable;

    public function __construct(public string $otp)
    {
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $name = $notifiable->first_name ?? 'Pharmacist';

        return (new MailMessage)
            ->subject('Password Change OTP - PharmaDali')
            ->greeting("Hello {$name},")
            ->line('You requested to change your password for your PharmaDali pharmacist account.')
            ->line('Your One-Time Password (OTP) is:')
            ->line("# {$this->otp}")
            ->line('This code is valid for 5 minutes. Please do not share this code with anyone.')
            ->line('If you did not request a password change, please contact your system administrator immediately.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [];
    }
}
