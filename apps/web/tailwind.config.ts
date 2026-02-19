/* eslint-disable ts/no-require-imports */
import sharedConfig from '@saas/tailwind-config';
import type { Config } from 'tailwindcss';
import { fontFamily } from 'tailwindcss/defaultTheme';

const config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
    './src/templates/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  presets: [sharedConfig as Config],
  plugins: [require('tailwindcss-animate')],
  theme: {
    extend: {
      colors: {
        // Bashly Brand Colors - Cerulean (Primary)
        cerulean: {
          50: 'rgb(236 244 249)',
          100: 'rgb(216 234 243)',
          200: 'rgb(177 213 231)',
          300: 'rgb(139 192 218)',
          400: 'rgb(100 171 206)',
          500: 'rgb(61 150 194)',
          600: 'rgb(49 120 155)',
          700: 'rgb(37 90 116)',
          800: 'rgb(24 60 78)',
          900: 'rgb(12 30 39)',
          950: 'rgb(9 21 27)',
        },
        // Bashly Brand Colors - Bright Fern (Accent)
        fern: {
          50: 'rgb(238 255 229)',
          500: 'rgb(81 255 0)',
          600: 'rgb(65 204 0)',
          700: 'rgb(48 153 0)',
          800: 'rgb(32 102 0)',
        },
      },
      fontFamily: {
        sans: ['var(--font-nunito)', ...fontFamily.sans],
        heading: ['var(--font-bricolage)', ...fontFamily.sans],
        mono: ['var(--font-jetbrains)', ...fontFamily.mono],
        bricolage: ['var(--font-bricolage)', ...fontFamily.sans],
        nunito: ['var(--font-nunito)', ...fontFamily.sans],
      },
    },
  },
} satisfies Config;

export default config;
