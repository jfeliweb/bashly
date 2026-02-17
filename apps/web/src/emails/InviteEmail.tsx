import { Button, Section, Text } from '@react-email/components';

import { BaseEmailTemplate } from './BaseEmailTemplate';

type InviteEmailProps = {
  eventTitle: string;
  hostName: string;
  role: string;
  inviteUrl: string;
  eventDate?: string;
  message?: string;
};

const styles = {
  text: {
    fontSize: '16px',
    color: '#374151',
    lineHeight: '24px',
    margin: '16px 0',
  },
  messageBox: {
    backgroundColor: '#f9fafb',
    borderLeft: '4px solid #3b82f6',
    padding: '16px',
    margin: '24px 0',
    borderRadius: '4px',
  },
  messageLabel: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#6b7280',
    margin: '0 0 8px 0',
  },
  messageText: {
    fontSize: '16px',
    color: '#374151',
    fontStyle: 'italic',
    margin: '0',
  },
  buttonContainer: {
    textAlign: 'center' as const,
    margin: '32px 0',
  },
  button: {
    backgroundColor: '#3b82f6',
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

function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    co_host: 'Co-Host',
    coordinator: 'Coordinator',
    dj: 'DJ',
    guest: 'Guest',
    vip_guest: 'VIP Guest',
    vendor: 'Vendor',
  };
  return labels[role] ?? role;
}

export function InviteEmail({
  eventTitle,
  hostName,
  role,
  inviteUrl,
  eventDate,
  message,
}: InviteEmailProps) {
  const roleLabel = getRoleLabel(role);

  return (
    <BaseEmailTemplate
      preview={`You're invited to ${eventTitle} as ${roleLabel}`}
      heading={`You're invited to ${eventTitle}!`}
    >
      <Text style={styles.text}>
        <strong>{hostName}</strong>
        {' '}
        has invited you to
        {' '}
        <strong>{eventTitle}</strong>
        {' '}
        as
        {' '}
        <strong>{roleLabel}</strong>
        .
      </Text>

      {eventDate && (
        <Text style={styles.text}>
          📅
          {' '}
          <strong>When:</strong>
          {' '}
          {eventDate}
        </Text>
      )}

      {message && (
        <Section style={styles.messageBox}>
          <Text style={styles.messageLabel}>
            Message from
            {' '}
            {hostName}
            :
          </Text>
          <Text style={styles.messageText}>
            &quot;
            {message}
            &quot;
          </Text>
        </Section>
      )}

      <Section style={styles.buttonContainer}>
        <Button href={inviteUrl} style={styles.button}>
          View Invitation
        </Button>
      </Section>

      <Text style={styles.footNote}>
        Click the button above to accept your invitation and view event details.
      </Text>
    </BaseEmailTemplate>
  );
}
