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
        $frontendUrl = config('app.frontend_url') ?? 'https://admin.pharmadali.com';
        $firstName = $notifiable->first_name ?? 'Pharmacist';

        return (new MailMessage)
            ->subject('Welcome to PharmaDali – Your Account is Ready')
            ->greeting("Hello {$firstName},")
            ->line('Welcome to PharmaDali! Your licensed pharmacist account has been successfully created.')
            ->line('Below are your initial login credentials:')
            ->line(new \Illuminate\Support\HtmlString('
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 20px 0; background-color: #f0f9ff; border: 1px solid #bae6fd; border-left: 4px solid #2aabe2; border-radius: 8px;">
    <tr>
        <td style="padding: 16px 20px;">
            <div style="font-size: 12px; color: #64748b; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700;">Employee Number</div>
            <div style="font-family: \'Courier New\', Courier, monospace; font-size: 17px; font-weight: 700; color: #0f172a; margin-bottom: 12px;">' . e($this->employeeNumber) . '</div>
            <div style="font-size: 12px; color: #64748b; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700;">Temporary Password</div>
            <div style="font-family: \'Courier New\', Courier, monospace; font-size: 17px; font-weight: 700; color: #0284c7;">' . e($this->temporaryPassword) . '</div>
        </td>
    </tr>
</table>
'))
            ->line('For security, you will be prompted to set a new personal password when you first sign in.')
            ->action('Access Pharmacist Portal', $frontendUrl)
            ->line('If you did not expect this email, please contact your branch administrator immediately.')
            ->salutation("Warm regards,\nThe PharmaDali Team");
    }

    public function toArray(object $notifiable): array
    {
        return [];
    }
}
