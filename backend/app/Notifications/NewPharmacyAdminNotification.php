<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewPharmacyAdminNotification extends Notification
{
    use Queueable;

    public function __construct(public string $password)
    {
        //
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
        return (new MailMessage)
            ->subject('Welcome to Pharmadali Admin Dashboard')
            ->greeting("Hello {$notifiable->first_name},")
            ->line('An account has been created for you as a Pharmacy Admin.')
            ->line("Your temporary password is: {$this->password}")
            ->line('Please log in and change your password as soon as possible.')
            ->action('Login to Dashboard', url(config('app.frontend_url') ?? 'http://admin.pharmadali.local'))
            ->line('Thank you for using our application!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            //
        ];
    }
}
