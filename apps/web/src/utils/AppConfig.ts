const localePrefix = 'as-needed' as const;

export const AppConfig = {
  name: 'Bashly',
  locales: ['en', 'es'] as const,
  defaultLocale: 'en' as const,
  localePrefix,
  localeNames: {
    en: 'English',
    es: 'Español',
  } as const,
};

export type AppLocale = (typeof AppConfig.locales)[number];

export const AllLocales = [...AppConfig.locales];

export const PLAN_ID = {
  FREE: 'free',
  CELEBRATION: 'celebration',
  PREMIUM: 'premium',
  PLANNER: 'planner',
} as const;

export type PlanId = (typeof PLAN_ID)[keyof typeof PLAN_ID];

type PlanConfigEntry = {
  price: number;
  name: string;
  description: string;
  billing?: 'per-event' | 'monthly';
  features: {
    activeEvents: number;
    guestsPerEvent: number;
    songRequests: number;
    streamingExport: boolean;
    registryLinks: number;
    teamMembers?: number;
    whiteLabel?: boolean;
    vendorPortal?: boolean;
    prioritySupport?: boolean;
  };
};

export const PlanConfig: Record<PlanId, PlanConfigEntry> = {
  [PLAN_ID.FREE]: {
    price: 0,
    name: 'Free',
    description: 'Perfect for trying Bashly',
    features: {
      activeEvents: 1,
      guestsPerEvent: 50,
      songRequests: 50,
      streamingExport: false,
      registryLinks: 1,
    },
  },
  [PLAN_ID.CELEBRATION]: {
    price: 12,
    name: 'Celebration',
    description: 'For a single unforgettable event',
    billing: 'per-event',
    features: {
      activeEvents: 1,
      guestsPerEvent: 500,
      songRequests: 500,
      streamingExport: true,
      registryLinks: 10,
    },
  },
  [PLAN_ID.PREMIUM]: {
    price: 19,
    name: 'Premium',
    description: 'For recurring event hosts',
    billing: 'monthly',
    features: {
      activeEvents: 999,
      guestsPerEvent: 1000,
      songRequests: 1000,
      streamingExport: true,
      registryLinks: 10,
    },
  },
  [PLAN_ID.PLANNER]: {
    price: 49,
    name: 'Planner',
    description: 'For professional event planners',
    billing: 'monthly',
    features: {
      activeEvents: 999,
      guestsPerEvent: 999999,
      songRequests: 999999,
      streamingExport: true,
      registryLinks: 999,
      teamMembers: 10,
      whiteLabel: true,
      vendorPortal: true,
      prioritySupport: true,
    },
  },
};
