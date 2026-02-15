# 🎉 Milestone — Private Event Management SaaS
## Complete Product Blueprint — Version 2.2

> A private event platform for Sweet 16s, Anniversaries, Graduations, Family & School Reunions — with collaborative hosting, guest song requests via QR code, streaming service playlist export, and a companion iOS/Android app.

---

## 1. Product Vision

Milestone is not Eventbrite. There is no public event discovery. Every event is private, invitation-only, and centered on the experience of the people in the room. The platform's job is to give hosts everything they need to plan, manage, and execute a memorable celebration — and give guests a frictionless way to participate before they even walk through the door.

The core loop:
1. Host creates an event and customizes it (theme, schedule, dress code).
2. Host invites co-hosts and assigns roles to attendees.
3. Guests receive an invite link or scan a QR code — **no account required**.
4. Guests RSVP, suggest songs, view the map, browse the gift registry links.
5. Host connects Spotify and/or Apple Music → the app populates a real playlist.
6. On event day: playlist is live, headcount is confirmed, every role knows their job.

---

## 2. UX, Accessibility & SEO Principles

These are first-class requirements, not afterthoughts.

### Accessibility (a11y)
- **WCAG 2.1 AA** compliance minimum across all surfaces
- All interactive elements have visible focus rings (`:focus-visible`) — never `outline: none`
- Color contrast ratios ≥ 4.5:1 for text, ≥ 3:1 for UI components
- All images have descriptive `alt` text; decorative images use `alt=""`
- Forms use `<label>` elements or `aria-label` on every input
- Modals trap focus and restore it on close (`aria-modal`, `role="dialog"`)
- Toasts and live regions use `role="status"` or `aria-live="polite"` for screen readers
- Touch targets ≥ 44×44px on mobile (WCAG 2.5.5)
- No motion-triggered animations without respecting `prefers-reduced-motion`
- Keyboard navigation fully functional on all interactive components
- shadcn/ui and React Native Reusables are both built on Radix UI primitives — accessibility behaviors (keyboard nav, ARIA) are built in
- Run automated a11y audits with **axe-core** in CI (via `@axe-core/playwright`) on every PR

### UX Design Standards
- **Mobile-first** — design for 375px width first, scale up
- Guest-facing pages: zero friction. No account, no app install, no walls before RSVP
- Progressive disclosure — show only what's needed at each step
- Skeleton loaders instead of spinners for perceived performance
- Optimistic UI updates for song approvals, RSVP confirmations
- All forms validate inline (not just on submit) with clear, human-readable error messages
- Empty states are designed (not blank) — every zero-data view has a helpful prompt
- Confirmation dialogs for destructive actions only; prefer undo patterns elsewhere

### SEO
- Next.js App Router with SSR/ISR for all public-facing pages
- Unique `<title>` and `<meta name="description">` per page via Next.js Metadata API
- Open Graph tags on every event page (event name, date, cover photo as OG image)
- Dynamic OG image generation via `@vercel/og` (event-branded card auto-generated)
- `sitemap.xml` and `robots.txt` auto-generated (boilerplate includes this)
- JSON-LD structured data on event pages (`Event` schema type) for Google rich results
- Canonical URLs on all pages
- No client-side-only rendering for content that should be indexed
- Guest event pages are ISR-rendered (revalidate on publish/update) — fast and crawlable
- `next/image` for all images (automatic WebP conversion, lazy loading, responsive sizes)

---

## 3. User Roles

Each event has a flexible role system. Roles are **per-event**, not global.

| Role | Description | Permissions |
|---|---|---|
| **Owner** | Person who created the event | Full control: edit, delete, manage roles, connect music, view analytics |
| **Co-Host** | Trusted co-organizer (e.g. parent, sibling) | Edit event details, manage RSVPs, approve/reject songs, manage guests |
| **Coordinator** | Venue or logistics helper | View-only + can update logistics notes (venue, schedule, vendor info) |
| **DJ / Playlist Manager** | Music-focused role | View/manage song suggestion queue, approve/reject songs, reorder playlist |
| **Guest** | Standard attendee | RSVP, suggest songs, view event info (map, schedule, dress code, gift links) |
| **VIP Guest** | Priority attendee | Same as Guest + special badge + song requests auto-approved |
| **Vendor** | Photographer, caterer, florist, etc. | Vendor-only info page (schedule, contact, parking, load-in details) |

Role assignment happens via the invite flow — each invite link or QR code encodes a role. A DJ gets a different invite URL than a guest.

---

## 4. Core Features

### 4.1 Event Creation & Management
- **Event types:** Sweet 16, Quinceañera, Anniversary, Graduation, Family Reunion, School Reunion, Birthday, Custom
- **5 selectable themes** (color schemes applied to guest page + QR code landing page — color values TBD by designer)
  - Theme 1: *(name TBD)*
  - Theme 2: *(name TBD)*
  - Theme 3: *(name TBD)*
  - Theme 4: *(name TBD)*
  - Theme 5: *(name TBD)*
