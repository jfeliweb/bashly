import { Link, Text } from '@react-email/components';

import { BaseEmailTemplate } from './BaseEmailTemplate';

type PasswordResetEmailProps = {
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

export function PasswordResetEmail({ url }: PasswordResetEmailProps) {
  return (
    <BaseEmailTemplate
      preview="Reset your Bashly password"
      heading="Reset your password"
    >
      <Text style={styles.text}>
        Click
        {' '}
        <Link href={url} style={styles.link}>
          here
        </Link>
        {' '}
        to reset your password.
      </Text>
    </BaseEmailTemplate>
  );
}
