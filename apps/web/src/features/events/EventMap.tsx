'use client';

import 'mapbox-gl/dist/mapbox-gl.css';

import { MapPin } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import Map, { Marker } from 'react-map-gl/mapbox';

type EventMapProps = {
  lat: number | null;
  lng: number | null;
  venueName: string | null;
  venueAddress: string | null;
};

export function EventMap({ lat, lng, venueName, venueAddress }: EventMapProps) {
  const t = useTranslations('GuestEvent');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
  }, []);

  const destination = encodeURIComponent(venueAddress ?? venueName ?? '');
  const directionsUrl = isMobile
    ? `maps://maps.apple.com/?daddr=${destination}`
    : `https://www.google.com/maps/dir/?api=1&destination=${destination}`;

  const hasCoords = lat !== null && lng !== null;

  return (
    <div>
      {hasCoords
        ? (
            <div
              role="img"
              aria-label={t('map_aria', { venue: venueName ?? '' })}
              className="overflow-hidden rounded-xl border"
              style={{ borderColor: 'var(--theme-border)' }}
            >
              <div className="h-[170px] w-full sm:h-[220px]">
                <Map
                  initialViewState={{
                    longitude: lng,
                    latitude: lat,
                    zoom: 14,
                  }}
                  interactive={false}
                  style={{ width: '100%', height: '100%' }}
                  mapStyle="mapbox://styles/mapbox/streets-v12"
                  mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
                >
                  <Marker longitude={lng} latitude={lat} anchor="bottom">
                    <MapPin className="size-8 text-red-600 drop-shadow-md" />
                  </Marker>
                </Map>
              </div>
            </div>
          )
        : (
            venueAddress && (
              <div
                className="rounded-xl p-4"
                style={{
                  backgroundColor: 'var(--theme-surface-raised)',
                  border: '1px solid var(--theme-border)',
                }}
              >
                <p className="font-nunito text-sm text-[var(--theme-text)]">
                  {venueAddress}
                </p>
              </div>
            )
          )}

      {(venueAddress || venueName) && (
        <div className="mt-3">
          {venueName && (
            <p className="font-nunito text-sm font-bold text-[var(--theme-text)]">{venueName}</p>
          )}
          {venueAddress && (
            <p className="mt-0.5 font-nunito text-xs text-[var(--theme-text-muted)]">{venueAddress}</p>
          )}
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t('directions_aria', { venue: venueName ?? venueAddress ?? '' })}
            className="mt-3 inline-flex min-h-[44px] w-full items-center justify-center rounded-xl px-6 font-nunito text-sm font-bold text-white transition-opacity hover:opacity-95 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[var(--theme-primary)]"
            style={{ backgroundColor: 'var(--theme-primary-dark)' }}
          >
            {t('get_directions')}
          </a>
        </div>
      )}
    </div>
  );
}
