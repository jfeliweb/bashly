import { render } from '@react-email/components';
import { rsvpSchema } from '@saas/validators';
import { and, count, eq } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';

import { RsvpConfirmation } from '@/emails/RsvpConfirmation';
import { db } from '@/libs/DB';
import { sendEmail } from '@/libs/resend';
import { eventTable, rsvpTable } from '@/models/Schema';
import { getBaseUrl } from '@/utils/Helpers';

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function POST(req: NextRequest, context: RouteContext) {
  const { slug } = await context.params;

  // 1. Parse and validate body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 },
    );
  }

  const parsed = rsvpSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const data = parsed.data;

  // 2. Find event by slug — must be published
  const event = await db.query.eventTable.findFirst({
    where: eq(eventTable.slug, slug),
  });

  if (!event || event.status !== 'published') {
    return NextResponse.json(
      { error: 'Event not found' },
      { status: 404 },
    );
  }

  // 3. Check RSVP deadline
  if (event.rsvpDeadline && new Date() > event.rsvpDeadline) {
    return NextResponse.json(
      { error: 'RSVP deadline has passed' },
      { status: 422 },
    );
  }

  // 4. Check capacity
  if (event.maxCapacity) {
    const [result] = await db
      .select({ value: count() })
      .from(rsvpTable)
      .where(
        and(
          eq(rsvpTable.eventId, event.id),
          eq(rsvpTable.status, 'attending'),
        ),
      );

    if (result && result.value >= event.maxCapacity) {
      return NextResponse.json(
        { error: 'Event is at full capacity' },
        { status: 422 },
      );
    }
  }

  // 5. Upsert — check fingerprint match first
  const fingerprint = data.fingerprint ?? '';

  const existing = await db.query.rsvpTable.findFirst({
    where: and(
      eq(rsvpTable.eventId, event.id),
      eq(rsvpTable.fingerprint, fingerprint),
    ),
  });

  if (existing) {
    await db
      .update(rsvpTable)
      .set({
        name: data.name,
        email: data.email ?? null,
        phone: data.phone ?? null,
        status: data.status,
        plusOnes: data.plus_ones,
        dietaryRestrictions: data.dietary_restrictions ?? null,
      })
      .where(eq(rsvpTable.id, existing.id));

    // Send confirmation email on update if attending
    if (data.email && data.status === 'attending') {
      await sendConfirmationEmail({
        guestName: data.name,
        email: data.email,
        event,
      });
    }

    return NextResponse.json(
      { rsvp_id: existing.id, message: 'RSVP updated' },
      { status: 200 },
    );
  }

  // Insert new RSVP
  const [rsvp] = await db
    .insert(rsvpTable)
    .values({
      eventId: event.id,
      name: data.name,
      email: data.email ?? null,
      phone: data.phone ?? null,
      status: data.status,
      plusOnes: data.plus_ones,
      dietaryRestrictions: data.dietary_restrictions ?? null,
      fingerprint,
    })
    .returning();

  // 6. Send confirmation email if attending and email is provided
  if (data.email && data.status === 'attending' && rsvp) {
    await sendConfirmationEmail({
      guestName: data.name,
      email: data.email,
      event,
    });
  }

  return NextResponse.json(
    { rsvp_id: rsvp?.id, message: 'RSVP confirmed' },
    { status: 201 },
  );
}

/* ------------------------------------------------------------------ */
/* Helper: Send RSVP confirmation email                                */
/* ------------------------------------------------------------------ */

type EventForEmail = {
  title: string;
  slug: string;
  eventDate: Date | null;
  venueName: string | null;
};

async function sendConfirmationEmail({
  guestName,
  email,
  event,
}: {
  guestName: string;
  email: string;
  event: EventForEmail;
}) {
  const baseUrl = getBaseUrl();
  const eventUrl = `${baseUrl}/e/${event.slug}`;
  const eventDate = event.eventDate
    ? new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }).format(event.eventDate)
    : 'Date TBA';

  try {
    const html = await render(
      RsvpConfirmation({
        guestName,
        eventTitle: event.title,
        eventDate,
        venueName: event.venueName,
        eventUrl,
      }),
    );

    await sendEmail({
      from: 'Bashly <noreply@bashly.app>',
      to: email,
      subject: `You're on the list for ${event.title}! 🎉`,
      html,
    });
  } catch (err) {
    // Log but don't fail the RSVP if email fails
    console.error('Failed to send RSVP confirmation email:', err);
  }
}
