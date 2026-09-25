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
        $firstName   = $notifiable->first_name ?? 'Pharmacist';
        $baseUrl     = rtrim(config('app.url'), '/');

        $smartphoneIcon = $baseUrl . '/images/icons/smartphone_white.png';
        $downloadIcon   = $baseUrl . '/images/icons/download_white.png';
        $idIcon         = $baseUrl . '/images/icons/id_badge.png';
        $keyIcon        = $baseUrl . '/images/icons/key.png';

        // Opens in Chrome instead of Gmail's in-app browser.
        $intentUrl = 'intent://'
            . parse_url($downloadUrl, PHP_URL_HOST)
            . parse_url($downloadUrl, PHP_URL_PATH)
            . '#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url='
            . rawurlencode($downloadUrl)
            . ';end';

        return (new MailMessage)
            ->subject('Welcome to PharmaDali – Your Account & Mobile App are Ready')
            ->greeting("Hello {$firstName},")
            ->line('Welcome to PharmaDali! Your licensed pharmacist account has been successfully created.')
            ->line('Below are your initial login credentials for the Pharmacist Mobile App:')

            // Credentials card
            ->line(new HtmlString('
<table cellpadding="0" cellspacing="0" border="0" width="100%"
       style="margin: 16px 0; background-color: #f0f9ff;
              border: 1px solid #bae6fd; border-left: 4px solid #2aabe2;
              border-radius: 8px;">
    <tr>
        <td style="padding: 14px 16px;">
            <div style="font-size: 11px; color: #64748b; margin-bottom: 4px;
                        text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700;">
                <img src="' . $idIcon . '" width="13" height="13"
                     style="vertical-align: -2px; margin-right: 4px;" alt="" />
                Employee Number
            </div>
            <div style="font-family: \'Courier New\', Courier, monospace;
                        font-size: 16px; font-weight: 700; color: #0f172a;
                        margin-bottom: 12px; word-break: break-all;">
                ' . e($this->employeeNumber) . '
            </div>
            <div style="font-size: 11px; color: #64748b; margin-bottom: 4px;
                        text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700;">
                <img src="' . $keyIcon . '" width="13" height="13"
                     style="vertical-align: -2px; margin-right: 4px;" alt="" />
                Temporary Password
            </div>
            <div style="font-family: \'Courier New\', Courier, monospace;
                        font-size: 16px; font-weight: 700; color: #0284c7;
                        word-break: break-all;">
                ' . e($this->temporaryPassword) . '
            </div>
        </td>
    </tr>
</table>
'))

            // Download card
            ->line(new HtmlString('
<table cellpadding="0" cellspacing="0" border="0" width="100%"
       style="margin: 20px 0; background-color: #ffffff;
              border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden;">

    <tr>
        <td style="background: linear-gradient(135deg, #2aabe2 0%, #0284c7 100%);
                   padding: 12px 16px;">
            <div style="font-size: 14px; font-weight: 700; color: #ffffff; line-height: 1.4;">
                <img src="' . $smartphoneIcon . '" width="16" height="16"
                     style="vertical-align: -2px; margin-right: 6px;" alt="" />
                Pharmacist Mobile App (Android)
            </div>
            <div style="font-size: 11px; color: #e0f2fe; font-weight: 600;
                        margin-top: 2px; padding-left: 22px;">
                Direct APK Download
            </div>
        </td>
    </tr>

    <tr>
        <td style="padding: 16px;">
            <p style="margin: 0 0 14px 0; font-size: 13px; color: #334155; line-height: 1.55;">
                Fulfill customer orders, verify prescriptions, and communicate
                with patients directly from your Android device.
            </p>

            <!-- Full-width button so it fits any screen size -->
            <table cellpadding="0" cellspacing="0" border="0" width="100%"
                   style="margin: 0 0 16px 0;">
                <tr>
                    <td align="center">
                        <a href="' . e($intentUrl) . '"
                           style="display: block; width: 100%; box-sizing: border-box;
                                  background-color: #2aabe2; color: #ffffff;
                                  padding: 14px 16px; font-size: 15px; font-weight: 700;
                                  text-decoration: none; border-radius: 8px;
                                  text-align: center;
                                  box-shadow: 0 2px 6px rgba(42,171,226,0.35);">
                            <img src="' . $downloadIcon . '" width="16" height="16"
                                 style="vertical-align: -2px; margin-right: 6px;" alt="" />
                            Download Pharmacist App (APK)
                        </a>
                    </td>
                </tr>
            </table>

            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0;
                        border-radius: 6px; padding: 12px 14px;">
                <div style="font-size: 11px; font-weight: 700; color: #475569;
                            margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">
                    Quick Installation Guide
                </div>
                <ol style="margin: 0; padding-left: 16px; font-size: 13px;
                           color: #64748b; line-height: 1.7;">
                    <li>Tap <strong>Download Pharmacist App</strong> above.</li>
                    <li>If warned <em>&ldquo;File might be harmful&rdquo;</em>, tap <strong>Download anyway</strong>.</li>
                    <li>Open the APK from your Downloads folder and tap <strong>Install</strong>.</li>
                    <li>Sign in with your Employee Number and Temporary Password.</li>
                </ol>
                <p style="margin: 10px 0 0 0; font-size: 12px; color: #94a3b8; line-height: 1.5;">
                    <strong>Download not finishing?</strong> Tap &#8942; in Gmail
                    and choose <em>Open in Chrome</em>, then tap the button again.
                </p>
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
