'use client';

import { AddressAutofill } from '@mapbox/search-js-react';
import type { ComponentPropsWithoutRef } from 'react';
import { forwardRef } from 'react';

import { Input } from '@/components/ui/input';

type VenueAddressAutofillProps = Omit<ComponentPropsWithoutRef<typeof Input>, 'autoComplete'> & {
  autoComplete?: string;
};

export const VenueAddressAutofill = forwardRef<HTMLInputElement, VenueAddressAutofillProps>(
  ({ autoComplete = 'street-address', ...props }, ref) => {
    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

    if (!mapboxToken) {
      return <Input ref={ref} autoComplete={autoComplete} {...props} />;
    }

    return (
      <AddressAutofill accessToken={mapboxToken}>
        <Input ref={ref} autoComplete={autoComplete} {...props} />
      </AddressAutofill>
    );
  },
);
