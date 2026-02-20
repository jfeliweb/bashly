# Social Login Implementation Status

- Google OAuth: ✅ Live (as of Feb 20, 2026)
- Apple Sign In: ⏳ Pending — requires Apple Developer Program enrollment ($99/yr)

---

## Google OAuth Setup — ✅ COMPLETE

Google sign-in is live. Steps 1–7 have been completed.

1. **Create Google Cloud Project** ✅
   - Go to: https://console.cloud.google.com
   - Create new project: "Bashly"
   - Enable Google+ API

2. **Configure OAuth Consent Screen** ✅
   - User type: External
   - App name: Bashly
   - User support email: hello@bashly.app
   - Developer contact: hello@bashly.app
   - Scopes: email, profile, openid

3. **Create OAuth 2.0 Credentials** ✅
   - Application type: Web application
   - Name: Bashly Web
   - Authorized redirect URIs:
     - http://127.0.0.1:3000/api/auth/callback/google (dev)
     - https://bashly.app/api/auth/callback/google (prod)

4. **Add to Better Auth** ✅
   - `socialProviders.google` added to `apps/web/src/libs/auth.ts`
   - Uses `Env.GOOGLE_CLIENT_ID` and `Env.GOOGLE_CLIENT_SECRET` (T3 Env)

5. **Add Environment Variables** ✅
   - `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env.local`

6. **Update T3 Env Schema** ✅
   - Both keys registered in `apps/web/src/libs/Env.ts`

7. **Enable Button** ✅
   - `<SocialLoginPlaceholder provider="google" disabled={false} />` on sign-in and sign-up pages

---

## Apple Sign In Setup — ⏳ PENDING

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
export const auth = betterAuth({
  // ... existing config
  socialProviders: {
    // ... google already configured
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

- [x] Google sign-in works in dev environment
- [ ] Google sign-in works in production
- [ ] Apple sign-in works in dev environment
- [ ] Apple sign-in works in production
- [x] User profile is created correctly
- [x] Email from OAuth is set as primary
- [x] Account linking works (if user signs up with email first)
- [x] Sign out works correctly
- [x] Token refresh works
- [x] Error handling is graceful
