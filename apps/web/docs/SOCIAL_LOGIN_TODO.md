# Social Login Implementation Checklist

Social login buttons are visible but disabled for beta. When ready to implement:

## Google OAuth Setup

1. **Create Google Cloud Project**
   - Go to: https://console.cloud.google.com
   - Create new project: "Bashly"
   - Enable Google+ API

2. **Configure OAuth Consent Screen**
   - User type: External
   - App name: Bashly
   - User support email: hello@bashly.app
   - Developer contact: hello@bashly.app
   - Scopes: email, profile, openid

3. **Create OAuth 2.0 Credentials**
   - Application type: Web application
   - Name: Bashly Web
   - Authorized redirect URIs:
     - http://127.0.0.1:3000/api/auth/callback/google (dev)
     - https://bashly.app/api/auth/callback/google (prod)

4. **Add to Better Auth**

```typescript
// In apps/web/src/libs/auth.ts
import { google } from '@better-auth/google';

export const auth = betterAuth({
  // ... existing config
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
});
```

5. **Add Environment Variables**

```bash
# In .env.local
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
```

6. **Update T3 Env Schema**

```typescript
// In apps/web/src/libs/Env.ts
server: {
  // ... existing
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
},
```

7. **Enable Button**

```typescript
// In sign-in/sign-up pages
<SocialLoginPlaceholder provider="google" disabled={false} />
```

---

## Apple Sign In Setup

1. **Apple Developer Program**
   - Enroll at: https://developer.apple.com
   - Cost: $99/year
   - Required for Apple Sign In

2. **Create Service ID**
   - Identifier: app.bashly.web
   - Enable "Sign in with Apple"
   - Configure domains and redirect URLs

3. **Generate Key**
   - Create new key
   - Enable "Sign in with Apple"
   - Download `.p8` key file (save securely)

4. **Add to Better Auth**

```typescript
import { apple } from '@better-auth/apple';

export const auth = betterAuth({
  // ... existing config
  socialProviders: {
    apple: {
      clientId: process.env.APPLE_CLIENT_ID!,
      teamId: process.env.APPLE_TEAM_ID!,
      keyId: process.env.APPLE_KEY_ID!,
      privateKey: process.env.APPLE_PRIVATE_KEY!,
    },
  },
});
```

5. **Add Environment Variables**

```bash
APPLE_CLIENT_ID=app.bashly.web
APPLE_TEAM_ID=your_team_id
APPLE_KEY_ID=your_key_id
APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
```

6. **Enable Button**

```typescript
<SocialLoginPlaceholder provider="apple" disabled={false} />
```

---

## Testing Checklist

After implementation:

- [ ] Google sign-in works in dev environment
- [ ] Google sign-in works in production
- [ ] Apple sign-in works in dev environment
- [ ] Apple sign-in works in production
- [ ] User profile is created correctly
- [ ] Email from OAuth is set as primary
- [ ] Account linking works (if user signs up with email first)
- [ ] Sign out works correctly
- [ ] Token refresh works
- [ ] Error handling is graceful

---

## Beta Phase

For beta, social login buttons are visible but disabled. This:

- Shows users what's coming
- Makes the UI feel complete
- Sets expectations ("Coming Soon" badge)
- Doesn't require expensive developer accounts yet

Remove disabled={true} when ready to launch social login.
