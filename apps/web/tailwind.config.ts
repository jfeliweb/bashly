/* eslint-disable ts/no-require-imports */
import type { Config } from 'tailwindcss';

import sharedConfig from '@saas/tailwind-config';

const config = {
  darkMode: ['class'],
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  presets: [sharedConfig as Config],
  plugins: [require('tailwindcss-animate')],
} satisfies Config;

export default config;
