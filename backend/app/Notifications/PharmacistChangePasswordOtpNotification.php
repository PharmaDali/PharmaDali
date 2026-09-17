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
            ->line(new \Illuminate\Support\HtmlString('
<div style="margin: 24px 0; text-align: center;">
    <div style="display: inline-block; background-color: #f0f9ff; border: 2px dashed #2aabe2; border-radius: 12px; padding: 14px 28px; text-align: center;">
        <span style="font-family: \'Courier New\', Courier, monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #0284c7; display: block;">' . e($this->otp) . '</span>
    </div>
    <div style="margin-top: 8px; font-size: 12px; color: #64748b; font-weight: 500;">Valid for 5 minutes • Keep this code confidential</div>
</div>
'))
            ->line('If you did not request a password change, please contact your system administrator immediately.')
            ->salutation("Warm regards,\nThe PharmaDali Team");
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
