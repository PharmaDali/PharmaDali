<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CustomerForgotPasswordOtpNotification extends Notification
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
        $name = $notifiable->first_name ?? 'Customer';

        return (new MailMessage)
            ->subject('Password Reset OTP - Pharmadali')
            ->greeting("Hello {$name},")
            ->line('You recently requested to reset your password for your Pharmadali customer account.')
            ->line("Your One-Time Password (OTP) is:")
            ->line("# {$this->otp}")
            ->line('This code is valid for 5 minutes. Please do not share this code with anyone.')
            ->line('If you did not request a password reset, please ignore this email or contact support.');
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
