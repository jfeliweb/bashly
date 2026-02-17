/**
 * One-time script to configure CORS on the Cloudflare R2 bucket.
 * Run from the apps/web directory:
 *   node scripts/setup-r2-cors.mjs
 *
 * Requires: R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME
 * to be set in .env.local (loaded via dotenv).
 */

import { resolve } from 'node:path';

import { GetBucketCorsCommand, PutBucketCorsCommand, S3Client } from '@aws-sdk/client-s3';
import { config } from 'dotenv';

config({ path: resolve(process.cwd(), '.env.local') });

const raw = process.env.R2_ENDPOINT ?? '';
const url = new URL(raw);
const endpoint = `${url.protocol}//${url.host}`;
const bucketName = process.env.R2_BUCKET_NAME;

if (!endpoint || !bucketName) {
  console.error('Missing R2_ENDPOINT or R2_BUCKET_NAME in .env.local');
  process.exit(1);
}

const s3 = new S3Client({
  region: 'auto',
  endpoint,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const corsRules = [
  {
    AllowedOrigins: [
      'http://localhost:3000',
      'https://bashly.app',
      'https://www.bashly.app',
    ],
    AllowedMethods: ['GET', 'PUT', 'HEAD'],
    AllowedHeaders: ['*'],
    ExposeHeaders: ['ETag', 'Content-Length'],
    MaxAgeSeconds: 3600,
  },
];

async function main() {
  console.log(`Setting CORS on bucket "${bucketName}" at ${endpoint}...`);

  await s3.send(
    new PutBucketCorsCommand({
      Bucket: bucketName,
      CORSConfiguration: { CORSRules: corsRules },
    }),
  );

  console.log('CORS policy applied successfully!\n');

  const result = await s3.send(
    new GetBucketCorsCommand({ Bucket: bucketName }),
  );

  console.log('Current CORS rules:');
  console.log(JSON.stringify(result.CORSRules, null, 2));
}

main().catch((err) => {
  console.error('Failed to set CORS:', err.message);
  process.exit(1);
});
