import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './migrations',
  schema: ['./src/models/Schema.ts', './src/models/AuthSchema.ts'],
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? '',
  },
  verbose: true,
  strict: true,
});
