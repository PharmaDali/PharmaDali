<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\HtmlString;

class AdminTwoFactorOtpNotification extends Notification
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
            ->subject('Two-Factor Authentication Code - PharmaDali')
            ->greeting("Hello {$name},")
            ->line('You are logging in to your PharmaDali administrative account.')
            ->line('Your Two-Factor Authentication (2FA) verification code is:')
            ->line(new HtmlString('
<div style="margin: 24px 0; text-align: center;">
    <div style="display: inline-block; background-color: #f0f9ff; border: 2px dashed #2aabe2; border-radius: 12px; padding: 14px 28px; text-align: center;">
        <span style="font-family: \'Courier New\', Courier, monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #0284c7; display: block;">' . e($this->otp) . '</span>
    </div>
    <div style="margin-top: 8px; font-size: 12px; color: #64748b; font-weight: 500;">Valid for 5 minutes • Do not share this code with anyone</div>
</div>
'))
            ->line('If you did not attempt to log in, someone may know your password. Please reset your password immediately or contact technical support.')
            ->salutation("Warm regards,\nThe PharmaDali Security Team");
    }

    public function toArray(object $notifiable): array
    {
        return [];
    }
}
