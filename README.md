# Bashly

Private event management SaaS for Sweet 16s, Quinceañeras, Graduations, Anniversaries, and Reunions.

Hosts create and manage events with guest RSVP, song request queues, gift registries, scheduling, and Spotify integration. Guests interact via a public event page — no account required.

---

## Stack

| Layer | Technology |
|---|---|
| Web framework | Next.js 14 (App Router) |
| Mobile | Expo 52 + Expo Router |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v3 + shadcn/ui (web) · NativeWind v4 (mobile) |
| Auth | Better Auth |
| Database | Drizzle ORM + Neon PostgreSQL |
| Payments | Stripe |
| Email | Resend + React Email |
| File storage | Cloudflare R2 |
| Maps | Mapbox GL JS |
| Music | Spotify Web API + iTunes Search |
| Error tracking | Sentry |
| Monitoring | Checkly |
| i18n | next-intl (en · es · fr) |
| Testing | Vitest · Playwright · Storybook · axe-core |

---

## Monorepo structure

```
bashly/
├── apps/
│   ├── web/          # Next.js 14 web app
│   └── mobile/       # Expo 52 React Native app
├── packages/
│   ├── api-client/   # Typed fetch wrappers for Bashly API
│   ├── tailwind-config/  # Shared Tailwind design tokens
│   ├── types/        # Shared TypeScript interfaces
│   ├── utils/        # Shared utility functions
│   └── validators/   # Shared Zod schemas
├── turbo.json
└── package.json
```