- Event cover photo upload (stored in Cloudflare R2)
- Public event name + private details (address visible only after RSVP confirmed, or always — host's choice)
- **Event schedule builder** — add/reorder/delete time blocks (e.g. "7:00 PM — Doors Open", "9:30 PM — Dancing")
- Dress code field (free text)
- RSVP deadline + max capacity with optional waitlist
- Host's welcome message / note to guests
- Private notes field (visible only to Owner + Co-Hosts)

### 4.2 Invite System
- **Unique invite links** per event, shareable via text, email, WhatsApp, etc.
- **Role-encoded links** — `/invite/[code]` auto-assigns the role encoded in the invite record
- **QR codes** — generated server-side via `qrcode` npm package, downloadable as PNG/SVG for physical invitations, table cards, programs
- **Guest list management** — name, RSVP status, +1s, dietary notes, role, invite code used
- **Bulk invite import** via CSV (Name, Email, Phone)
- RSVP confirmation page matches event theme and branding

### 4.3 Music — The Flagship Feature

#### Guest Song Request Flow (no account required)
1. Guest opens invite link or scans QR code
2. Sees branded event page — event name, host's name, cover photo, theme colors
3. Types a song name or artist into the search widget
4. Results from the **iTunes Search API** (free, no auth, returns metadata + album art)
5. Guest selects a song, optionally adds a message ("Play this for the first dance! 💃")
6. Song enters the **suggestion queue** in the database
7. Host/DJ/Co-Host sees it in the dashboard — approve, reject, or auto-approve

#### Host Streaming Integration
- **Connect Spotify:** OAuth 2.0 PKCE flow → store access token + refresh token (Node.js runtime only — not Edge)
- **Connect Apple Music:** MusicKit JS → store Music User Token server-side
- Host selects export target (Spotify, Apple Music, or both)
- On export: **Odesli/Songlink API** resolves each approved iTunes track ID → Spotify URI or Apple Music ID
- App creates the playlist and adds all resolved tracks via streaming API
- Playlist name: `"[Event Name] — Guest Picks"`
- **Re-sync button** to push newly approved songs at any time
- Unresolvable tracks shown in a "Not found on [Platform]" list for host review

#### Song Queue Management (Host/DJ Dashboard)
- List view: song name, artist, album art, suggested by, message, timestamp, status
- Status: Pending / Approved / Rejected — with badge colors
- Bulk approve all pending
- Drag-to-reorder for final playlist sequence
- Duplicate detection — merges vote counts, notifies the second guest
- Per-guest request limit (configurable: 1, 3, 5, or unlimited)
- Optional guest upvoting (toggle on/off per event)

### 4.4 Gift Registry Links

A zero-dependency, zero-API wishlist feature. No scraping, no third-party SDK, no TOS risk.

**Host flow (dashboard):**
- In the "Gift Registry" section, host clicks "Add Wishlist Link"
- Fills in two fields:
  - **Display Name** — free text with smart suggestions: Amazon Wishlist, Walmart Wishlist, Target Wishlist, Best Buy Registry, Etsy Wishlist, Baby Registry, Custom…
  - **URL** — the direct link to their public wishlist
- Up to **10 links** per event
- Links can be reordered (drag handle) and deleted
- Toggle: "Show gift registry on guest page" (on/off)

**Guest page display:**
- "🎁 Gift Registry" section appears if any links are added and toggle is on
- Each link renders as a branded button: icon (auto-detected from domain) + display name
- Opens in a new tab (`target="_blank" rel="noopener noreferrer"`)
- Accessible — each link has a descriptive `aria-label` (e.g. "Open Sofia's Amazon Wishlist — opens in new tab")

**Domain-to-icon mapping (auto-detected):**

| Domain | Icon |
|---|---|
| amazon.com | 📦 Amazon |
| walmart.com | 🔵 Walmart |
| target.com | 🎯 Target |
| bestbuy.com | 💙 Best Buy |
| etsy.com | 🧶 Etsy |
| babiesrus.com / buybuybaby.com | 🍼 Baby Registry |
| crateandbarrel.com | 🏠 Crate & Barrel |
| williamssonoma.com | 🍳 Williams Sonoma |
| Any other domain | 🔗 [Display Name as entered] |

### 4.5 Map & Location
- Host enters venue name + full address
- Address is geocoded on save via **Mapbox Geocoding API** → stored as `lat`/`lng` in the database
- **Mapbox GL JS** (`react-map-gl`) embedded on guest-facing event page (`"use client"`, no SSR)
- "Get Directions" button → opens `https://maps.apple.com/?daddr=` on iOS, `https://www.google.com/maps/dir/` on Android/desktop
- Optional: parking instructions, entrance notes, load-in info for vendors
- Map is not rendered server-side (Mapbox GL JS requires WebGL/browser APIs)
- `@rnmapbox/maps` used in the Expo mobile app for native map rendering

### 4.6 Guest-Facing Event Page
Everything a guest needs in one mobile-optimized page — **no app download, no account**:
- Event name, type badge, host's name
- Cover photo header with theme gradient overlay
- Live countdown timer (days / hours / minutes / seconds)
- RSVP button → inline modal form
- Schedule / itinerary (collapsible on mobile)
- Dress code
- Song suggestion widget (search → select → optional message → submit)
- Top song requests leaderboard (if voting enabled)
- Gift registry links (if enabled)
- Mapbox map + venue address + directions button
- Host's welcome note
- Footer with event branding

**Performance targets:** Lighthouse score ≥ 90 on Performance, 100 on Accessibility, 100 on Best Practices, ≥ 90 on SEO.

### 4.7 Host Dashboard
- Event overview card: days until event, RSVP count, song count, page views
- Guest list table with RSVP status filters and search
- Song queue panel with approve/reject/reorder controls
- Streaming service connect/sync panel
- Gift registry links manager
- QR code download (PNG + SVG)
- Co-host & role management (invite, reassign, remove)
- Event settings (edit details, theme, toggle features)
- Event analytics: page views over time, RSVPs over time, song request volume

---

## 5. Technical Architecture

### 5.1 System Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│                              CLIENTS                                  │
│                                                                       │
│  Web App (Next.js)                  Expo Mobile App                  │
│  ├─ Host Dashboard                  ├─ Host Dashboard (native)       │
│  ├─ Guest Event Page (public)       └─ Guest Event Page (WebView or  │
│  └─ Marketing / Landing Page            native screens)              │
└──────────────┬─────────────────────────────────┬──────────────────────┘
               │                                 │
               ▼                                 ▼
┌──────────────────────────────────────────────────────────────────────┐
│                         API LAYER                                     │
│                  Next.js App Router API Routes                        │
│              (Node.js runtime — NOT Edge for auth/storage)            │
│                                                                       │
│  /api/auth/*         Better Auth handlers (sign-in, OAuth, session)  │
│  /api/events/*       Event CRUD                                       │
│  /api/invites/*      Invite link generation & validation              │
│  /api/rsvp/*         RSVP submission (unauthenticated)               │
│  /api/songs/*        Song search proxy, suggestion queue, voting      │
│  /api/playlist/*     Odesli resolution + streaming API export        │
│  /api/upload/*       Presigned URL generation for Cloudflare R2      │
│  /api/registry/*     Gift registry link CRUD                          │
└──────────┬────────────────────────┬─────────────────────────────────┘
           │                        │
    ┌──────┴───────┐     ┌──────────┴────────────┐
    ▼              ▼     ▼                        ▼
┌─────────┐  ┌──────────────┐  ┌─────────────────────────────────────┐
│PostgreSQL│  │Cloudflare R2 │  │         External APIs               │
│(Drizzle  │  │              │  │                                     │
│ ORM)     │  │ cover photos │  │ iTunes Search API (song search)     │
│          │  │ QR code imgs │  │ Odesli API (track ID resolution)    │
│ Neon DB  │  │ event assets │  │ Spotify Web API (playlist export)   │
│ or Nile  │  └──────────────┘  │ Apple Music API / MusicKit JS       │
└─────────┘                     │ Mapbox Geocoding API                │
                                │ Mapbox GL JS (web map render)       │
                                │ Resend (transactional email)        │
                                └─────────────────────────────────────┘
```

### 5.2 Monorepo Structure (Turborepo)

The web app and Expo mobile app live in a **Turborepo monorepo** — shared types, validation schemas, and API client code; separate UI implementations per platform.

```
milestone/
├── apps/
│   ├── web/                    # Next.js SaaS app (from ixartz boilerplate)
│   │   ├── src/app/            # App Router pages
│   │   ├── src/components/     # Web-only UI (shadcn/ui)
│   │   └── src/styles/
│   └── mobile/                 # Expo React Native app
│       ├── app/                # Expo Router screens
│       ├── components/         # Native UI (React Native Reusables)
│       └── lib/
├── packages/
│   ├── tailwind-config/        # Shared Tailwind config (colors, spacing, fonts)
│   │                           # Used by web (Tailwind CSS v3) + mobile (NativeWind v4)
│   ├── types/                  # Shared TypeScript types & interfaces
│   ├── validators/             # Shared Zod schemas (forms, API payloads)
│   ├── api-client/             # Shared API client (fetch wrappers, typed endpoints)
│   └── utils/                  # Shared pure utilities (date formatting, slug gen, etc.)
├── turbo.json
└── package.json
```

### 5.3 Tech Stack (Full, Updated)

| Layer | Choice | Notes |
|---|---|---|
| **Base boilerplate** | [ixartz/SaaS-Boilerplate](https://github.com/ixartz/SaaS-Boilerplate) | Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Drizzle ORM, i18n, Sentry |
| **Frontend framework** | **Next.js 14** (App Router) | SSR/ISR for SEO, RSC for performance, API routes for backend |
| **Mobile framework** | **Expo** (SDK 51+, Expo Router) | iOS + Android from one codebase; EAS Build for App Store / Play Store |
| **Web UI** | **Tailwind CSS v3 + shadcn/ui** | Radix UI primitives, WCAG-compliant, copy-paste component model |
| **Mobile UI** | **NativeWind v4 + React Native Reusables** | shadcn/ui design language on native; same Tailwind tokens as web |
| **Shared tokens** | **`packages/tailwind-config`** | One `tailwind.config.js` extended by both web and mobile |
| **Database ORM** | **Drizzle ORM** (already in boilerplate) | Type-safe, fast, PostgreSQL dialect; CLI migrations |
| **Database host** | **Neon** (serverless PostgreSQL) | Free tier, auto-suspend, branching for dev/staging — or Nile for multi-tenancy |
| **Authentication** | **Better Auth** (replacing Clerk) | Self-hosted, no per-user fees, Drizzle adapter, org/team plugin, `@better-auth/expo` for mobile |
| **File storage** | **Cloudflare R2** | Presigned URL uploads from client; zero egress fees; S3-compatible (`@aws-sdk/client-s3`) |
| **QR code generation** | `qrcode` npm package | Server-side PNG/SVG generation; stored in R2 |
| **Maps (web)** | **Mapbox GL JS** via `react-map-gl` | `"use client"` component; geocoding on address save |
| **Maps (mobile)** | **`@rnmapbox/maps`** | Separate SDK; requires EAS Build (not Expo Go); same Mapbox token |
| **Song search** | **iTunes Search API** | Free, no auth; rich metadata + album art; proxied through `/api/songs/search` |
| **Track resolution** | **Odesli API** (song.link) | Maps iTunes IDs → Spotify URIs / Apple Music IDs via ISRC |
| **Spotify integration** | Spotify Web API + OAuth 2.0 PKCE | Node.js runtime only; refresh tokens stored encrypted in DB |
| **Apple Music integration** | MusicKit JS + Apple Music API | $99/yr Apple Developer Program; Music User Token stored server-side |
| **Email** | **Resend + React Email** | JSX email templates; Server Actions / API routes; 3,000 free/mo |
| **Payments** | **Stripe** | Already wired in boilerplate; subscriptions + per-event billing |
| **Error monitoring** | **Sentry** | Already in boilerplate |
| **Hosting** | **Vercel** | Zero-config Next.js; edge caching for guest pages; Preview deployments |
| **CI/CD** | **GitHub Actions** | Already in boilerplate; add Expo EAS build triggers |
| **Testing** | Vitest (unit) + Playwright (E2E) + axe-core (a11y) | Already in boilerplate; add axe-core for accessibility CI checks |

### 5.4 Authentication — Current State (Better Auth ✅ Implemented)

Better Auth is fully implemented in the repo. Clerk was never introduced. Current state of `apps/web/src/libs/auth.ts`:

```typescript
// CURRENT STATE — apps/web/src/libs/auth.ts
export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'pg' }),
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => { /* Resend */ },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => { /* Resend */ },
    sendOnSignUp: true,
  },
  session: { cookieCache: { enabled: true, maxAge: 5 * 60 } },
  trustedOrigins: [process.env.BETTER_AUTH_URL || 'http://localhost:3000'],
});
```

**What's already working:**
- ✅ Email + password sign up / sign in
- ✅ Email verification on sign-up (via Resend)
- ✅ Password reset flow (via Resend)
- ✅ Session management with cookie caching
- ✅ `/api/auth/[...all]` catch-all handler (`apps/web/src/app/api/auth/[...all]/route.ts`)
- ✅ Web auth client (`apps/web/src/libs/auth-client.ts`)
- ✅ Mobile auth client with `@better-auth/expo` + `expo-secure-store` (`apps/mobile/lib/auth-client.ts`)
- ✅ `middleware.ts` checks `better-auth.session_token` cookie; protects `/dashboard`, `/onboarding`, `/api`
- ✅ Better Auth tables (`user`, `session`, `account`, `verification`) exported from `AuthSchema` and re-exported in `Schema.ts`

**Still needs to be added to `auth.ts`:**

```typescript
// TARGET STATE — what auth.ts needs to become
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { organization } from 'better-auth/plugins';
import { expo } from '@better-auth/expo';

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'pg' }),
  emailAndPassword: { enabled: true, sendResetPassword: ... },
  emailVerification: { sendVerificationEmail: ..., sendOnSignUp: true },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    // Apple OAuth added when Apple Developer Program is active
  },
  plugins: [
    organization(),   // Adds org, member, invitation tables — maps to event teams
    expo(),           // Required for @better-auth/expo mobile client
  ],
  session: { cookieCache: { enabled: true, maxAge: 5 * 60 } },
  trustedOrigins: [process.env.BETTER_AUTH_URL || 'http://localhost:3000'],
});
```

**Additional env vars needed when adding OAuth + org plugin:**

```bash
# Add to .env.local (never commit)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
# Apple OAuth — add after Apple Developer Program enrollment
APPLE_CLIENT_ID=your_apple_client_id
APPLE_CLIENT_SECRET=your_apple_client_secret
```

After adding the `organization()` plugin, run `npx @better-auth/cli generate` to add `organization`, `member`, and `invitation` Drizzle tables, then `npm run db:generate && npm run db:migrate`.

**Key wins of Better Auth for this product:**
- No per-user pricing (self-hosted)
- Full data ownership in your Neon PostgreSQL
- `organization` plugin maps directly to Bashly's per-event team model (owner, co-host, DJ, etc.)
- Single auth backend for web and mobile via `@better-auth/expo`

### 5.5 UX/A11y-Specific Architecture Decisions

- **Font loading:** `next/font` (Google Fonts or local) with `display: swap` — no FOUT
- **Image optimization:** All images through `next/image`; R2 bucket configured as Next.js image domain
- **Focus management:** Custom `useFocusTrap` hook for modals; auto-focus first interactive element on modal open
- **Error boundaries:** React Error Boundaries on all dashboard panels — a broken song queue doesn't crash the whole page
- **Loading states:** `React.Suspense` with skeleton components on all async data fetches
- **Form validation:** React Hook Form + Zod (already in boilerplate); errors announced via `aria-describedby`
- **Color themes:** CSS custom properties (`--color-primary`, `--color-surface`, etc.) scoped to `:root` — theme switching is a class change on `<html>`, no JS re-renders needed
- **Reduced motion:** All CSS animations wrapped in `@media (prefers-reduced-motion: no-preference)` — motion off by default for users who've requested it

### 5.6 shadcn/ui ↔ Expo Compatibility Answer

**shadcn/ui does NOT run natively in Expo.** It uses DOM-based `@radix-ui/*` primitives that crash in React Native. The solution:

| Platform | UI Library | Primitive Layer | Styling |
|---|---|---|---|
| Next.js (web) | shadcn/ui | `@radix-ui/*` (DOM) | Tailwind CSS v3 |
| Expo (mobile) | React Native Reusables | `@rn-primitives/*` (native) | NativeWind v4 |

Both libraries share the **same design tokens** (colors, spacing, border-radius, typography scale) via `packages/tailwind-config`. The visual language is consistent; the rendering layer is platform-appropriate. Component APIs are intentionally similar (same prop names where possible) so business logic can be shared even when UI code differs.

---

### 5.7 NextJS SaaS Boilerplate — Features & Pages Inventory

This section documents every feature and page that ships with the [ixartz/SaaS-Boilerplate](https://github.com/ixartz/SaaS-Boilerplate) as modified for this project. Each item is tagged with its status relative to Bashly's build:

- **✅ Keep as-is** — ships from the boilerplate, no changes needed
- **🔧 Extend** — ships from the boilerplate, customised for Bashly
- **🔄 Replace** — boilerplate placeholder to be swapped for Bashly-specific implementation
- **➕ Add** — net-new page or feature not in the boilerplate at all

---

#### 5.7.1 Boilerplate Features (Web)

**Infrastructure & Tooling**

| Feature | Status | Notes |
|---|---|---|
| Turborepo monorepo (`apps/web` + `apps/mobile` + `packages/*`) | ✅ Keep | Monorepo already configured; shared `packages/` structure in place |
| TypeScript strict mode | ✅ Keep | Applied across all apps and packages |
| Tailwind CSS v3 + shadcn/ui | ✅ Keep | Web UI layer; Bashly design tokens replace default theme |
| T3 Env (type-safe environment variables) | ✅ Keep | Add Bashly-specific env vars to the T3 schema |
| ESLint (Next.js + Core Web Vitals + Tailwind + Antfu config) | ✅ Keep | No changes |
| Prettier | ✅ Keep | No changes |
| Husky + lint-staged (pre-commit hooks) | ✅ Keep | No changes |
| Commitlint + Commitizen (conventional commits) | ✅ Keep | No changes |
| Semantic Release (auto changelog + versioning) | ✅ Keep | No changes |
| Bundler Analyzer (`@next/bundle-analyzer`) | ✅ Keep | No changes |
| Absolute imports via `@` prefix | ✅ Keep | No changes |
| VSCode workspace config (debug, settings, extensions) | ✅ Keep | No changes |

**Testing & Quality**

| Feature | Status | Notes |
|---|---|---|
| Vitest + React Testing Library (unit tests) | ✅ Keep | No changes; write Bashly component tests here |
| Playwright (integration + E2E tests) | ✅ Keep | Extend with Bashly E2E flows (RSVP, song request, etc.) |
| GitHub Actions CI (run tests on every PR) | ✅ Keep | Extend to add EAS Build trigger and Lighthouse CI |
| Percy visual testing (optional, GitHub Actions) | ✅ Keep | Optional; useful for guest page theme regression |
| Codecov (code coverage) | ✅ Keep | No changes |
| Storybook (UI component development) | ✅ Keep | Add Bashly components to the Storybook catalogue |
| **axe-core (`@axe-core/playwright`) a11y CI** | ➕ Add | Not in boilerplate; add to Playwright config for every PR — required per Section 2 a11y standards |
| **Lighthouse CI (≥ 90 score enforcement)** | ➕ Add | Not in boilerplate; add as a separate GitHub Actions workflow |

**Observability & Operations**

| Feature | Status | Notes |
|---|---|---|
| Sentry (error monitoring, Next.js SDK) | ✅ Keep | Add Bashly DSN; configure source maps upload in CI |
| Pino.js structured logging | ✅ Keep | No changes |
| Better Stack log management | ✅ Keep | No changes |
| Checkly (monitoring as code, uptime checks) | ✅ Keep | Add checks for guest page, RSVP endpoint, song search proxy |

**Authentication (Better Auth — ✅ Already Implemented)**

| Feature | Status | Notes |
|---|---|---|
| Email + password sign up / sign in | ✅ Done | `auth.ts` — `emailAndPassword.enabled: true` |
| Email verification on sign-up | ✅ Done | `auth.ts` — `emailVerification.sendOnSignUp: true`; sends via Resend |
| Password reset (forgot password flow) | ✅ Done | `auth.ts` — `sendResetPassword` hook sends via Resend |
| Sign out | ✅ Done | `authClient.signOut()` in `auth-client.ts` |
| Session management (cookie-based) | ✅ Done | `better-auth.session_token` cookie; 5-min cache |
| Auth catch-all API route | ✅ Done | `apps/web/src/app/api/auth/[...all]/route.ts` |
| Web auth client | ✅ Done | `apps/web/src/libs/auth-client.ts` |
| Mobile auth client (`@better-auth/expo`) | ✅ Done | `apps/mobile/lib/auth-client.ts`; tokens in `expo-secure-store` |
| Protected route middleware | ✅ Done | `middleware.ts` — protects `/dashboard`, `/onboarding`, `/api` |
| Better Auth Drizzle tables | ✅ Done | `AuthSchema.ts` exports `userTable`, `sessionTable`, `accountTable`, `verificationTable` |
| Google OAuth social login | 🔧 Extend | Add `socialProviders.google` to `auth.ts`; requires `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` |
| Apple OAuth | ➕ Add | Add after Apple Developer Program enrollment; required for App Store |
| Organization / multi-tenancy plugin | ➕ Add | Add `organization()` plugin to `auth.ts`; run `@better-auth/cli generate` to get new tables |
| `expo()` plugin | ➕ Add | Add `expo()` plugin to `auth.ts` to properly support `@better-auth/expo` deep-linking |
| Role-based access control | 🔧 Extend | Better Auth RBAC maps to Bashly's 7 event roles; configure after `organization()` plugin is added |
| Role-encoded event invite flow | ➕ Add | Extend Better Auth `invitation` flow for Bashly invite codes |

**Database & Storage**

| Feature | Status | Notes |
|---|---|---|
| Drizzle ORM (type-safe, PostgreSQL dialect) | ✅ Keep | Extend schema with all Bashly tables (see Section 6) |
| Neon PostgreSQL (serverless) | ✅ Keep | No changes; use Neon branching for dev/staging environments |
| Drizzle Studio (local DB browser) | ✅ Keep | No changes |
| Drizzle Kit (CLI migration tool) | ✅ Keep | Run on every schema change |
| Auto-run migrations on `next build` | ✅ Keep | No changes |
| Cloudflare R2 file storage | ✅ Keep | Used for cover photos, QR code images, any event assets |

**Email**

| Feature | Status | Notes |
|---|---|---|
| Resend transactional email | ✅ Keep | 3,000 free/mo; upgrade as volume grows |
| React Email templates | 🔧 Extend | Boilerplate has basic templates; add Bashly-specific ones (invite email, RSVP confirmation, song approval notification, playlist-ready alert) |

**Payments**

| Feature | Status | Notes |
|---|---|---|
| Stripe subscription billing | 🔧 Extend | Already wired; configure Bashly's 4 pricing tiers (Free, Celebration, Premium, Planner) |
| Stripe customer portal | ✅ Keep | Linked from `/dashboard/billing`; no changes |
| Stripe webhook handler | ✅ Keep | Handles `checkout.session.completed`, `customer.subscription.*` events |
| Checkout confirmation page | ✅ Keep | `/dashboard/billing/checkout-confirmation` |

**i18n**

| Feature | Status | Notes |
|---|---|---|
| `next-intl` multi-language routing | ✅ Keep | All routes prefixed `[locale]` (e.g. `/en/dashboard`, `/es/dashboard`) |
| Crowdin integration (auto-sync translation files) | ✅ Keep | English is the source language; Spanish is priority 1 for Quinceañera / Sweet 16 market |
| English locale (`en.json`) | 🔧 Extend | Add all Bashly UI strings; remove boilerplate placeholder strings |
| French locale (`fr.json`) | 🔧 Extend | Secondary priority; already in boilerplate |

**SEO & Metadata**

| Feature | Status | Notes |
|---|---|---|
| Next.js Metadata API (per-page `<title>` + `<meta name="description">`) | ✅ Keep | Extend with Bashly page metadata (see pages inventory below) |
| Open Graph tags | 🔧 Extend | Add dynamic OG image generation for event pages via `@vercel/og` |
| JSON-LD structured data | 🔧 Extend | Add `Event` schema type to guest-facing event pages |
| `sitemap.xml` (auto-generated) | ✅ Keep | No changes |
| `robots.txt` (auto-generated) | ✅ Keep | No changes |
| Canonical URLs | ✅ Keep | No changes |

---

#### 5.7.1b AppConfig Current State — Needs Updating

`apps/web/src/utils/AppConfig.ts` currently contains boilerplate placeholder values that must be changed before any Bashly feature code is written:

| Field | Current Value | Bashly Target |
|---|---|---|
| `AppConfig.name` | `'SaaS Template'` | `'Bashly'` |
| `AppConfig.locales` | `['en', 'fr']` | `['en', 'es']` — Spanish is priority 1 for Sweet 16 / Quinceañera market |
| `PLAN_ID` keys | `FREE`, `PREMIUM`, `ENTERPRISE` | `FREE`, `CELEBRATION`, `PREMIUM`, `PLANNER` |
| Plan prices | $0 / $79 / $199/mo | $0 / $12 per-event / $19/mo / $49/mo |
| Plan features | `teamMember`, `website`, `storage`, `transfer` | `activeEvents`, `guestsPerEvent`, `songRequests`, `streamingExport`, `registryLinks` |
| Stripe `devPriceId` | `price_1PNksvKOp3DEwzQlGOXO7YBK` etc. | Create new prices via `npm run stripe:setup-price` |

---

#### 5.7.2 Web App Pages Inventory

All routes live under `apps/web/src/app/[locale]/` (i18n-prefixed). The `[locale]` segment is omitted from route paths below for readability — in practice, routes are `/en/dashboard`, `/es/sign-in`, etc.

**Public / Marketing**

| Page | Route | Status | Notes |
|---|---|---|---|
| Landing page | `/` | 🔧 Extend | Replace boilerplate copy with Bashly content: hero, features, event type showcase, pricing table, FAQ, CTA. SSR. |
| Sitemap | `/sitemap.xml` | ✅ Keep | Auto-generated by `apps/web/src/app/sitemap.ts` |
| Robots | `/robots.txt` | ✅ Keep | Auto-generated by `apps/web/src/app/robots.ts` |
| **Guest event page** | `/e/[slug]` | ➕ Add | ISR-rendered, publicly accessible, no auth. Bashly's flagship guest surface. Theme-branded, full feature set (RSVP, song request, map, registry, countdown). |
| **RSVP confirmation page** | `/e/[slug]/rsvp-confirmed` | ➕ Add | Post-RSVP landing. Themed to match event. Shows event summary and song request prompt. |
| **Invite claim page** | `/invite/[code]` | ➕ Add | Validates invite code → assigns role → redirects guest to event page or host to dashboard. |
| **QR code landing** | `/qr/[slug]` | ➕ Add | Minimal branded intermediate page between QR scan and full event page. Optional; can redirect directly to `/e/[slug]`. |

**Auth**

| Page | Route | Status | Notes |
|---|---|---|---|
| Sign in | `/sign-in` | 🔧 Extend | Bashly branding; add "Continue with Apple" button alongside Google + email |
| Sign up | `/sign-up` | 🔧 Extend | Bashly branding; same OAuth additions |
| Forgot password | `/forgot-password` | ✅ Keep | Better Auth built-in; minimal UI changes |
| Email verification | `/verify-email` | ✅ Keep | Better Auth built-in |
| Reset password | `/reset-password` | ✅ Keep | Better Auth built-in |

**Onboarding**

| Page | Route | Status | Notes |
|---|---|---|---|
| **Onboarding** | `/onboarding` | ➕ Add | Post-sign-up wizard: (1) event type selection, (2) event name + date, (3) connect streaming service (optional). Protected route. Skip-able. |

**Host Dashboard (authenticated)**

All dashboard pages are inside the `(auth)/dashboard/` route group. Require active session; `middleware.ts` redirects to `/sign-in` if no session cookie.

| Page | Route | Status | Notes |
|---|---|---|---|
| Dashboard home | `/dashboard` | 🔄 Replace | Boilerplate shows a placeholder. Replace with Bashly event overview (active events, quick stats, recent activity). |
| **Event list** | `/dashboard/events` | ➕ Add | All user's events. Cards with name, type, date, RSVP count, status badge. Create new event button. |
| **Create event** | `/dashboard/events/new` | ➕ Add | Multi-step form: event type → details → theme → features → publish. |
| **Event overview** | `/dashboard/events/[eventId]` | ➕ Add | Per-event dashboard. Tabs: Overview, Guests, Music, Registry, Settings. This is the main host workspace. |
| **Event overview — Guests tab** | `/dashboard/events/[eventId]/guests` | ➕ Add | Guest list table, RSVP breakdown, invite link management, bulk CSV import. |
| **Event overview — Music tab** | `/dashboard/events/[eventId]/music` | ➕ Add | Song queue, approve/reject/reorder, streaming connect + sync, request settings. |
| **Event overview — Registry tab** | `/dashboard/events/[eventId]/registry` | ➕ Add | Registry links CRUD, guest page preview, show/hide toggle. |
| **Event overview — Settings tab** | `/dashboard/events/[eventId]/settings` | ➕ Add | Event details edit, theme picker, privacy settings, RSVP config, danger zone (delete event). |
| **QR code page** | `/dashboard/events/[eventId]/qr` | ➕ Add | Full-page QR code viewer. Download PNG / SVG. Print view. |
| User profile | `/dashboard/user-profile` | ✅ Keep | Name, email, password change, avatar upload (R2). Boilerplate page; minor Bashly styling. |
| Organization / team | `/dashboard/organization-profile/organization-members` | 🔧 Extend | Maps to event team management; shows co-hosts, DJs, coordinators across all events. |
| Billing | `/dashboard/billing` | 🔧 Extend | Show Bashly plan tiers (Free, Celebration, Premium, Planner); link to Stripe customer portal. |
| Checkout confirmation | `/dashboard/billing/checkout-confirmation` | ✅ Keep | Post-Stripe success page. No changes. |
| Todos (example CRUD) | `/dashboard/todos` | 🔄 Replace | Boilerplate demo feature. Remove entirely; replaced by event management pages above. |
| Add todo | `/dashboard/todos/add` | 🔄 Replace | Remove. |
| Edit todo | `/dashboard/todos/[id]/edit` | 🔄 Replace | Remove. |

**API Routes**

| Route | Status | Notes |
|---|---|---|
| `/api/auth/[...all]` | ✅ Keep | Better Auth catch-all handler. Do not modify. |
| `/api/songs/search` | ➕ Add | Proxy to iTunes Search API. Prevents CORS issues; adds rate limiting. |
| `/api/events` | ➕ Add | CRUD for events (POST create, GET list). |
| `/api/events/[eventId]` | ➕ Add | GET / PUT / DELETE a single event. |
| `/api/events/[eventId]/rsvp` | ➕ Add | POST for unauthenticated guest RSVP submission. |
| `/api/events/[eventId]/songs` | ➕ Add | GET queue, POST new suggestion, PATCH status (approve/reject), DELETE. |
| `/api/events/[eventId]/songs/[songId]/vote` | ➕ Add | POST to upvote a song (unauthenticated, fingerprint-based). |
| `/api/events/[eventId]/playlist/export` | ➕ Add | Trigger Odesli resolution + Spotify / Apple Music playlist create/sync. |
| `/api/events/[eventId]/registry` | ➕ Add | CRUD for registry links. |
| `/api/events/[eventId]/invites` | ➕ Add | Generate invite links and QR codes. |
| `/api/invites/[code]` | ➕ Add | Validate and claim an invite code. |
| `/api/upload/presign` | ➕ Add | Generate Cloudflare R2 presigned upload URL for cover photos. |
| `/api/streaming/spotify/connect` | ➕ Add | Initiate Spotify OAuth PKCE flow. |
| `/api/streaming/spotify/callback` | ➕ Add | Handle Spotify OAuth callback; store tokens. |
| `/api/streaming/apple/connect` | ➕ Add | Initiate Apple Music MusicKit JS auth. |
| `/api/webhooks/stripe` | ✅ Keep | Boilerplate Stripe webhook handler; extend for Bashly plan logic. |

---

#### 5.7.3 Mobile App Pages Inventory (Expo)

All screens live under `apps/mobile/app/` and use Expo Router file-based routing. Route group `(auth)` requires an active Better Auth session (enforced in `_layout.tsx`); `(public)` screens are accessible without a session.

**Auth Screens**

| Screen | Route | Status | Notes |
|---|---|---|---|
| Sign in | `/(auth)/sign-in` | 🔧 Extend | Bashly branding; NativeWind + React Native Reusables; add Apple Sign-In via `expo-apple-authentication` |
| Sign up | `/(auth)/sign-up` | 🔧 Extend | Bashly branding; same OAuth additions |
| Forgot password | `/(auth)/forgot-password` | ➕ Add | Not in boilerplate mobile app; add simple email-input screen, delegates to Better Auth |

**Onboarding**

| Screen | Route | Status | Notes |
|---|---|---|---|
| **Onboarding** | `/(onboarding)/` | ➕ Add | Post-sign-up flow mirroring web onboarding; event type selection → event name/date → streaming connect |

**Host Screens (authenticated tabs)**

| Screen | Route | Status | Notes |
|---|---|---|---|
| Events list (home tab) | `/(tabs)/` | 🔄 Replace | Boilerplate shows generic dashboard. Replace with Bashly event cards list. |
| **Event detail** | `/(tabs)/events/[eventId]` | ➕ Add | Native equivalent of the web event overview. Tabs (or scroll sections): Overview, Guests, Music, Registry, Settings. |
| **Song queue** | `/(tabs)/events/[eventId]/music` | ➕ Add | Full-screen swipeable song queue. Swipe right = approve, swipe left = reject (platform gesture pattern). |
| **RSVP list** | `/(tabs)/events/[eventId]/guests` | ➕ Add | Guest list with RSVP status badges; pull-to-refresh. |
| **Create event** | `/(tabs)/events/new` | ➕ Add | Mobile-optimised multi-step form (matches web flow). |
| User profile (profile tab) | `/(tabs)/profile` | 🔧 Extend | Boilerplate profile tab; add Bashly fields (streaming connections, notification preferences). |
| **Notifications** | `/(tabs)/notifications` | ➕ Add | New RSVPs, song requests, sync completion. Uses Expo Notifications. |

**Guest Screens (public, deep-linked)**

| Screen | Route | Status | Notes |
|---|---|---|---|
| **Guest event page** | `/(public)/e/[slug]` | ➕ Add | Native equivalent of the web guest page. If app is installed and user deep-links, opens here instead of web browser. Full feature parity: RSVP, song request, map (`@rnmapbox/maps`), countdown, registry links. |
| **RSVP confirmation** | `/(public)/e/[slug]/rsvp-confirmed` | ➕ Add | Post-RSVP screen with event summary and song request prompt. |
| **Invite claim** | `/(public)/invite/[code]` | ➕ Add | Validates invite → routes to sign-in (if host role) or guest event page. |

---

#### 5.7.4 Boilerplate Features Being Removed

The following boilerplate items are scaffolding placeholders that will be deleted:

| Item | Reason |
|---|---|
| Todo CRUD pages (`/dashboard/todos`, `/dashboard/todos/add`, `/dashboard/todos/[id]/edit`) | Boilerplate example feature. Replaced by Bashly event management pages. |
| Todo Drizzle schema (`todoSchema` in `Schema.ts`) | Replaced by Bashly's full data model (Section 6). |
| Boilerplate i18n strings for Todos, `MessageState`, `SponsorLogos` | Replaced by Bashly UI strings. |
| `SponsorLogos` component | Boilerplate-specific; remove from dashboard. |
| Generic `BaseTemplate` hero copy | Replaced by Bashly landing page content. |

---

## 6. Data Model (Updated)

```sql
-- Events
events
  id                      uuid PK
  owner_id                text FK → better_auth.user.id
  slug                    text UNIQUE   -- e.g. "sweet16-sofia-2025"
  title                   text
  event_type              text          -- sweet16 | quinceanera | anniversary | graduation | reunion | birthday | custom
  description             text
  cover_image_url         text          -- R2 URL
  cover_image_key         text          -- R2 object key
  theme_id                text          -- theme1 | theme2 | theme3 | theme4 | theme5
  event_date              timestamptz
  doors_open_at           timestamptz
  venue_name              text
  venue_address           text
  venue_lat               decimal
  venue_lng               decimal
  venue_notes             text          -- parking, entrance, vendor info
  dress_code              text
  welcome_message         text
  max_capacity            integer
  rsvp_deadline           timestamptz
  address_visible         text          -- always | after_rsvp
  song_requests_enabled   boolean DEFAULT true
  song_requests_per_guest integer DEFAULT 5   -- 0 = unlimited
  song_voting_enabled     boolean DEFAULT false
  registry_enabled        boolean DEFAULT true
  status                  text          -- draft | published | completed | cancelled
  private_notes           text          -- owner + co-host only
  created_at              timestamptz
  updated_at              timestamptz

-- Event Schedule Items
schedule_items
  id            uuid PK
  event_id      uuid FK → events.id
  start_time    text          -- "7:00 PM" (display string, no tz logic needed)
  title         text          -- "Grand Entrance 👑"
  note          text          -- "Sofia's big moment!"
  sort_order    integer
  created_at    timestamptz

-- Event Roles (per-event role assignments)
event_roles
  id             uuid PK
  event_id       uuid FK → events.id
  user_id        text FK → better_auth.user.id  -- null until invite is claimed
  role           text      -- owner | co_host | coordinator | dj | guest | vip_guest | vendor
  invited_email  text      -- pre-assignment before claim
  created_at     timestamptz

-- Invites
invites
  id          uuid PK
  event_id    uuid FK → events.id
  code        text UNIQUE           -- random token in invite URL
  role        text                  -- role granted on claim
  max_uses    integer               -- null = unlimited
  use_count   integer DEFAULT 0
  expires_at  timestamptz
  created_by  text FK → better_auth.user.id
  created_at  timestamptz

-- RSVPs (unauthenticated guests — no user account needed)
rsvps
  id                   uuid PK
  event_id             uuid FK → events.id
  invite_code          text FK → invites.code
  name                 text
  email                text
  phone                text
  plus_ones            integer DEFAULT 0
  dietary_restrictions text
  status               text   -- attending | declined | maybe
  fingerprint          text   -- browser fingerprint for de-duplication (no auth)
  created_at           timestamptz

-- Song Suggestions
song_suggestions
  id                uuid PK
  event_id          uuid FK → events.id
  rsvp_id           uuid FK → rsvps.id
  itunes_track_id   text         -- from iTunes Search API
  spotify_uri       text         -- resolved via Odesli (nullable)
  apple_music_id    text         -- from iTunes (same as itunes_track_id)
  isrc              text         -- universal identifier for cross-platform resolution
  track_title       text
  artist_name       text
  album_name        text
  album_art_url     text
  guest_message     text
  status            text         -- pending | approved | rejected
  vote_count        integer DEFAULT 0
  sort_order        integer      -- for manual drag reordering
  created_at        timestamptz

-- Song Votes
song_votes
  id                   uuid PK
  song_suggestion_id   uuid FK → song_suggestions.id
  rsvp_id              uuid FK → rsvps.id
  created_at           timestamptz
  UNIQUE(song_suggestion_id, rsvp_id)

-- Streaming Connections (host's platform tokens)
streaming_connections
  id                      uuid PK
  user_id                 text FK → better_auth.user.id
  platform                text          -- spotify | apple_music
  access_token            text          -- encrypted at rest
  refresh_token           text          -- encrypted at rest (Spotify only)
  token_expires_at        timestamptz
  platform_user_id        text
  platform_display_name   text
  connected_at            timestamptz

-- Playlists (exported to streaming services)
playlists
  id                        uuid PK
  event_id                  uuid FK → events.id
  streaming_connection_id   uuid FK → streaming_connections.id
  platform                  text          -- spotify | apple_music
  platform_playlist_id      text
  platform_playlist_url     text
  last_synced_at            timestamptz
  track_count               integer
  created_at                timestamptz

-- Gift Registry Links ← NEW (replaces wishlist API approach)
registry_links
  id            uuid PK
  event_id      uuid FK → events.id
  display_name  text          -- "Amazon Wishlist", "Target Registry", etc.
  url           text          -- https://www.amazon.com/hz/wishlist/...
  domain        text          -- auto-extracted: "amazon.com" (for icon mapping)
  sort_order    integer       -- host-controlled display order
  created_at    timestamptz

-- (Better Auth auto-generates: user, session, account, organization, member, invitation tables)
```

---

## 7. Key User Flows

### Flow A: Host Creates an Event
1. Sign up / Log in → Better Auth (email/password or Google OAuth)
2. Dashboard → "Create Event" → choose event type
3. Fill: title, date/time, venue address (geocoded by Mapbox on save), dress code, cover photo upload (presigned URL → R2), theme selection
4. Add schedule items, welcome message
5. Toggle features: song requests on/off, voting on/off, address visibility, registry
6. Add gift registry links (display name + URL)
7. Publish → event gets slug + shareable link + QR code (stored in R2)
8. From Music tab: connect Spotify and/or Apple Music

### Flow B: Guest RSVPs and Suggests Songs (no account)
1. Opens invite link: `milestone.app/e/sweet16-sofia?i=abc123`
2. Sees ISR-rendered, branded event page (theme colors, cover photo, countdown)
3. RSVP button → modal form (name, email, +1s) → submits → confirmation screen
4. Sees "Request a Song" widget → types "Bruno Mars" → iTunes Search results appear with album art
5. Selects song, types message → submitted → toast: "Your song is in the queue! 🎵"
6. Can upvote other suggestions (if voting enabled)
7. Sees gift registry links, map with directions button

### Flow C: Host Exports Playlist to Spotify
1. Dashboard → Music tab → Approve songs in queue
2. Click "Export to Spotify"
3. If not connected: OAuth PKCE flow → Spotify login → return to dashboard (tokens stored encrypted)
4. App calls Odesli for each approved song: `itunes_track_id` → `spotify_uri`
5. Creates playlist via Spotify API: `"Sofia's Sweet 16 — Guest Picks"`
6. Adds all resolved tracks; shows summary: "✅ 47 added · ⚠️ 2 not found on Spotify"
7. Re-sync button available for future approvals

### Flow D: DJ Manages the Queue Live
1. DJ receives role-specific invite link → creates account or signs in
2. DJ dashboard: song queue sorted by vote count (or submission time)
3. Approve/reject individual songs; bulk approve; drag to reorder final list
4. Filter by: All / Pending / Approved / Rejected
5. One-click export triggers Spotify/Apple Music sync

### Flow E: Guest Views Gift Registry
1. Guest opens event page → scrolls to "🎁 Gift Registry" section
2. Sees list of branded link buttons: "📦 Amazon Wishlist", "🎯 Target Registry"
3. Clicks → opens wishlist in new browser tab
4. No data collected, no tracking — pure link forwarding

---

## 8. Event Themes

The guest-facing event page and QR code landing page support **5 selectable themes**. Each theme defines a complete CSS custom property set:

```css
/* Applied as: <html class="theme-1"> */
:root.theme-1 {
  --color-primary: TBD;
  --color-primary-light: TBD;
  --color-primary-dark: TBD;
  --color-accent: TBD;
  --color-surface: TBD;
  --color-surface-raised: TBD;
  --color-text: TBD;
  --color-text-muted: TBD;
  --color-border: TBD;
  --font-display: TBD;     /* e.g. 'Playfair Display' */
  --font-body: TBD;        /* e.g. 'DM Sans' */
}
/* Repeat for theme-2 through theme-5 */
```

Themes are applied at the `<html>` level on the public guest page based on the event's `theme_id`. The host dashboard previews each theme live before selecting. Theme color schemes to be provided by the designer.

**Considerations for theme accessibility:**
- Every theme must meet WCAG 2.1 AA contrast ratios (4.5:1 text, 3:1 UI)
- Themes are validated programmatically using `@accessible-colors/core` in CI
- Both light and dark variants of each theme are defined (respecting `prefers-color-scheme`)

---

## 9. Expo Mobile App Plan

The Expo app targets **iOS (App Store) and Android (Google Play Store)** and shares the same API backend as the web app.

### Scope (V1 Mobile)
**Host features:**
- Sign in / sign up (Better Auth via `@better-auth/expo`)
- Dashboard: event list, RSVP count, song queue summary
- Song queue management: approve/reject songs with swipe gestures
- Push notifications: new RSVP, new song request (via Expo Notifications)

**Guest features:**
- Open event invite link (universal links / deep links → app if installed, web if not)
- RSVP flow
- Song request with same iTunes Search integration
- Map via `@rnmapbox/maps`
- Gift registry links
- Countdown timer

### Technical Setup
- **Expo Router** for file-based navigation (mirrors Next.js App Router mental model)
- **EAS Build** for production builds — `@rnmapbox/maps` requires a native build (no Expo Go)
- **EAS Update** for OTA JS updates between app store releases
- **Universal links** (iOS) + **App Links** (Android) so `milestone.app/e/[slug]` opens in app if installed
- **`@better-auth/expo`** with `expo-secure-store` for token storage
- **`expo-image`** for optimized image loading (replaces `next/image` on native)
- **`expo-file-system`** + **`expo-sharing`** for QR code download on mobile

### Build Pipeline (GitHub Actions)
```
Push to main → Turbo build
  ├── web: next build → Vercel deploy
  └── mobile: eas build --profile production → App Store / Play Store submit
