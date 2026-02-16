import { expect, test } from '@playwright/test';

/**
 * Guest event page (public) at /[locale]/e/[slug].
 * - Unknown or draft slug → 404.
 * - Published event slug → page with hero, countdown, RSVP button, etc.
 */
test.describe('Guest Event Page', () => {
  test('returns 404 for unknown event slug', async ({ page, baseURL }) => {
    const res = await page.goto(`${baseURL}/en/e/nonexistent-slug-${Date.now()}`);
    expect(res?.status()).toBe(404);
  });

  test('returns 404 for missing slug segment', async ({ page, baseURL }) => {
    const res = await page.goto(`${baseURL}/en/e/`);
    expect(res?.status()).toBe(404);
  });

  test('guest page shows key sections when published event exists', async ({
    page,
    baseURL,
  }) => {
    const slug = process.env.GUEST_EVENT_SLUG;
    if (!slug) {
      test.skip();
      return;
    }
    const res = await page.goto(`${baseURL}/en/e/${slug}`);
    expect(res?.status()).toBe(200);
    await expect(page.getByRole('button', { name: /RSVP Now/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Powered by Bashly/i })).toBeVisible();
  });
});
