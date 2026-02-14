import type { Config } from 'tailwindcss';

import sharedConfig from '@saas/tailwind-config';

const config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  presets: [sharedConfig as Config, require('nativewind/preset')],
} satisfies Config;

export default config;
