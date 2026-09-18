<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\HtmlString;

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
        $firstName = $notifiable->first_name ?? 'Pharmacist';
        $baseUrl = rtrim(config('app.url'), '/');

        $smartphoneIcon = $baseUrl . '/images/icons/smartphone_white.png';
        $downloadIcon = $baseUrl . '/images/icons/download_white.png';
        $idIcon = $baseUrl . '/images/icons/id_badge.png';
        $keyIcon = $baseUrl . '/images/icons/key.png';

        return (new MailMessage)
            ->subject('Welcome to PharmaDali – Your Account & Mobile App are Ready')
            ->greeting("Hello {$firstName},")
            ->line('Welcome to PharmaDali! Your licensed pharmacist account has been successfully created.')
            ->line('Below are your initial login credentials for the Pharmacist Mobile App:')
            ->line(new HtmlString('
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 20px 0; background-color: #f0f9ff; border: 1px solid #bae6fd; border-left: 4px solid #2aabe2; border-radius: 8px;">
    <tr>
        <td style="padding: 16px 20px;">
            <div style="font-size: 12px; color: #64748b; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700;">
                <img src="' . $idIcon . '" width="14" height="14" style="vertical-align: -2px; margin-right: 5px;" alt="" /> Employee Number
            </div>
            <div style="font-family: \'Courier New\', Courier, monospace; font-size: 17px; font-weight: 700; color: #0f172a; margin-bottom: 14px;">' . e($this->employeeNumber) . '</div>
            <div style="font-size: 12px; color: #64748b; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700;">
                <img src="' . $keyIcon . '" width="14" height="14" style="vertical-align: -2px; margin-right: 5px;" alt="" /> Temporary Password
            </div>
            <div style="font-family: \'Courier New\', Courier, monospace; font-size: 17px; font-weight: 700; color: #0284c7;">' . e($this->temporaryPassword) . '</div>
        </td>
    </tr>
</table>
'))
            ->line(new HtmlString('
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 24px 0; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.06);">
    <tr>
        <td style="background: linear-gradient(135deg, #2aabe2 0%, #0284c7 100%); padding: 14px 20px; color: #ffffff;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                    <td style="font-size: 15px; font-weight: 700; color: #ffffff;">
                        <img src="' . $smartphoneIcon . '" width="18" height="18" style="vertical-align: -3px; margin-right: 8px;" alt="" /> Pharmacist Mobile App (Android)
                    </td>
                    <td align="right" style="font-size: 12px; color: #e0f2fe; font-weight: 600;">
                        Direct APK Download
                    </td>
                </tr>
            </table>
        </td>
    </tr>
    <tr>
        <td style="padding: 20px;">
            <p style="margin: 0 0 16px 0; font-size: 14px; color: #334155; line-height: 1.5;">
                Fulfill customer orders, verify digital prescriptions, and communicate with patients directly from your Android device:
            </p>
            <div style="text-align: center; margin: 18px 0 20px 0;">
                <a href="' . e($downloadUrl) . '" style="background-color: #2aabe2; color: #ffffff; padding: 12px 28px; font-size: 15px; font-weight: 700; text-decoration: none; border-radius: 6px; display: inline-block; box-shadow: 0 2px 4px rgba(42,171,226,0.3);">
                    <img src="' . $downloadIcon . '" width="16" height="16" style="vertical-align: -2px; margin-right: 8px;" alt="" /> Download Pharmacist App (APK)
                </a>
            </div>
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px 16px;">
                <div style="font-size: 12px; font-weight: 700; color: #475569; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">Quick Installation Guide</div>
                <ol style="margin: 0; padding-left: 18px; font-size: 13px; color: #64748b; line-height: 1.6;">
                    <li>Tap the <strong>Download Pharmacist App</strong> button on your Android device.</li>
                    <li>If your browser warns <em>"File might be harmful"</em>, tap <strong>Download anyway</strong>.</li>
                    <li>Open the downloaded APK and tap <strong>Install</strong>.</li>
                    <li>Launch the app and sign in with your Employee Number and Temporary Password.</li>
                </ol>
            </div>
        </td>
    </tr>
</table>
'))
            ->line('For security, you will be prompted to set a new personal password when you first sign in.')
            ->line('If you did not expect this email, please contact your pharmacy administrator immediately.')
            ->salutation("Warm regards,\nThe PharmaDali Team");
    }

    public function toArray(object $notifiable): array
    {
        return [];
    }
}
