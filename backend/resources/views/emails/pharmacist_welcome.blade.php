<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="color-scheme" content="light" />
    <meta name="supported-color-schemes" content="light" />
    <title>Welcome to PharmaDali</title>
    <style>
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
        body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
        @media only screen and (max-width: 600px) {
            .email-container { width: 100% !important; max-width: 100% !important; }
            .content-padding { padding: 20px 16px !important; }
            .action-button { display: block !important; width: 100% !important; box-sizing: border-box !important; text-align: center !important; }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9;">
    <!-- Preheader for email preview snippet -->
    <div style="display: none; font-size: 1px; color: #f1f5f9; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
        Your PharmaDali licensed pharmacist account has been created. Here are your credentials and app download link.
    </div>

    <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation" style="background-color: #f1f5f9; table-layout: fixed;">
        <tr>
            <td align="center" style="padding: 24px 8px 36px 8px;">
                <table class="email-container" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
                    
                    <!-- Top Gradient Brand Accent -->
                    <tr>
                        <td style="height: 6px; background: linear-gradient(90deg, #2aabe2 0%, #0284c7 100%); background-color: #2aabe2;"></td>
                    </tr>

                    <!-- Header -->
                    <tr>
                        <td style="padding: 24px 24px 16px 24px; text-align: center; border-bottom: 1px solid #f1f5f9;">
                            <span style="font-size: 22px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px;">Pharma<span style="color: #2aabe2;">Dali</span></span>
                        </td>
                    </tr>

                    <!-- Body Content -->
                    <tr>
                        <td class="content-padding" style="padding: 28px 28px 24px 28px; color: #334155; font-size: 14px; line-height: 1.6;">
                            
                            <h1 style="margin: 0 0 14px 0; font-size: 18px; font-weight: 700; color: #0f172a;">
                                Hello {{ $firstName }},
                            </h1>
                            
                            <p style="margin: 0 0 16px 0; font-size: 14px; color: #334155; line-height: 1.6;">
                                Welcome to PharmaDali! Your licensed pharmacist account has been successfully created.
                            </p>
                            
                            <p style="margin: 0 0 18px 0; font-size: 14px; color: #334155; line-height: 1.6;">
                                Below are your initial login credentials for the Pharmacist Mobile App:
                            </p>

                            <!-- Credentials Box -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation" style="margin: 0 0 22px 0; background-color: #f0f9ff; border: 1px solid #bae6fd; border-left: 4px solid #2aabe2; border-radius: 8px;">
                                <tr>
                                    <td style="padding: 16px 18px;">
                                        <div style="font-size: 11px; color: #64748b; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700;">
                                            <img src="{{ $idIcon }}" width="13" height="13" style="vertical-align: -2px; margin-right: 4px;" alt="" /> Employee Number
                                        </div>
                                        <div style="font-family: 'Courier New', Courier, monospace; font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 14px; word-break: break-all;">
                                            {{ $employeeNumber }}
                                        </div>

                                        <div style="font-size: 11px; color: #64748b; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700;">
                                            <img src="{{ $keyIcon }}" width="13" height="13" style="vertical-align: -2px; margin-right: 4px;" alt="" /> Temporary Password
                                        </div>
                                        <div style="font-family: 'Courier New', Courier, monospace; font-size: 16px; font-weight: 700; color: #0284c7; word-break: break-all;">
                                            {{ $temporaryPassword }}
                                        </div>
                                    </td>
                                </tr>
                            </table>

                            <!-- App Download Card -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation" style="margin: 0 0 22px 0; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden;">
                                <tr>
                                    <td style="background: linear-gradient(135deg, #2aabe2 0%, #0284c7 100%); background-color: #2aabe2; padding: 12px 18px; color: #ffffff;">
                                        <div style="font-size: 14px; font-weight: 700; color: #ffffff; line-height: 1.4;">
                                            <img src="{{ $smartphoneIcon }}" width="16" height="16" style="vertical-align: -2px; margin-right: 6px;" alt="" /> Pharmacist Mobile App (Android)
                                        </div>
                                        <div style="font-size: 11px; color: #e0f2fe; font-weight: 600; margin-top: 2px; padding-left: 22px;">
                                            Direct APK Download
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 18px;">
                                        <p style="margin: 0 0 16px 0; font-size: 13px; color: #334155; line-height: 1.55;">
                                            Fulfill customer orders, verify digital prescriptions, and communicate with patients directly from your Android device:
                                        </p>

                                        <!-- Download Button -->
                                        <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation" style="margin: 0 0 18px 0;">
                                            <tr>
                                                <td align="center">
                                                    <a href="{{ $intentUrl }}" class="action-button" style="display: block; width: 100%; box-sizing: border-box; background-color: #2aabe2; color: #ffffff; padding: 14px 20px; font-size: 15px; font-weight: 700; text-decoration: none; border-radius: 8px; text-align: center; box-shadow: 0 2px 6px rgba(42,171,226,0.35);">
                                                        <img src="{{ $downloadIcon }}" width="16" height="16" style="vertical-align: -2px; margin-right: 6px;" alt="" /> Download Pharmacist App (APK)
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>

                                        <!-- Installation Steps -->
                                        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 14px;">
                                            <div style="font-size: 11px; font-weight: 700; color: #475569; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">
                                                Quick Installation Guide
                                            </div>
                                            <ol style="margin: 0; padding-left: 18px; font-size: 13px; color: #64748b; line-height: 1.7;">
                                                <li>Tap <strong>Download Pharmacist App</strong> above.</li>
                                                <li>If your browser warns <em>"File might be harmful"</em>, tap <strong>Download anyway</strong>.</li>
                                                <li>Once downloaded, open the APK from your Downloads folder or notification bar and tap <strong>Install</strong>.</li>
                                                <li>Sign in with your Employee Number and Temporary Password.</li>
                                            </ol>
                                            <p style="margin: 10px 0 0 0; font-size: 12px; color: #94a3b8; line-height: 1.5;">
                                                <strong>Download not finishing?</strong> Tap the <strong>&#8942;</strong> menu in Gmail and choose <em>Open in Chrome</em>, then tap the button again.
                                            </p>
                                        </div>

                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 0 0 10px 0; font-size: 13px; color: #64748b; line-height: 1.5;">
                                For security, you will be prompted to set a new personal password when you first sign in.
                            </p>
                            <p style="margin: 0 0 20px 0; font-size: 13px; color: #64748b; line-height: 1.5;">
                                If you did not expect this email, please contact your pharmacy administrator immediately.
                            </p>

                            <p style="margin: 0; font-size: 14px; color: #334155; line-height: 1.5;">
                                Warm regards,<br />
                                <strong style="color: #0f172a;">The PharmaDali Team</strong>
                            </p>

                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 20px 24px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8;">
                            &copy; {{ date('Y') }} PharmaDali. All rights reserved.
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
