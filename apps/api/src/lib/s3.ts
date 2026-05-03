import { S3Client } from "@aws-sdk/client-s3";

const s3Config: ConstructorParameters<typeof S3Client>[0] = {
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
};

/**
 * When S3_ENDPOINT is set (local MinIO), switch to path-style addressing.
 * In production (real AWS), leave endpoint undefined — SDK uses default resolution.
 */
if (process.env.S3_ENDPOINT) {
  s3Config.endpoint = process.env.S3_ENDPOINT;
  s3Config.forcePathStyle = true;
}

export const s3Client = new S3Client(s3Config);

export const BUCKET_NAME = process.env.S3_BUCKET_NAME || "pippit-assets";

/**
 * Public base URL for assets:
 *  - Dev:  http://localhost:9000/pippit-assets
 *  - Prod: https://XXXX.cloudfront.net
 */
export const CDN_DOMAIN =
  process.env.CLOUDFRONT_DOMAIN ||
  `http://localhost:9000/${BUCKET_NAME}`;