Managed with [Turborepo](https://turbo.build) and npm workspaces.

---

## Getting started

### Prerequisites

- Node.js 20+
- A [Neon](https://neon.tech) PostgreSQL database
- A [Stripe](https://stripe.com) account
- A [Resend](https://resend.com) account
- A [Cloudflare R2](https://developers.cloudflare.com/r2) bucket
- A [Mapbox](https://mapbox.com) account (for venue maps)
- A [Spotify Developer](https://developer.spotify.com) app (for DJ playlist sync)

### Install and run

```bash
# From the repo root
npm install

# Copy the example env file and fill in your values
cp apps/web/.env apps/web/.env.local

# Push the database schema
npm run db:migrate --filter=@saas/web

# Start all dev servers
npm run dev
```

- **Web:** http://localhost:3000
- **Mobile:** Expo dev client — press `i` for iOS Simulator, `a` for Android Emulator

---

## Environment variables

All variables live in `apps/web/.env.local` for local development. Required keys:

| Variable | Description |
|---|---|
| `BETTER_AUTH_SECRET` | Secret key for Better Auth session signing |
| `BETTER_AUTH_URL` | Public base URL (e.g. `http://localhost:3000`) |
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `BILLING_PLAN_ENV` | `dev` or `prod` — controls which Stripe price IDs are used |
| `RESEND_API_KEY` | Resend API key for transactional email |
| `R2_ENDPOINT` | Cloudflare R2 endpoint URL |
| `R2_ACCESS_KEY_ID` | R2 access key |
| `R2_SECRET_ACCESS_KEY` | R2 secret key |
| `R2_BUCKET_NAME` | R2 bucket name |
| `R2_PUBLIC_DOMAIN` | Public CDN domain for uploaded assets |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Mapbox public token (venue map display) |
| `MAPBOX_SECRET_TOKEN` | Mapbox secret token (server-side geocoding) |

For CI and E2E tests, also set:

| Variable | Description |
|---|---|
| `E2E_TEST_USER_EMAIL` | Email of the pre-created test user |
| `E2E_TEST_USER_PASSWORD` | Password of the test user |
| `TEST_EVENT_SLUG` | Slug of a published event for guest page tests |

---

## Web app (`apps/web`)

### Route structure

```
src/app/[locale]/
├── (auth)/
│   ├── (center)/
│   │   ├── sign-in/         # Sign in
│   │   └── sign-up/         # Sign up
│   ├── dashboard/
│   │   ├── billing/         # Subscription management
│   │   ├── dj/[eventId]/    # DJ view (song queue controls)
│   │   ├── events/          # Event list
│   │   ├── events/[eventId]/          # Event overview
│   │   ├── events/[eventId]/edit/     # Edit event details
│   │   ├── events/new/      # Create event (multi-step form)
│   │   ├── organization-profile/      # Organization settings
│   │   ├── user-profile/    # Personal account settings
│   │   └── vendor/[eventId]/          # Vendor view
│   └── onboarding/
│       └── organization-selection/
├── (marketing)/
│   ├── about/
│   ├── contact/
│   ├── features/
│   ├── pricing/
│   ├── privacy/
│   └── terms/
├── (public)/
│   ├── e/[slug]/            # Guest event page (public, ISR)
│   ├── e/[slug]/rsvp-confirmed/
│   └── invite/[code]/       # Invite redemption
└── api/
    ├── auth/[...all]        # Better Auth endpoints
    ├── events/[eventId]/    # Event CRUD + sub-resources
    │   ├── invites/
    │   ├── playlist/
    │   ├── qr/
    │   ├── registry/
    │   ├── schedule/
    │   └── songs/
    ├── invites/[code]/
    ├── rsvp/[slug]/         # Guest RSVP (unauthenticated)
    ├── songs/search/        # iTunes search proxy
    ├── streaming/spotify/   # Spotify OAuth
    └── upload/presign/      # R2 presigned URL generation
```

### Feature modules (`src/features/`)

| Module | Responsibility |
|---|---|
| `auth/` | Sign-in, sign-up, session management |
| `billing/` | Stripe subscription, plan gating |
| `dashboard/` | Dashboard shell, nav, stat cards |
| `events/` | Event creation form, event detail, edit flow |
| `invites/` | Invite link generation, claim flow |
| `landing/` | Marketing homepage sections |
| `onboarding/` | Organization setup wizard |
| `registry/` | Gift registry link management |
| `rsvp/` | Guest RSVP form and confirmation |
| `songs/` | Song request queue, voting, DJ controls |
| `streaming/` | Spotify connect and playlist export |

### Scripts

```bash
# Development
npm run dev              # Next.js + Spotlight dev servers
npm run dev:next         # Next.js only (http://localhost:3000)

# Build
npm run build            # Production build
npm run build-stats      # Build with bundle analyzer

# Database
npm run db:generate      # Generate Drizzle migration files
npm run db:migrate       # Apply migrations (local)
npm run db:migrate:prod  # Apply migrations (production)
npm run db:studio        # Open Drizzle Studio (local)
npm run db:studio:prod   # Open Drizzle Studio (production)

# Testing
npm run test             # Vitest unit tests
npm run test:e2e         # All Playwright E2E tests
npm run test:e2e:create-event  # Event creation E2E only
npm run test:a11y        # WCAG 2.1 AA accessibility tests (all pages)
npm run test:a11y:public      # Public pages only
npm run test:a11y:dashboard   # Authenticated dashboard pages only
npm run test:guest       # Guest page smoke check

# Storybook
npm run storybook        # Storybook dev server (http://localhost:6006)
npm run storybook:build  # Build static Storybook

# Code quality
npm run lint             # ESLint
npm run lint:fix         # ESLint with auto-fix
npm run check-types      # TypeScript type check
```

---

## Mobile app (`apps/mobile`)

Built with Expo 52 and Expo Router (file-based routing). Shares auth, types, validators, and API client with the web app.

### Route structure

```
app/
├── (auth)/
│   ├── sign-in.tsx
│   └── sign-up.tsx
├── (tabs)/
│   ├── index.tsx       # Home
│   └── profile.tsx     # Profile
└── index.tsx           # Root redirect
```

### Scripts

```bash
npm run dev       # Expo dev server
npm run ios       # Run on iOS Simulator
npm run android   # Run on Android Emulator
npm run lint      # ESLint
npm run check-types  # TypeScript type check
```

---

## Shared packages

| Package | Purpose |
|---|---|
| `@saas/api-client` | Typed fetch wrappers for all Bashly API endpoints |
| `@saas/tailwind-config` | Shared Tailwind design tokens (colors, fonts, spacing) |
| `@saas/types` | Shared TypeScript type definitions |
| `@saas/utils` | Shared utility functions |
| `@saas/validators` | Shared Zod schemas used by forms and API validation |

---

## Database

Schema is split into two files:

- `apps/web/src/models/AuthSchema.ts` — Better Auth tables (users, sessions, accounts). Managed by `@better-auth/cli generate`. Never edit manually.
- `apps/web/src/models/Schema.ts` — Bashly business tables (events, rsvps, songs, invites, registry, schedule, etc.)

After changing `Schema.ts`:

```bash
npm run db:generate --filter=@saas/web
npm run db:migrate --filter=@saas/web
```

---

## Authentication

Better Auth handles all auth flows. Server-side session access:

```typescript
import { auth } from '@/libs/auth';
import { headers } from 'next/headers';

const session = await auth.api.getSession({ headers: await headers() });
```

Client-side:

```typescript
import { useSession } from '@/libs/auth-client';
const { data: session } = useSession();
```

Guest RSVP and song request endpoints are unauthenticated — they use the event slug and a browser fingerprint, not a session.

---

## Testing

### Unit tests (Vitest)

```bash
npm run test --filter=@saas/web
```

### E2E tests (Playwright)

Tests live in `apps/web/tests/e2e/`. Required env vars: `E2E_TEST_USER_EMAIL`, `E2E_TEST_USER_PASSWORD`.

```bash
npm run test:e2e                          # All E2E tests
npm run test:e2e:create-event             # Event creation flow
```

### Accessibility tests (axe-core + Playwright)

Audits every key page against WCAG 2.1 AA (Critical + Serious violations block the PR). Additional env var: `TEST_EVENT_SLUG`.

```bash
npm run test:a11y                         # All pages
npm run test:a11y:public                  # Public / unauthenticated pages
npm run test:a11y:dashboard               # Authenticated dashboard pages
```

### Component tests (Storybook)

```bash
npm run storybook                         # Dev server
npm run test-storybook:ci                 # Headless CI run
```

---

## CI/CD

GitHub Actions (`.github/workflows/CI.yml`) runs on every push to `main` and every PR:

| Job | Steps |
|---|---|
| **build** | `npm ci` → `npm run build` (Node 20 + 22.6 matrix) |
| **test** | Commitlint → ESLint → TypeScript → Vitest + coverage → Storybook tests → a11y tests → E2E tests (Percy) |
| **synchronize-with-crowdin** | Upload/download translations (PR only) |

Required GitHub secrets:

| Secret | Used by |
|---|---|
| `SENTRY_AUTH_TOKEN` | Next.js build (source maps) |
| `CODECOV_TOKEN` | Coverage upload |
| `PERCY_TOKEN` | Visual regression (E2E) |
| `E2E_TEST_USER_EMAIL` | E2E + a11y tests |
| `E2E_TEST_USER_PASSWORD` | E2E + a11y tests |
| `TEST_EVENT_SLUG` | A11y tests (guest event page) |
| `CROWDIN_PROJECT_ID` | i18n sync |
| `CROWDIN_PERSONAL_TOKEN` | i18n sync |

---

## Commits

All commits must follow [Conventional Commits](https://www.conventionalcommits.org). Use Commitizen — never write commit messages manually:

```bash
npm run commit
```

**Format:** `type(scope): description`

**Types:** `feat` · `fix` · `refactor` · `style` · `test` · `docs` · `chore`

**Scopes:** `web` · `mobile` · `auth` · `db` · `events` · `music` · `rsvp` · `registry` · `billing` · `api`

---

## Documentation

- `event-saas-blueprint-v2.md` — full product blueprint and architecture decisions
- `bashly-brand-guidelines.html` — design tokens, typography, color system
- `bashly-host-dashboard.html` — host dashboard wireframe reference
- `guest-event-page.html` — guest event page wireframe reference

Built by Jeazy