import { Link, Text } from '@react-email/components';

import { BaseEmailTemplate } from './BaseEmailTemplate';

type VerificationEmailProps = {
  url: string;
};

const styles = {
  text: {
    fontSize: '16px',
    color: '#334155',
    margin: '0 0 16px',
  },
  link: {
    color: '#3b82f6',
    textDecoration: 'none',
  },
};

export function VerificationEmail({ url }: VerificationEmailProps) {
  return (
    <BaseEmailTemplate
      preview="Verify your Bashly email address"
      heading="Verify your email address"
    >
      <Text style={styles.text}>
        Click
        {' '}
        <Link href={url} style={styles.link}>
          here
        </Link>
        {' '}
        to verify your email address.
      </Text>
    </BaseEmailTemplate>
  );
}
