import { S3Client } from '@aws-sdk/client-s3';

import { Env } from './Env';

export const r2 = new S3Client({
  region: 'auto',
  endpoint: Env.R2_ENDPOINT,
  credentials: {
    accessKeyId: Env.R2_ACCESS_KEY_ID!,
    secretAccessKey: Env.R2_SECRET_ACCESS_KEY!,
  },
});

export const R2_BUCKET_NAME = Env.R2_BUCKET_NAME;
