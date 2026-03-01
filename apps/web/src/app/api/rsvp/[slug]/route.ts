import { rsvpSchema } from '@saas/validators';
import { and, count, eq } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';
import { createElement } from 'react';

import { RsvpConfirmationEmail } from '@/emails/RsvpConfirmationEmail';
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

    // Send confirmation email on update if attending (fire-and-forget)
    if (data.email && data.status === 'attending') {
      void sendConfirmationEmail({
        guestName: data.name,
        email: data.email,
        event,
        plusOnes: data.plus_ones,
      });
    }

    const res = NextResponse.json(
      { rsvp_id: existing.id, message: 'RSVP updated' },
      { status: 200 },
    );
    if (data.status === 'attending' && fingerprint) {
      res.cookies.set('bashly_rsvp_fp', fingerprint, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365, // 1 year
        path: '/',
      });
    }
    return res;
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

  // 6. Send confirmation email if attending and email is provided (fire-and-forget)
  if (data.email && data.status === 'attending' && rsvp) {
    void sendConfirmationEmail({
      guestName: data.name,
      email: data.email,
      event,
      plusOnes: rsvp.plusOnes,
    });
  }

  const res = NextResponse.json(
    { rsvp_id: rsvp?.id, message: 'RSVP confirmed' },
    { status: 201 },
  );
  if (data.status === 'attending' && fingerprint) {
    res.cookies.set('bashly_rsvp_fp', fingerprint, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: '/',
    });
  }
  return res;
}

/* ------------------------------------------------------------------ */
/* Helper: Send RSVP confirmation email                                */
/* ------------------------------------------------------------------ */

type EventForEmail = {
  title: string;
  slug: string;
  eventDate: Date | null;
  doorsOpenAt: Date | null;
  venueName: string | null;
  venueAddress: string | null;
};

async function sendConfirmationEmail({
  guestName,
  email,
  event,
  plusOnes,
}: {
  guestName: string;
  email: string;
  event: EventForEmail;
  plusOnes: number;
}) {
  const baseUrl = getBaseUrl();
  const eventPageUrl = `${baseUrl}/e/${event.slug}`;

  const eventDate = event.eventDate
    ? event.eventDate.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : undefined;

  const eventTime = event.doorsOpenAt
    ? event.doorsOpenAt.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      })
    : undefined;

  try {
    await sendEmail({
      to: email,
      subject: `You're confirmed for ${event.title}!`,
      react: createElement(RsvpConfirmationEmail, {
        guestName,
        eventTitle: event.title,
        eventDate,
        eventTime,
        venueName: event.venueName ?? undefined,
        venueAddress: event.venueAddress ?? undefined,
        eventPageUrl,
        plusOnes,
      }),
    });
  } catch (err) {
    // Log but don't fail the RSVP if email fails
    console.error('Failed to send RSVP confirmation email:', err);
  }
}
