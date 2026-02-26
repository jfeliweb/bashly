import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { createElement } from 'react';

import { PasswordResetEmail } from '@/emails/PasswordResetEmail';
import { VerificationEmail } from '@/emails/VerificationEmail';
import {
  accountTable,
  sessionTable,
  userTable,
  verificationTable,
} from '@/models/AuthSchema';

import { db } from './DB';
import { Env } from './Env';
import { sendEmail } from './resend';

const appUrl = Env.BETTER_AUTH_URL || 'http://127.0.0.1:3000';

export const auth = betterAuth({
  baseURL: appUrl,
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: userTable,
      session: sessionTable,
      account: accountTable,
      verification: verificationTable,
    },
  }),
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: 'Reset your password',
        react: createElement(PasswordResetEmail, { url }),
      });
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: 'Verify your email address',
        react: createElement(VerificationEmail, { url }),
      });
    },
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    callbackURL: '/dashboard',
  },
  socialProviders: {
    google: {
      clientId: Env.GOOGLE_CLIENT_ID,
      clientSecret: Env.GOOGLE_CLIENT_SECRET,
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
  trustedOrigins: [
    appUrl,
    ...(process.env.ENVIRONMENT === 'local' ? ['http://localhost:3000'] : []),
  ],
});
