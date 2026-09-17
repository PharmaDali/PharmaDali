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
        $adminUrl = config('app.frontend_url') ?? 'https://admin.pharmadali.com';
        $firstName = $notifiable->first_name ?? 'Administrator';

        return (new MailMessage)
            ->subject('Welcome to PharmaDali Admin Dashboard')
            ->greeting("Hello {$firstName},")
            ->line('Welcome to PharmaDali! An administrator account has been provisioned for you.')
            ->line('Below are your credentials to access the pharmacy administration portal:')
            ->line(new \Illuminate\Support\HtmlString('
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 20px 0; background-color: #f0f9ff; border: 1px solid #bae6fd; border-left: 4px solid #2aabe2; border-radius: 8px;">
    <tr>
        <td style="padding: 16px 20px;">
            <div style="font-size: 12px; color: #64748b; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700;">Account Email</div>
            <div style="font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif; font-size: 15px; font-weight: 600; color: #0f172a; margin-bottom: 12px;">' . e($notifiable->email ?? 'Admin') . '</div>
            <div style="font-size: 12px; color: #64748b; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700;">Temporary Password</div>
            <div style="font-family: \'Courier New\', Courier, monospace; font-size: 17px; font-weight: 700; color: #0284c7;">' . e($this->password) . '</div>
        </td>
    </tr>
</table>
'))
            ->line('Please sign in and update your password to complete your account setup.')
            ->action('Access Admin Dashboard', $adminUrl)
            ->salutation("Warm regards,\nThe PharmaDali Team");
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
