/**
 * Accessibility (a11y) E2E tests — WCAG 2.1 AA
 *
 * Uses @axe-core/playwright to run automated axe audits on every key page.
 * Any Critical or Serious violation causes a test failure and blocks the PR.
 *
 * Pages covered:
 *   Public / unauthenticated:
 *     - Homepage (/)
 *     - Sign in (/sign-in)
 *     - Sign up (/sign-up)
 *     - Guest event page (/e/[slug]) — requires TEST_EVENT_SLUG env var
 *     - Privacy policy (/privacy)
 *     - Terms of service (/terms)
 *     - Contact (/contact)
 *
 *   Authenticated (dashboard):
 *     - Dashboard home (/dashboard)
 *     - Event list (/dashboard/events)
 *     - Create event (/dashboard/events/new)
 *
 * Required env vars (add to .env.local or CI secrets):
 *   E2E_TEST_USER_EMAIL    — email of the test user (already auto-verified)
 *   E2E_TEST_USER_PASSWORD — password of the test user
 *   TEST_EVENT_SLUG        — slug of a published test event for guest page tests
 *
 * Run locally (from apps/web):
 *   npm run test:a11y
 *
 * Run with specific page only:
 *   npm run test:a11y -- --grep "sign-in"
 */

import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const LOCALE = 'en'; // next-intl prefix

function url(path: string): string {
  // Strip leading slash to avoid double-slash with locale prefix
  return `/${LOCALE}${path.startsWith('/') ? path : `/${path}`}`;
}

/**
 * Runs an axe audit on the current page and asserts zero Critical/Serious
 * violations. Returns the full results so callers can add extra assertions.
 */
async function auditPage(page: import('@playwright/test').Page, context?: string) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    // Exclude third-party iframes (Mapbox, Stripe, etc.) — they are not our code
    .exclude('iframe')
    .analyze();

  // Filter to only Critical and Serious violations (ignore Minor / Moderate for now)
  const blocking = results.violations.filter(v =>
    v.impact === 'critical' || v.impact === 'serious',
  );

  if (blocking.length > 0) {
    const summary = blocking
      .map((v) => {
        const nodes = v.nodes
          .slice(0, 3) // Show up to 3 failing nodes per rule
          .map(n => `    • ${n.target.join(', ')}\n      ${n.failureSummary}`)
          .join('\n');
        return `[${v.impact?.toUpperCase()}] ${v.id}: ${v.description}\n${nodes}`;
      })
      .join('\n\n');

    throw new Error(
      `Accessibility violations on ${context ?? 'page'}:\n\n${summary}\n\n`
      + `Full report: run 'npx axe ${context}' locally for details.`,
    );
  }

  return results;
}

// ---------------------------------------------------------------------------
// Sign-in helper for authenticated tests
// ---------------------------------------------------------------------------

async function signIn(page: import('@playwright/test').Page) {
  const email = process.env.E2E_TEST_USER_EMAIL;
  const password = process.env.E2E_TEST_USER_PASSWORD;

  if (!email || !password) {
    throw new Error(
      'E2E_TEST_USER_EMAIL and E2E_TEST_USER_PASSWORD must be set for authenticated a11y tests.',
    );
  }

  await page.goto(url('/sign-in'));
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL(/\/(en\/)?dashboard/, { timeout: 15_000 });
}

// ---------------------------------------------------------------------------
// Public pages — no authentication required
// ---------------------------------------------------------------------------

test.describe('a11y — public pages', () => {
  test('homepage (/)', async ({ page }) => {
    await page.goto(url('/'));
    await page.waitForLoadState('load');
    await auditPage(page, url('/'));
  });

  test('sign-in page (/sign-in)', async ({ page }) => {
    await page.goto(url('/sign-in'));
    await page.waitForLoadState('load');
    await auditPage(page, url('/sign-in'));
  });

  test('sign-up page (/sign-up)', async ({ page }) => {
    await page.goto(url('/sign-up'));
    await page.waitForLoadState('load');
    await auditPage(page, url('/sign-up'));
  });

  test('privacy policy (/privacy)', async ({ page }) => {
    await page.goto(url('/privacy'));
    await page.waitForLoadState('load');
    await auditPage(page, url('/privacy'));
  });

  test('terms of service (/terms)', async ({ page }) => {
    await page.goto(url('/terms'));
    await page.waitForLoadState('load');
    await auditPage(page, url('/terms'));
  });

  test('contact page (/contact)', async ({ page }) => {
    await page.goto(url('/contact'));
    await page.waitForLoadState('load');
    await auditPage(page, url('/contact'));
  });

  test('guest event page (/e/[slug])', async ({ page }) => {
    const slug = process.env.TEST_EVENT_SLUG;

    if (!slug) {
      test.skip(true, 'TEST_EVENT_SLUG not set — skipping guest event page a11y test');
      return;
    }

    // Guest event page lives outside the [locale] segment
    await page.goto(`/e/${slug}`);
    await page.waitForLoadState('load');

    // Wait for Mapbox GL JS to finish rendering (it injects canvas elements)
    await page.waitForTimeout(1_500);

    await auditPage(page, `/e/${slug}`);
  });
});

// ---------------------------------------------------------------------------
// Authenticated pages — require sign-in
// ---------------------------------------------------------------------------

test.describe('a11y — authenticated dashboard pages', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
  });

  test('dashboard home (/dashboard)', async ({ page }) => {
    await page.goto(url('/dashboard'));
    await page.waitForLoadState('load');
    await auditPage(page, url('/dashboard'));
  });

  test('event list (/dashboard/events)', async ({ page }) => {
    await page.goto(url('/dashboard/events'));
    await page.waitForLoadState('load');
    await auditPage(page, url('/dashboard/events'));
  });

  test('create event form (/dashboard/events/new)', async ({ page }) => {
    await page.goto(url('/dashboard/events/new'));
    await page.waitForLoadState('load');
    // Audit step 1 of the multi-step form
    await auditPage(page, url('/dashboard/events/new') + ' (step 1)');

    // Advance to step 2 if the "Next" button is present
    const nextButton = page.getByRole('button', { name: /next/i });
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await page.waitForTimeout(300);
      await auditPage(page, url('/dashboard/events/new') + ' (step 2)');
    }
  });
});

// ---------------------------------------------------------------------------
// Interactive state audits — modals, focus traps, aria-live regions
// ---------------------------------------------------------------------------

test.describe('a11y — interactive states', () => {
  test('RSVP modal on guest event page has no violations when open', async ({ page }) => {
    const slug = process.env.TEST_EVENT_SLUG;

    if (!slug) {
      test.skip(true, 'TEST_EVENT_SLUG not set — skipping RSVP modal a11y test');
      return;
    }

    await page.goto(`/e/${slug}`);
    await page.waitForLoadState('load');

    // Open the RSVP modal
    const rsvpButton = page.getByRole('button', { name: /rsvp/i });
    await expect(rsvpButton).toBeVisible();
    await rsvpButton.click();

    // Wait for the modal to fully open
    await expect(page.getByRole('dialog')).toBeVisible();

    await auditPage(page, `/e/${slug} (RSVP modal open)`);
  });

  test('sign-in form shows accessible error state on invalid submit', async ({ page }) => {
    await page.goto(url('/sign-in'));
    await page.waitForLoadState('load');

    // Submit with empty fields to trigger validation errors
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForTimeout(300);

    // Audit with error messages visible
    await auditPage(page, url('/sign-in') + ' (validation errors visible)');
  });
});
