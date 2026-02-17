import { Button, Hr, Section, Text } from '@react-email/components';

import { BaseEmailTemplate } from './BaseEmailTemplate';

type RsvpConfirmationEmailProps = {
  guestName: string;
  eventTitle: string;
  eventDate?: string;
  eventTime?: string;
  venueName?: string;
  venueAddress?: string;
  eventPageUrl: string;
  plusOnes: number;
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

export function RsvpConfirmationEmail({
  guestName,
  eventTitle,
  eventDate,
  eventTime,
  venueName,
  venueAddress,
  eventPageUrl,
  plusOnes,
}: RsvpConfirmationEmailProps) {
  return (
    <BaseEmailTemplate
      preview={`You're confirmed for ${eventTitle}!`}
      heading={`You're all set, ${guestName}!`}
    >
      <Text style={styles.text}>
        Your RSVP for
        {' '}
        <strong>{eventTitle}</strong>
        {' '}
        has been confirmed. We can&apos;t wait to see you there!
      </Text>

      {plusOnes > 0 && (
        <Text style={styles.text}>
          <strong>Party size:</strong>
          {' '}
          You +
          {' '}
          {plusOnes}
          {' '}
          guest
          {plusOnes !== 1 ? 's' : ''}
        </Text>
      )}

      <Hr style={styles.divider} />

      <Section style={styles.detailsBox}>
        <Text style={styles.detailsHeading}>Event Details</Text>

        {eventDate && (
          <Text style={styles.detailText}>
            <strong>📅 Date:</strong>
            {' '}
            {eventDate}
          </Text>
        )}

        {eventTime && (
          <Text style={styles.detailText}>
            <strong>🕐 Time:</strong>
            {' '}
            {eventTime}
          </Text>
        )}

        {venueName && (
          <Text style={styles.detailText}>
            <strong>📍 Venue:</strong>
            {' '}
            {venueName}
          </Text>
        )}

        {venueAddress && (
          <Text style={styles.detailText}>
            {venueAddress}
          </Text>
        )}
      </Section>

      <Section style={styles.buttonContainer}>
        <Button href={eventPageUrl} style={styles.button}>
          View Event Page
        </Button>
      </Section>

      <Text style={styles.footNote}>
        Visit the event page to see the full schedule, request songs, and view gift registry
        links.
      </Text>
    </BaseEmailTemplate>
  );
}
