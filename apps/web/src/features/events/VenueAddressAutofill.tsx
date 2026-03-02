'use client';

import { AddressAutofill } from '@mapbox/search-js-react';
import { type ComponentPropsWithoutRef, forwardRef, useEffect, useRef } from 'react';

import { Input } from '@/components/ui/input';

export type VenueAddressParts = {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  fullAddress?: string;
};

type VenueAddressAutofillProps = Omit<ComponentPropsWithoutRef<typeof Input>, 'autoComplete'> & {
  autoComplete?: string;
  onAddressRetrieve?: (parts: VenueAddressParts) => void;
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
  const parts = resolveRetrievedParts(result);
  return parts.fullAddress;
}

function resolveRetrievedParts(result: unknown): VenueAddressParts {
  if (!isRecord(result)) {
    return {};
  }

  const features = result.features;
  if (!Array.isArray(features) || features.length === 0 || !isRecord(features[0])) {
    return {};
  }

  const firstFeature = features[0];
  const properties = isRecord(firstFeature.properties) ? firstFeature.properties : firstFeature;

  const fullAddress
    = getString(properties, 'full_address')
      ?? getString(properties, 'place_formatted')
      ?? getString(firstFeature, 'place_name');

  const line1 = getString(properties, 'address_line1');
  const line2 = getString(properties, 'address_line2');
  const place = getString(properties, 'place');
  const region = getString(properties, 'region_code') ?? getString(properties, 'region');
  const postcode = getString(properties, 'postcode');
  const country = getString(properties, 'country');

  return {
    line1,
    line2,
    city: place,
    state: region,
    postalCode: postcode,
    country,
    fullAddress,
  };
}

function getPrimaryInputValue(parts: VenueAddressParts): string | undefined {
  if (parts.line1) {
    return parts.line1;
  }
  return parts.fullAddress;
}

export const VenueAddressAutofill = forwardRef<HTMLInputElement, VenueAddressAutofillProps>(
  ({ autoComplete = 'street-address', onAddressRetrieve, ...props }, ref) => {
    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    const wrapperRef = useRef<HTMLDivElement | null>(null);
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

    useEffect(() => {
      const handlePointerDown = (event: PointerEvent) => {
        const input = inputRef.current;
        const wrapper = wrapperRef.current;
        const target = event.target;

        if (!input || !wrapper || !(target instanceof Node)) {
          return;
        }

        if (document.activeElement !== input) {
          return;
        }

        if (wrapper.contains(target)) {
          return;
        }

        input.blur();
      };

      document.addEventListener('pointerdown', handlePointerDown, true);
      return () => {
        document.removeEventListener('pointerdown', handlePointerDown, true);
      };
    }, []);

    if (!mapboxToken) {
      return (
        <div ref={wrapperRef}>
          <Input ref={setRefs} autoComplete={autoComplete} {...props} />
        </div>
      );
    }

    return (
      <div ref={wrapperRef}>
        <AddressAutofill
          accessToken={mapboxToken}
          onRetrieve={(result) => {
            const parts = resolveRetrievedParts(result);
            const fullAddress = resolveRetrievedAddress(result);
            const node = inputRef.current;

            onAddressRetrieve?.({
              ...parts,
              fullAddress,
            });

            const inputValue = getPrimaryInputValue(parts);
            if (!inputValue || !node) {
              return;
            }

            node.value = inputValue;
            node.dispatchEvent(new Event('input', { bubbles: true }));
            node.dispatchEvent(new Event('change', { bubbles: true }));
          }}
        >
          <Input ref={setRefs} autoComplete={autoComplete} {...props} />
        </AddressAutofill>
      </div>
    );
  },
);
