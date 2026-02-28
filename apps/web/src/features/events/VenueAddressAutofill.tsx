'use client';

import { AddressAutofill } from '@mapbox/search-js-react';
import { type ComponentPropsWithoutRef, forwardRef, useRef } from 'react';

import { Input } from '@/components/ui/input';

type VenueAddressAutofillProps = Omit<ComponentPropsWithoutRef<typeof Input>, 'autoComplete'> & {
  autoComplete?: string;
};

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null;
}

function getString(record: UnknownRecord, key: string): string | undefined {
  const value = record[key];
  return typeof value === 'string' && value.trim().length > 0 ? value : undefined;
}

function resolveRetrievedAddress(result: unknown): string | undefined {
  if (!isRecord(result)) {
    return undefined;
  }

  const features = result.features;
  if (!Array.isArray(features) || features.length === 0 || !isRecord(features[0])) {
    return undefined;
  }

  const firstFeature = features[0];
  const properties = isRecord(firstFeature.properties) ? firstFeature.properties : firstFeature;

  const formattedAddress
    = getString(properties, 'full_address')
      ?? getString(properties, 'place_formatted')
      ?? getString(firstFeature, 'place_name');

  if (formattedAddress) {
    return formattedAddress;
  }

  const line1 = getString(properties, 'address_line1');
  const line2 = getString(properties, 'address_line2');
  const place = getString(properties, 'place');
  const region = getString(properties, 'region_code') ?? getString(properties, 'region');
  const postcode = getString(properties, 'postcode');
  const country = getString(properties, 'country');

  const street = [line1, line2].filter(Boolean).join(' ');
  const locality = [place, region, postcode].filter(Boolean).join(', ');
  const full = [street, locality, country].filter(Boolean).join(', ');

  return full || undefined;
}

export const VenueAddressAutofill = forwardRef<HTMLInputElement, VenueAddressAutofillProps>(
  ({ autoComplete = 'street-address', ...props }, ref) => {
    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    const inputRef = useRef<HTMLInputElement | null>(null);

    const setRefs = (node: HTMLInputElement | null) => {
      inputRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
        return;
      }
      if (ref) {
        ref.current = node;
      }
    };

    if (!mapboxToken) {
      return <Input ref={setRefs} autoComplete={autoComplete} {...props} />;
    }

    return (
      <AddressAutofill
        accessToken={mapboxToken}
        onRetrieve={(result) => {
          const fullAddress = resolveRetrievedAddress(result);
          const node = inputRef.current;
          if (!fullAddress || !node) {
            return;
          }

          node.value = fullAddress;
          node.dispatchEvent(new Event('input', { bubbles: true }));
          node.dispatchEvent(new Event('change', { bubbles: true }));
        }}
      >
        <Input ref={setRefs} autoComplete={autoComplete} {...props} />
      </AddressAutofill>
    );
  },
);