```

---

## 10. Monetization Strategy

| Tier | Price | Limits | Target |
|---|---|---|---|
| **Free** | $0 | 1 active event, 50 guests, 50 song requests, no streaming export, 1 registry link | Try before buy |
| **Celebration** | $12 / event | 1 event, 500 guests, 500 songs, both streaming platforms, QR code, 10 registry links | Single-event hosts |
| **Premium** | $19 / mo | Unlimited events, 1,000 guests/event, both streaming platforms, all themes, CSV export, 10 registry links/event | Recurring hosts |
| **Planner** | $49 / mo | Everything in Premium + up to 10 team members, vendor portal, white-label guest pages, priority support | Professional event planners |

Per-event pricing captures the majority of users (one-time celebrations). The monthly plan targets event planners running multiple events per year.

---

## 11. MVP Build Sequence

### Phase 1 — Foundation (Weeks 1–4)
- [x] Turborepo monorepo setup (web + mobile + shared packages) ✅ **Done — repo is live**
- [x] Better Auth configured (email/password, Resend email verification + reset) ✅ **Done — see Section 5.4**
- [x] Neon PostgreSQL + Drizzle ORM wired ✅ **Done — `DB.ts`, `Schema.ts`, `AuthSchema.ts`, migration 0000**
- [x] T3 Env type-safe environment variables ✅ **Done — `Env.ts` has all current vars**
- [x] Stripe billing infrastructure ✅ **Done — `organizationSchema` has Stripe fields, webhook handler exists**
- [x] Cloudflare R2 SDK installed ✅ **Done — `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner` in deps**
- [x] `middleware.ts` protecting `/dashboard`, `/onboarding`, `/api` ✅ **Done**
- [ ] **Remove boilerplate cruft** (todoSchema, Todo pages, boilerplate i18n strings, SponsorLogos) — **do this first**
- [ ] Add `organization()` + `expo()` plugins to `auth.ts` → run Better Auth CLI → migrate DB
- [ ] Add Mapbox + Spotify + Apple env vars to `Env.ts`
- [ ] Event CRUD (create, edit, publish, delete)
- [ ] Invite link + QR code generation (stored in R2)
- [ ] Guest-facing event page (ISR, theme system, RSVP flow)
- [ ] Cloudflare R2 presigned upload for cover photos
- [ ] Mapbox geocoding on address save + GL JS map on guest page
- [ ] Gift registry links (host CRUD + guest display)

### Phase 2 — Music (Weeks 5–8)
- [ ] iTunes Search API proxy (`/api/songs/search`)
- [ ] Song suggestion queue (submit, store, display)
- [ ] Song queue dashboard (approve/reject/reorder)
- [ ] Spotify OAuth PKCE + playlist export
- [ ] Odesli track resolution (iTunes ID → Spotify URI)
- [ ] Apple Music / MusicKit JS integration + export
- [ ] Re-sync functionality
- [ ] Song voting (guest upvotes, leaderboard)

### Phase 3 — Communication & Roles (Weeks 9–12)
- [ ] Resend + React Email: invite email, RSVP confirmation, song approval notification
- [ ] Role-encoded invite links (DJ, Co-Host, Coordinator, Vendor)
- [ ] Co-host dashboard access
- [ ] DJ queue management view
- [ ] Vendor portal (read-only schedule + logistics)
- [ ] Bulk CSV import for guest list

### Phase 4 — Mobile (Weeks 13–18)
- [ ] Expo app scaffold with React Native Reusables + NativeWind
- [ ] Better Auth mobile integration (`@better-auth/expo`)
- [ ] Host dashboard screens (event list, song queue, RSVP list)
- [ ] Guest event screens (RSVP, song request, map, registry links)
- [ ] `@rnmapbox/maps` integration (EAS Build)
- [ ] Universal link / deep link handling
- [ ] Expo Notifications (push alerts for hosts)
- [ ] EAS Build pipeline + App Store / Play Store submission

### Phase 5 — Scale & Polish (Ongoing)
- [ ] Analytics dashboard (events, RSVPs, song activity, page views)
- [ ] Stripe billing (per-event + subscription tiers)
- [ ] White-label guest pages (Planner tier)
- [ ] Custom event domain support (Planner tier)
- [ ] Automated a11y testing in CI (axe-core + Playwright)
- [ ] Lighthouse CI enforcement (≥ 90 scores gated in PR checks)
- [ ] i18n / localization (boilerplate includes next-intl — wire up for Spanish priority, given Sweet 16 / Quinceañera market)

---

## 12. Infrastructure Costs at Scale

| Service | Free Tier | Paid Tier |
|---|---|---|
| **Vercel** | Hobby (generous) | $20/mo Pro |
| **Neon** (PostgreSQL) | 512MB, 1 compute | $19/mo Launch |
| **Cloudflare R2** | 10GB storage, 0 egress fees | $0.015/GB storage |
| **Better Auth** | Free (self-hosted) | $0 forever |
| **Mapbox** | 50K web loads/mo, 25K mobile MAUs | $0.50–$5 / 1K above free |
| **iTunes Search API** | Unlimited | Free |
| **Odesli API** | ~10 req/s | Contact for commercial license |
| **Spotify API** | 5 test users (dev mode) | Free w/ extended access approval |
| **Apple Music API** | Included | $99/yr Apple Developer Program |
| **Resend** | 3K emails/mo, 100/day | $20/mo (50K/mo) |
| **Sentry** | 5K errors/mo | $26/mo Team |
| **EAS Build** | 30 builds/mo | $29/mo Production |

**Estimated monthly cost at 500 active events/month: ~$100–160/mo**

---

## 13. Key Decisions Log

| Decision | Chosen | Rejected | Reason |
|---|---|---|---|
| Auth | Better Auth | Clerk, Auth.js v5 | No per-user fees; Drizzle adapter; Expo plugin; Auth.js v5 absorbed into Better Auth |
| Database | Neon PostgreSQL + Drizzle | Supabase | No vendor lock-in; Drizzle already in boilerplate; Neon serverless fits event-scale traffic |
| File storage | Cloudflare R2 | Supabase Storage, S3 | Zero egress fees; S3-compatible (no SDK change); best long-term unit economics |
| Maps | Mapbox | Google Maps | White-label friendly; no per-key billing surprises; `@rnmapbox/maps` for native |
| Mobile UI | React Native Reusables + NativeWind | Tamagui, Gluestack | Official shadcn/ui ecosystem alignment; same design tokens as web |
| Wishlist | Simple link list (URL + display name) | Amazon API, MyRegistry SDK | No API dependencies; no TOS risk; more flexible (any store); easier to build/maintain |
| Email | Resend + React Email | Postmark, SendGrid | Native JSX template support; best DX for React stack |
| Song search | iTunes Search API | Spotify Search, Deezer | Free, no auth, covers both Apple Music IDs and rich metadata for cross-platform resolution |

---

*Blueprint version 2.2 — Repo review update. Section 5.4 rewritten to reflect actual implementation state: Better Auth is fully operational (email/password, verification, password reset, middleware, mobile client). Identifies what still needs to be added: `organization()` plugin, `expo()` plugin, Google/Apple OAuth. Section 5.7.1 auth table updated with accurate ✅ Done / 🔧 Extend / ➕ Add tags. Section 5.7.1b added: AppConfig fields that must be changed before feature work begins.*
