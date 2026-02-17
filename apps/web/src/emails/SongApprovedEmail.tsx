import { Button, Img, Section, Text } from '@react-email/components';

import { BaseEmailTemplate } from './BaseEmailTemplate';

type SongApprovedEmailProps = {
  guestName: string;
  trackTitle: string;
  artistName: string;
  albumArtUrl?: string;
  eventTitle: string;
  eventPageUrl: string;
  guestMessage?: string;
};

const styles = {
  text: {
    fontSize: '16px',
    color: '#374151',
    lineHeight: '24px',
    margin: '16px 0',
  },
  songCard: {
    backgroundColor: '#f9fafb',
    padding: '20px',
    borderRadius: '12px',
    margin: '24px 0',
  },
  albumArt: {
    borderRadius: '8px',
    objectFit: 'cover' as const,
  },
  songInfo: {
    margin: '12px 0 0 0',
  },
  trackTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#1f2937',
    margin: '0 0 4px 0',
  },
  artistName: {
    fontSize: '16px',
    color: '#6b7280',
    margin: '0',
  },
  messageBox: {
    backgroundColor: '#dbeafe',
    borderLeft: '4px solid #3b82f6',
    padding: '16px',
    margin: '24px 0',
    borderRadius: '4px',
  },
  messageLabel: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#1e40af',
    margin: '0 0 8px 0',
  },
  messageText: {
    fontSize: '16px',
    color: '#1e3a8a',
    fontStyle: 'italic',
    margin: '0',
  },
  buttonContainer: {
    textAlign: 'center' as const,
    margin: '32px 0',
  },
  button: {
    backgroundColor: '#8b5cf6',
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

export function SongApprovedEmail({
  guestName,
  trackTitle,
  artistName,
  albumArtUrl,
  eventTitle,
  eventPageUrl,
  guestMessage,
}: SongApprovedEmailProps) {
  return (
    <BaseEmailTemplate
      preview={`Your song request for ${eventTitle} was approved! 🎵`}
      heading="Your song is on the playlist! 🎵"
    >
      <Text style={styles.text}>
        Great news,
        {' '}
        <strong>{guestName}</strong>
        ! Your song request has been approved for
        {' '}
        <strong>{eventTitle}</strong>
        .
      </Text>

      <Section style={styles.songCard}>
        {albumArtUrl && (
          <Img
            src={albumArtUrl}
            alt={`${trackTitle} album art`}
            width={120}
            height={120}
            style={styles.albumArt}
          />
        )}
        <Section style={styles.songInfo}>
          <Text style={styles.trackTitle}>{trackTitle}</Text>
          <Text style={styles.artistName}>{artistName}</Text>
        </Section>
      </Section>

      {guestMessage && (
        <Section style={styles.messageBox}>
          <Text style={styles.messageLabel}>Your message:</Text>
          <Text style={styles.messageText}>
            &quot;
            {guestMessage}
            &quot;
          </Text>
        </Section>
      )}

      <Text style={styles.text}>
        Your song will be included in the event playlist. Get ready to hear it at the party!
      </Text>

      <Section style={styles.buttonContainer}>
        <Button href={eventPageUrl} style={styles.button}>
          View Event Page
        </Button>
      </Section>

      <Text style={styles.footNote}>
        Want to request another song? Visit the event page to add more requests.
      </Text>
    </BaseEmailTemplate>
  );
}
