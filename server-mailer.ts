import nodemailer, { Transporter } from 'nodemailer';
import { StaffPermissions } from './src/types';

export interface SendEmailOptions {
  to: string;
  recipientName?: string;
  subject: string;
  text: string;
  html: string;
  from?: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  previewUrl?: string | false;
  deliveryChannel: string;
  error?: string;
}

let cachedTransporter: Transporter | null = null;
let cachedTransporterType: string = '';

async function getTransporter(): Promise<{ transporter: Transporter; channel: string }> {
  // 1. If custom SMTP is configured in environment variables
  const smtpHost = process.env.SMTP_HOST || process.env.EMAIL_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || process.env.EMAIL_PORT || 587);
  const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD;
  const smtpSecure = process.env.SMTP_SECURE === 'true' || smtpPort === 465;

  if (smtpHost && smtpUser) {
    if (cachedTransporter && cachedTransporterType === 'custom') {
      return { transporter: cachedTransporter, channel: `Official SMTP Server (${smtpHost})` };
    }
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass || '',
      },
      tls: {
        rejectUnauthorized: false,
      },
      connectionTimeout: 5000,
      greetingTimeout: 4000,
      socketTimeout: 6000,
    });
    cachedTransporter = transporter;
    cachedTransporterType = 'custom';
    return { transporter, channel: `Official SMTP Server (${smtpHost})` };
  }

  // 2. If already created an Ethereal test transporter
  if (cachedTransporter && cachedTransporterType === 'ethereal') {
    return { transporter: cachedTransporter, channel: 'Ethereal Mail Gateway (Live Test Relay)' };
  }

  // 3. Create an Ethereal test account with timeout
  try {
    const testAccount = await Promise.race([
      nodemailer.createTestAccount(),
      new Promise<null>((_, reject) =>
        setTimeout(() => reject(new Error('Ethereal setup timeout')), 4000)
      ),
    ]);

    if (testAccount) {
      const transporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
        connectionTimeout: 4000,
        greetingTimeout: 3000,
        socketTimeout: 5000,
      });
      cachedTransporter = transporter;
      cachedTransporterType = 'ethereal';
      return { transporter, channel: 'Ethereal Mail Gateway (Live Test Relay)' };
    }
  } catch (err) {
    console.warn('[Mailer] Could not initialize Ethereal test account:', (err as Error).message);
  }

  // 4. Fallback: JSON transport (stores messages locally in memory / logs)
  const jsonTransporter = nodemailer.createTransport({
    jsonTransport: true,
  });
  cachedTransporter = jsonTransporter;
  cachedTransporterType = 'json';
  return { transporter: jsonTransporter, channel: 'Local Mail Dispatcher' };
}

export async function sendEmailNotification(options: SendEmailOptions): Promise<SendEmailResult> {
  const fromAddress =
    options.from ||
    process.env.NOTIFICATION_EMAIL_SENDER ||
    process.env.SMTP_USER ||
    'Megaworld International Accreditation Board <no-reply@megaworldinternational.com>';

  try {
    const { transporter, channel } = await getTransporter();

    const mailOptions = {
      from: fromAddress,
      to: options.recipientName
        ? `"${options.recipientName.replace(/"/g, '')}" <${options.to}>`
        : options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    const info = await Promise.race([
      transporter.sendMail(mailOptions),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Mail transport timed out after 6 seconds')), 6000)
      ),
    ]);

    let previewUrl: string | false = false;
    try {
      const pUrl = nodemailer.getTestMessageUrl(info);
      if (pUrl) previewUrl = pUrl;
    } catch {
      // Ignore if not supported
    }

    console.log(`[Mailer] Email dispatched to ${options.to} via ${channel}. MessageId: ${info.messageId}`);
    if (previewUrl) {
      console.log(`[Mailer] Message preview available at: ${previewUrl}`);
    }

    return {
      success: true,
      messageId: info.messageId,
      previewUrl,
      deliveryChannel: channel,
    };
  } catch (err: any) {
    console.error(`[Mailer] Failed to send email to ${options.to}:`, err.message);
    return {
      success: false,
      error: err.message || 'Email delivery failed',
      deliveryChannel: 'Local Failover Gateway',
    };
  }
}

