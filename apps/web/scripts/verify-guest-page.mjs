#!/usr/bin/env node
/**
 * Verifies the public guest event page.
 * Run with dev server up: node scripts/verify-guest-page.mjs
 * Optional: GUEST_EVENT_SLUG=your-published-slug to test full page content.
 */
const base = process.env.BASE_URL || 'http://localhost:3000';

async function main() {
  const results = [];

  // 1. Unknown slug → 404
  const r404 = await fetch(`${base}/en/e/nonexistent-slug-${Date.now()}`, {
    redirect: 'follow',
  });
  const ok404 = r404.status === 404;
  results.push({ name: 'Unknown slug returns 404', ok: ok404, status: r404.status });

  // 2. Optional: published slug → 200 and body contains RSVP
  const slug = process.env.GUEST_EVENT_SLUG;
  if (slug) {
    const r200 = await fetch(`${base}/en/e/${slug}`, { redirect: 'follow' });
    const html = await r200.text();
    const ok200 = r200.status === 200 && html.includes('RSVP');
    results.push({
      name: `Published event /en/e/${slug} returns 200 with RSVP`,
      ok: ok200,
      status: r200.status,
    });
  }

  const failed = results.filter(r => !r.ok);
  if (failed.length) {
    console.error('Guest page verification failed:');
    failed.forEach(r => console.error('  -', r.name, r.status));
    process.exit(1);
  }
  console.log('Guest page verification passed:');
  results.forEach(r => console.log('  ✓', r.name));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
