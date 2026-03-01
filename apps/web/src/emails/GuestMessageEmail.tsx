import { Button, Hr, Section, Text } from '@react-email/components';

import { getBaseUrl } from '@/utils/Helpers';

import { BaseEmailTemplate } from './BaseEmailTemplate';

export type GuestMessageEmailProps = {
  hostName: string;
  guestName: string;
  guestEmail: string;
  subject: string;
  message: string;
  eventTitle: string;
  eventId: string;
};

const styles = {
  text: {
    fontSize: '16px',
    color: '#374151',
    lineHeight: '24px',
    margin: '16px 0',
  },
  divider: {
    borderColor: '#e5e7eb',
    margin: '24px 0',
  },
  detailsBox: {
    backgroundColor: '#f9fafb',
    padding: '20px',
    borderRadius: '8px',
    margin: '16px 0',
  },
  detailsHeading: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#1f2937',
    margin: '0 0 12px 0',
  },
  detailText: {
    fontSize: '16px',
    color: '#374151',
    margin: '8px 0',
    lineHeight: '24px',
  },
  messageBlockquote: {
    backgroundColor: '#f3f4f6',
    borderLeft: '4px solid #9ca3af',
    padding: '16px',
    margin: '12px 0',
    borderRadius: '0 8px 8px 0',
    fontStyle: 'italic' as const,
    color: '#374151',
  },
  buttonContainer: {
    textAlign: 'center' as const,
    margin: '32px 0',
  },
  button: {
    backgroundColor: '#10b981',
    color: '#ffffff',
    padding: '12px 32px',
    borderRadius: '6px',
    textDecoration: 'none',
    fontWeight: 'bold',
    fontSize: '16px',
    display: 'inline-block',
  },
  footNote: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '16px 0',
  },
};

export function GuestMessageEmail({
  hostName,
  guestName,
  guestEmail,
  subject,
  message,
  eventTitle,
  eventId,
}: GuestMessageEmailProps) {
  const baseUrl = getBaseUrl();
  const dashboardUrl = `${baseUrl}/dashboard/events/${eventId}`;

  return (
    <BaseEmailTemplate
      preview={`New message from ${guestName} about ${eventTitle}`}
      heading="You have a new message 💬"
    >
      <Text style={styles.text}>
        Hi
        {' '}
        {hostName}
        , a guest has sent you a message:
      </Text>
      <Text style={styles.text}>
        <strong>From:</strong>
        {' '}
        {guestName}
        {' '}
        (
        <a href={`mailto:${guestEmail}`} style={{ color: '#3b82f6', textDecoration: 'none' }}>
          {guestEmail}
        </a>
        )
      </Text>

      <Text style={styles.text}>
        <strong>Subject:</strong>
        {' '}
        {subject}
      </Text>

      <Section style={styles.detailsBox}>
        <Text style={styles.detailsHeading}>Message</Text>
        <Text style={styles.messageBlockquote}>{message}</Text>
      </Section>

      <Text style={styles.text}>
        <strong>Event:</strong>
        {' '}
        {eventTitle}
      </Text>

      <Hr style={styles.divider} />

      <Section style={styles.buttonContainer}>
        <Button href={dashboardUrl} style={styles.button}>
          View Event Dashboard →
        </Button>
      </Section>

      <Text style={styles.footNote}>
        This message was sent via your Bashly event page. Reply directly to
        {' '}
        <a href={`mailto:${guestEmail}`} style={{ color: '#3b82f6', textDecoration: 'none' }}>
          {guestEmail}
        </a>
        {' '}
        to respond.
      </Text>
    </BaseEmailTemplate>
  );
}
