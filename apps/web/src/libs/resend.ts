import type { ReactElement } from 'react';
import { Resend } from 'resend';

import { Env } from './Env';
import { logger } from './Logger';

// Resend SDK singleton (only when API key is configured)
const resend = Env.RESEND_API_KEY ? new Resend(Env.RESEND_API_KEY) : null;

type SendEmailParams = {
  to: string | string[];
  subject: string;
  react: ReactElement;
  from?: string;
  replyTo?: string;
};

/**
 * Send a transactional email via Resend.
 * Uses Bashly's verified "from" address unless overridden.
 * Returns false if Resend is not configured or if sending fails.
 */
export async function sendEmail({
  to,
  subject,
  react,
  from = 'Bashly <noreply@updates.bashly.app>',
  replyTo,
}: SendEmailParams): Promise<boolean> {
  if (!resend) {
    logger.warn({ to, subject }, 'Resend not configured; skipping email send');
    return false;
  }

  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      react,
      ...(replyTo && { replyTo }),
    });

    if (error) {
      logger.error({ error, to, subject }, 'Failed to send email via Resend');
      return false;
    }

    logger.info({ emailId: data?.id, to, subject }, 'Email sent successfully');
    return true;
  } catch (error) {
    logger.error({ error, to, subject }, 'Exception sending email');
    return false;
  }
}
