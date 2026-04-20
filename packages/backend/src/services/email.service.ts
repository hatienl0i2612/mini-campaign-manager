/**
 * Email Service
 *
 * Handles sending emails via SMTP/API provider.
 * TODO: Integrate with a real email provider (e.g. SendGrid, AWS SES, Resend, Nodemailer).
 */

interface SendEmailOptions {
    to: string;
    subject: string;
    body: string;
}

/**
 * Send an email to a recipient.
 *
 * Currently a stub — logs the email and simulates network delay.
 * Replace with actual SMTP/API integration when ready.
 */
export async function sendEmail(options: SendEmailOptions): Promise<void> {
    // TODO: implement real email sending (e.g. nodemailer, SendGrid, AWS SES)
    // Example:
    //   await transporter.sendMail({
    //       from: env.SMTP_FROM,
    //       to: options.to,
    //       subject: options.subject,
    //       html: options.body,
    //   });

    // Simulate network delay (100–500ms)
    const delay = Math.floor(Math.random() * 400) + 100;
    await new Promise((resolve) => setTimeout(resolve, delay));

    console.log(`Email sent to ${options.to} (simulated, ${delay}ms)`);
}