export function generateStaffInvitationEmailHtml(data: {
  recipientName: string;
  recipientEmail: string;
  role: string;
  positionTitle: string;
  department: string;
  invitationCode: string;
  expiresIso: string;
  operatorName: string;
  operatorEmail: string;
  portalUrl: string;
  customMessage?: string;
  permissions: StaffPermissions | Record<string, boolean>;
}): { html: string; text: string } {
  const expiryDateFormatted = new Date(data.expiresIso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const activePermissions = Object.entries(data.permissions)
    .filter(([_, v]) => v)
    .map(([k]) => k.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()));

  const text = `
MEGAWORLD INTERNATIONAL
Business Development Operations & Accreditation Board

OFFICIAL STAFF APPOINTMENT & PORTAL ROLE INVITATION

Dear ${data.recipientName},

You have been officially invited and appointed by ${data.operatorName} (${data.operatorEmail}) to join the Megaworld International BD Staff as ${data.positionTitle} (${data.role}) in the ${data.department} unit.

==================================================
OFFICIAL INVITATION TOKEN:
${data.invitationCode}
==================================================

APPOINTMENT SUMMARY:
• Recipient: ${data.recipientName} (${data.recipientEmail})
• Assigned Role: ${data.role}
• Position Title: ${data.positionTitle}
• Unit / Department: ${data.department}
• Invitation Expiry: ${expiryDateFormatted}
• Dispatched By: ${data.operatorName} (${data.operatorEmail})

${data.customMessage ? `NOTE FROM APPOINTING OFFICER:\n"${data.customMessage}"\n` : ''}
GRANTED ACCESS PRIVILEGES:
${activePermissions.map((p) => `• ${p}`).join('\n')}

TO ACTIVATE YOUR STAFF ACCESS:
1. Open the Megaworld International Portal: ${data.portalUrl}
2. Sign in using your registered email address (${data.recipientEmail}) or use your Invitation Code (${data.invitationCode}).
3. Your staff privileges and administrative tools will be activated immediately upon access.

Warm regards,
Business Development Accreditation Board
Megaworld International
`.trim();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Megaworld International BD Staff Invitation</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #1e293b; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .header { background: #002B66; padding: 32px 28px; text-align: center; border-bottom: 3px solid #d97706; }
    .title { color: #ffffff; font-size: 20px; font-weight: 800; letter-spacing: 0.5px; margin: 0 0 6px 0; }
    .subtitle { color: #93c5fd; font-size: 12px; margin: 0; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600; }
    .content { padding: 32px 28px; font-size: 14px; line-height: 1.6; }
    .salutation { font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 12px; }
    .token-box { background: #f8fafc; border: 2px dashed #002B66; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
    .token-label { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 1px; margin-bottom: 6px; }
    .token-code { font-family: ui-monospace, Menlo, Monaco, 'Courier New', monospace; font-size: 24px; font-weight: 800; color: #002B66; letter-spacing: 2px; }
    .details-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin: 20px 0; }
    .details-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #edf2f7; font-size: 13px; }
    .details-row:last-child { border-bottom: none; }
    .details-label { color: #64748b; font-weight: 500; }
    .details-value { font-weight: 700; color: #0f172a; text-align: right; }
    .btn-container { text-align: center; margin: 28px 0 16px 0; }
    .btn { display: inline-block; background: #002B66; color: #ffffff !important; text-decoration: none; font-weight: 700; font-size: 14px; padding: 14px 28px; border-radius: 10px; box-shadow: 0 4px 6px -1px rgba(0, 43, 102, 0.25); }
    .perms-box { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 16px; margin: 20px 0; font-size: 12px; }
    .perms-title { font-weight: 700; color: #1e3a8a; margin-bottom: 8px; }
    .footer { background: #f8fafc; padding: 20px 28px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="title">MEGAWORLD INTERNATIONAL</h1>
      <p class="subtitle">Official Staff Appointment & Role Grant</p>
    </div>
    <div class="content">
      <div class="salutation">Dear ${data.recipientName},</div>
      <p>
        You have been officially appointed by <strong>${data.operatorName}</strong> to join the
        <strong>Megaworld International Business Development (BD) Staff</strong> as
        <strong style="color: #002B66;">${data.positionTitle}</strong> (${data.role}) in the
        <strong>${data.department}</strong> department.
      </p>

      ${
        data.customMessage
          ? `<div style="background: #fffbeb; border-left: 3px solid #d97706; padding: 12px; font-style: italic; color: #92400e; margin: 16px 0; font-size: 13px; border-radius: 4px;">"${data.customMessage}"</div>`
          : ''
      }

      <div class="token-box">
        <div class="token-label">Your Official Invitation Code</div>
        <div class="token-code">${data.invitationCode}</div>
      </div>

      <div class="details-card">
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Appointed Recipient:</td>
            <td style="padding: 6px 0; font-weight: 700; color: #0f172a; text-align: right;">${data.recipientName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Registered Email:</td>
            <td style="padding: 6px 0; font-weight: 700; color: #002B66; text-align: right;">${data.recipientEmail}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 500;">System Role:</td>
            <td style="padding: 6px 0; font-weight: 700; color: #0f172a; text-align: right;">${data.role} (${data.positionTitle})</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Department:</td>
            <td style="padding: 6px 0; font-weight: 700; color: #0f172a; text-align: right;">${data.department}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 500;">Invitation Expiration:</td>
            <td style="padding: 6px 0; font-weight: 700; color: #dc2626; text-align: right;">${expiryDateFormatted}</td>
          </tr>
        </table>
      </div>

      <div class="perms-box">
        <div class="perms-title">Granted Access Privileges:</div>
        <ul style="margin: 0; padding-left: 20px; color: #1e3a8a; line-height: 1.6;">
          ${activePermissions.map((p) => `<li>${p}</li>`).join('')}
        </ul>
      </div>

      <div class="btn-container">
        <a href="${data.portalUrl}" class="btn" target="_blank">Activate Staff Access & Log In</a>
      </div>

      <p style="font-size: 12px; color: #64748b; text-align: center; margin-top: 16px;">
        Or sign in directly using your registered credentials at 
        <a href="${data.portalUrl}" style="color: #002B66; font-weight: 600;">${data.portalUrl}</a>
      </p>
    </div>
    <div class="footer">
      © ${new Date().getFullYear()} Megaworld International. All rights reserved.<br>
      This is an official administrative transmission. If you believe you received this in error, please contact the Megaworld International Accreditation Board.
    </div>
  </div>
</body>
</html>
`.trim();

  return { html, text };
}
