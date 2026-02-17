import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { auth } from '@/libs/auth';
import { Env } from '@/libs/Env';

const s3 = new S3Client({
  region: 'auto',
  endpoint: Env.R2_ENDPOINT,
  credentials: {
    accessKeyId: Env.R2_ACCESS_KEY_ID,
    secretAccessKey: Env.R2_SECRET_ACCESS_KEY,
  },
  requestChecksumCalculation: 'WHEN_REQUIRED',
  responseChecksumValidation: 'WHEN_REQUIRED',
});

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const;

const EXT_MAP: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

const presignBodySchema = z.object({
  filename: z.string().min(1),
  contentType: z.enum(ALLOWED_TYPES),
  eventId: z.string().min(1),
});

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = presignBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request. Accepted types: JPEG, PNG, WebP, GIF.', code: 'VALIDATION_ERROR' },
      { status: 400 },
    );
  }

  const { contentType, eventId } = parsed.data;
  const ext = EXT_MAP[contentType];
  const objectKey = `events/${eventId}/cover-${Date.now()}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: Env.R2_BUCKET_NAME,
    Key: objectKey,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

  return NextResponse.json({
    uploadUrl,
    objectKey,
    publicUrl: `${Env.R2_PUBLIC_DOMAIN.replace(/\/$/, '')}/${objectKey}`,
  });
}
