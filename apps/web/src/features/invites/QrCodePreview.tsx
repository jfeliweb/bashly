'use client';

import { useEffect, useState } from 'react';

type Props = { eventId: string; slug: string };

export function QrCodePreview({ eventId, slug }: Props) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;

    fetch(`/api/events/${eventId}/qr?format=png`, { credentials: 'include' })
      .then(r => r.blob())
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob);
        setSrc(objectUrl);
      })
      .catch(() => {
        // Silently fail — download buttons still work
      });

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [eventId]);

  if (!src) {
    return (
      <div
        className="size-[200px] animate-pulse rounded-lg bg-muted"
        aria-label="Loading QR code"
        role="img"
      />
    );
  }

  return (
    <img
      src={src}
      alt={`QR code for ${slug}`}
      width={200}
      height={200}
      className="rounded-lg border border-border"
    />
  );
}
