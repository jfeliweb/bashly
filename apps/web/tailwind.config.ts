/* eslint-disable ts/no-require-imports */
import sharedConfig from '@saas/tailwind-config';
import type { Config } from 'tailwindcss';

const config = {
  darkMode: ['class'],
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  presets: [sharedConfig as Config],
  plugins: [require('tailwindcss-animate')],
} satisfies Config;

export default config;
