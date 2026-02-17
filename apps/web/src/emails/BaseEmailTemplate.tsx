import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import type { ReactNode } from 'react';

type BaseEmailTemplateProps = {
  preview: string;
  heading: string;
  children: ReactNode;
};

const styles = {
  body: {
    backgroundColor: '#f6f9fc',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  container: {
    margin: '0 auto',
    padding: '20px 0',
    maxWidth: '600px',
  },
  header: {
    backgroundColor: '#ffffff',
    padding: '20px',
    borderRadius: '8px 8px 0 0',
    textAlign: 'center' as const,
  },
  logo: {
    margin: '0 auto',
  },
  content: {
    backgroundColor: '#ffffff',
    padding: '32px',
  },
  heading: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1a1a1a',
    margin: '0 0 16px 0',
  },
  footer: {
    backgroundColor: '#ffffff',
    padding: '24px 32px',
    borderRadius: '0 0 8px 8px',
  },
  footerText: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '8px 0',
  },
  link: {
    color: '#3b82f6',
    textDecoration: 'none',
  },
};

/**
 * Base email template with Bashly branding.
 * All transactional emails extend this layout.
 */
export function BaseEmailTemplate({
  preview,
  heading,
  children,
}: BaseEmailTemplateProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Header with logo */}
          <Section style={styles.header}>
            <Img
              src="https://pub-5855515c58c843e09cc3539fffe40fc6.r2.dev/bashly-logo-email.png"
              alt="Bashly"
              width="120"
              height="40"
              style={styles.logo}
            />
          </Section>

          {/* Main content */}
          <Section style={styles.content}>
            <Heading style={styles.heading}>{heading}</Heading>
            {children}
          </Section>

          {/* Footer */}
          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              This email was sent by
              {' '}
              <a href="https://bashly.app" style={styles.link}>
                Bashly
              </a>
              , the event management platform for unforgettable celebrations.
            </Text>
            <Text style={styles.footerText}>
              If you have questions, reply to this email or visit
              {' '}
              <a href="https://bashly.app/support" style={styles.link}>
                bashly.app/support
              </a>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
