<x-mail::message>
# Hello {{ $firstName }},

Welcome to PharmaDali! Your licensed pharmacist account has been successfully created.

Below are your initial login credentials for the **Pharmacist Mobile App**:

<table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 20px 0; background-color: #f0f9ff; border: 1px solid #bae6fd; border-left: 4px solid #2aabe2; border-radius: 8px;">
<tr>
<td style="padding: 16px 20px;">
<div style="font-size: 11px; color: #64748b; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700;">Employee Number</div>
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 14px;">{{ $employeeNumber }}</div>
<div style="font-size: 11px; color: #64748b; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700;">Temporary Password</div>
<div style="font-family: Consolas, 'Courier New', Courier, monospace; font-size: 17px; font-weight: 700; color: #0284c7;">{{ $temporaryPassword }}</div>
</td>
</tr>
</table>

<table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 24px 0 20px 0; background-color: #ffffff; border: 1px solid #dbeafe; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 8px rgba(42, 171, 226, 0.08);">
<tr>
<td style="background: linear-gradient(135deg, #2aabe2 0%, #0284c7 100%); background-color: #2aabe2; padding: 14px 20px; color: #ffffff;">
<div style="font-size: 15px; font-weight: 700; color: #ffffff; letter-spacing: -0.2px;">
Pharmacist Mobile App (Android)
</div>
<div style="font-size: 12px; color: #e0f2fe; margin-top: 2px;">
Direct APK Download &amp; Installation
</div>
</td>
</tr>
<tr>
<td style="padding: 20px;">
<p style="margin: 0 0 16px 0; font-size: 14px; color: #334155; line-height: 1.5;">
Fulfill customer orders, verify digital prescriptions, and communicate with patients directly from your Android device:
</p>
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 20px 0;">
<tr>
<td align="center" style="padding: 0; background: none !important; background-color: transparent !important; border: none !important;">
<a href="{{ $downloadUrl }}" target="_blank" rel="noopener" style="display: inline-block; background: linear-gradient(135deg, #2aabe2 0%, #0284c7 100%) !important; background-color: #2aabe2 !important; color: #ffffff !important; padding: 14px 28px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; font-weight: 700; text-decoration: none; border-radius: 8px; box-shadow: 0 3px 10px rgba(42, 171, 226, 0.35); text-align: center; -webkit-text-size-adjust: none;">
<span style="color: #ffffff !important; text-decoration: none; font-weight: 700;">Download Pharmacist App (APK)</span>
</a>
</td>
</tr>
</table>
<div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 16px; margin-top: 18px;">
<div style="font-size: 11px; font-weight: 700; color: #475569; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">
Quick Installation Guide
</div>
<ol style="margin: 0; padding-left: 20px; font-size: 13px; color: #475569; line-height: 1.6;">
<li style="margin-bottom: 4px;">Tap <strong>Download Pharmacist App (APK)</strong> above.</li>
<li style="margin-bottom: 4px;">If your browser prompts <em>"File might be harmful"</em>, tap <strong>Download anyway</strong>.</li>
<li style="margin-bottom: 4px;">Once downloaded, open the file from your notification bar or Downloads and tap <strong>Install</strong>.</li>
<li>Sign in with your <strong>Employee Number</strong> and <strong>Temporary Password</strong>.</li>
</ol>
<div style="margin-top: 10px; font-size: 12px; color: #64748b; line-height: 1.5;">
<strong>Tip:</strong> If the download does not start inside the Gmail app, tap the <strong>&#8942;</strong> menu in Gmail and choose <em>Open in Chrome</em>, then tap download again.
</div>
</div>
</td>
</tr>
</table>

<p style="font-size: 13px; color: #64748b; line-height: 1.5; margin: 18px 0 10px 0;">
For security, you will be prompted to set a new personal password when you first sign in. If you did not expect this invitation, please contact your pharmacy administrator immediately.
</p>

Warm regards,<br>
**The PharmaDali Team**
</x-mail::message>
