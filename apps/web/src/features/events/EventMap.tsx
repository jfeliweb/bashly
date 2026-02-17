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
    <section className="mx-auto max-w-[520px] px-4 pb-6">
      {hasCoords
        ? (
            <div
              role="img"
              aria-label={t('map_aria', { venue: venueName ?? '' })}
              className="overflow-hidden rounded-xl border"
              style={{ borderColor: 'var(--theme-border)' }}
            >
              <div className="h-[240px] w-full sm:h-[320px]">
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
        <div className="mt-3 text-center">
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t('directions_aria', { venue: venueName ?? venueAddress ?? '' })}
            className="inline-flex min-h-[44px] items-center justify-center rounded-[100px] bg-[rgb(81,255,0)] px-6 font-nunito text-sm font-bold text-[rgb(9,21,27)] transition-colors hover:bg-[rgb(65,204,0)] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[rgb(37,90,116)]"
          >
            {t('get_directions')}
          </a>
        </div>
      )}
    </section>
  );
}
