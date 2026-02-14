import { Resend } from 'resend';

import { Env } from './Env';

export const resend = Env.RESEND_API_KEY
  ? new Resend(Env.RESEND_API_KEY)
  : null;

/**
 * Send an email using Resend.
 * Returns null if Resend is not configured.
 */
export async function sendEmail(options: {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}) {
  if (!resend) {
    console.warn('Resend is not configured. Skipping email send.');
    return null;
  }

  const { data, error } = await resend.emails.send({
    from: options.from ?? 'noreply@yourdomain.com',
    to: options.to,
    subject: options.subject,
    html: options.html,
  });

  if (error) {
    console.error('Failed to send email:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }

  return data;
}
