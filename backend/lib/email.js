import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send a DM notification email to a user.
 * Non-blocking — email failures are logged but don't break message sending.
 */
export async function sendDMNotification({ toEmail, toName, fromName, fromAvatar, roomId }) {
    // Fallback avatar: a generic user silhouette
    const avatarUrl =
        fromAvatar ||
        'https://ui-avatars.com/api/?name=' +
            encodeURIComponent(fromName) +
            '&size=80&background=e8edf3&color=1a2b4a&bold=true&rounded=true';

    try {
        await resend.emails.send({
            from: 'notifications@idealfounders.com',
            to: toEmail,
            subject: `${fromName} sent you a message on IdealFounders`,
            html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>New Message on IdealFounders</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6fa; font-family: 'Segoe UI', Arial, sans-serif;">

    <!-- Outer wrapper for background -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f6fa; padding: 40px 0;">
        <tr>
            <td align="center">

                <!-- Card -->
                <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 2px 16px rgba(0,0,0,0.06); overflow: hidden;">

                    <!-- Top gradient accent line -->
                    <tr>
                        <td style="height: 4px; background: linear-gradient(90deg, #1a56db, #3b82f6, #1a56db);"></td>
                    </tr>

                    <!-- Main content -->
                    <tr>
                        <td style="padding: 40px 36px 36px 36px; text-align: center;">

                            <!-- Avatar with badge -->
                            <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto 20px auto;">
                                <tr>
                                    <td style="position: relative;">
                                        <img
                                            src="${avatarUrl}"
                                            alt="${fromName}"
                                            width="72"
                                            height="72"
                                            style="display: block; width: 72px; height: 72px; border-radius: 50%; border: 3px solid #e8edf3; object-fit: cover;"
                                        />
                                    </td>
                                </tr>
                            </table>

                            <!-- NEW NOTIFICATION label -->
                            <p style="margin: 0 0 8px 0; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #1a56db;">
                                New Notification
                            </p>

                            <!-- Heading -->
                            <h1 style="margin: 0 0 16px 0; font-size: 26px; font-weight: 800; color: #111827; line-height: 1.25;">
                                You have a new<br />message
                            </h1>

                            <!-- Greeting -->
                            <p style="margin: 0 0 6px 0; font-size: 15px; color: #374151;">
                                Hi ${toName},
                            </p>

                            <!-- Body text -->
                            <p style="margin: 0 0 28px 0; font-size: 14px; color: #6b7280; line-height: 1.6;">
                                <strong style="color: #374151;">${fromName}</strong> has sent you a message on IdealFounders.<br />
                                Stay connected and continue building the future.
                            </p>

                            <!-- CTA Button -->
                            <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                                <tr>
                                    <td style="border-radius: 50px; background: linear-gradient(135deg, #1a56db 0%, #2563eb 100%); box-shadow: 0 4px 14px rgba(26,86,219,0.35);">
                                        <a
                                            href="https://idealfounders.com/chat${roomId ? `?room=${roomId}` : ''}"
                                            target="_blank"
                                            style="display: inline-block; padding: 14px 36px; color: #ffffff; font-size: 15px; font-weight: 700; text-decoration: none; letter-spacing: 0.3px;"
                                        >
                                            View Message &nbsp;→
                                        </a>
                                    </td>
                                </tr>
                            </table>

                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 20px 36px 28px 36px; text-align: center; border-top: 1px solid #f0f0f5;">
                            <p style="margin: 0; font-size: 12px; color: #9ca3af; line-height: 1.5;">
                                You're receiving this because someone messaged you on
                                <a href="https://idealfounders.com" style="color: #1a56db; text-decoration: none;">IdealFounders</a>.
                            </p>
                        </td>
                    </tr>

                </table>
                <!-- /Card -->

            </td>
        </tr>
    </table>

</body>
</html>
            `,
        });
        console.log(`DM notification email sent to ${toEmail}`);
    } catch (err) {
        // Non-blocking — don't let email failure break message sending
        console.error('Email notification failed:', err.message);
    }
}
