import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';

type RsvpConfirmationProps = {
  guestName: string;
  eventTitle: string;
  eventDate: string;
  venueName: string | null;
  eventUrl: string;
};

/* ------------------------------------------------------------------ */
/* Styles                                                              */
/* ------------------------------------------------------------------ */

const main: React.CSSProperties = {
  backgroundColor: '#f8fbfe',
  fontFamily:
    'Nunito, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const container: React.CSSProperties = {
  margin: '0 auto',
  padding: '40px 20px',
  maxWidth: '520px',
};

const headerSection: React.CSSProperties = {
  textAlign: 'center' as const,
  paddingBottom: '16px',
};

const wordmark: React.CSSProperties = {
  fontSize: '24px',
  fontWeight: 800,
  color: '#09151b',
  margin: '0',
};

const hr: React.CSSProperties = {
  borderColor: '#e2e8f0',
  margin: '0',
};

const contentSection: React.CSSProperties = {
  padding: '32px 0',
};

const headingStyle: React.CSSProperties = {
  fontSize: '24px',
  fontWeight: 800,
  color: '#09151b',
  textAlign: 'center' as const,
  margin: '0 0 16px',
};

const paragraph: React.CSSProperties = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#334155',
  margin: '0 0 24px',
};

const detailsBox: React.CSSProperties = {
  backgroundColor: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  padding: '20px 24px',
  marginBottom: '24px',
};

const detailLabel: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 600,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.18em',
  color: '#64748b',
  margin: '0 0 2px',
  fontFamily: 'JetBrains Mono, monospace',
};

const detailValue: React.CSSProperties = {
  fontSize: '15px',
  fontWeight: 600,
  color: '#09151b',
  margin: '0 0 12px',
  fontFamily: 'JetBrains Mono, monospace',
};

const ctaSection: React.CSSProperties = {
  textAlign: 'center' as const,
};

const ctaButton: React.CSSProperties = {
  backgroundColor: '#51ff00',
  color: '#09151b',
  fontSize: '16px',
  fontWeight: 700,
  textDecoration: 'none',
  borderRadius: '100px',
  padding: '14px 32px',
  display: 'inline-block',
};

const footerSection: React.CSSProperties = {
  textAlign: 'center' as const,
  paddingTop: '16px',
};

const footerText: React.CSSProperties = {
  fontSize: '12px',
  color: '#94a3b8',
  margin: '0',
};

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function RsvpConfirmation({
  guestName,
  eventTitle,
  eventDate,
  venueName,
  eventUrl,
}: RsvpConfirmationProps) {
  return (
    <Html>
      <Head />
      <Preview>
        You&apos;re confirmed for
        {' '}
        {eventTitle}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header / Wordmark */}
          <Section style={headerSection}>
            <Text style={wordmark}>Bashly</Text>
          </Section>

          <Hr style={hr} />

          {/* Main content */}
          <Section style={contentSection}>
            <Heading style={headingStyle}>
              You&apos;re on the list! 🎉
            </Heading>

            <Text style={paragraph}>
              Hi
              {' '}
              {guestName}
              , you&apos;re confirmed for
              {' '}
              <strong>{eventTitle}</strong>
              .
            </Text>

            {/* Details box */}
            <Section style={detailsBox}>
              <Text style={detailLabel}>Date</Text>
              <Text style={detailValue}>{eventDate}</Text>
              {venueName
                ? (
                    <>
                      <Text style={detailLabel}>Venue</Text>
                      <Text style={detailValue}>{venueName}</Text>
                    </>
                  )
                : null}
            </Section>

            {/* CTA */}
            <Section style={ctaSection}>
              <Button style={ctaButton} href={eventUrl}>
                View Event Details
              </Button>
            </Section>
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Section style={footerSection}>
            <Text style={footerText}>
              Powered by Bashly · bashly.app
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
