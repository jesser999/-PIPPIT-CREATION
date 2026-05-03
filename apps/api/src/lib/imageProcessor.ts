import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import { Readable } from "stream";
import { s3Client, BUCKET_NAME, CDN_DOMAIN } from "./s3";

const IMAGE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
]);

export interface ProcessingResult {
  thumbKey: string;
  thumbUrl: string;
  metadata: {
    width?: number;
    height?: number;
    format?: string;
    thumbSizeBytes: number;
  };
}

async function streamToBuffer(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

/**
 * Downloads the original from S3/MinIO, generates a 400px-wide WebP thumbnail
 * using Sharp, re-uploads it to thumbnails/<key>.webp, and returns URLs + metadata.
 *
 * Returns null for non-image content types (videos skip thumbnail generation).
 */
export async function processImage(
  key: string,
  contentType: string
): Promise<ProcessingResult | null> {
  if (!IMAGE_TYPES.has(contentType)) return null;

  // 1. Download original
  const { Body } = await s3Client.send(
    new GetObjectCommand({ Bucket: BUCKET_NAME, Key: key })
  );
  if (!Body) throw new Error("Empty body from S3");

  const originalBuffer = await streamToBuffer(Body as Readable);

  // 2. Sharp pipeline: auto-rotate → resize → WebP
  const pipeline = sharp(originalBuffer).rotate();
  const { width, height, format } = await pipeline.metadata();

  const webpBuffer = await sharp(originalBuffer)
    .rotate()
    .resize({ width: 400, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();

  // 3. Upload thumbnail
  const thumbKey = `thumbnails/${key.replace(/\.[^.]+$/, "")}.webp`;
  await s3Client.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: thumbKey,
      Body: webpBuffer,
      ContentType: "image/webp",
      CacheControl: "public, max-age=31536000, immutable",
    })
  );

  return {
    thumbKey,
    thumbUrl: `${CDN_DOMAIN}/${thumbKey}`,
    metadata: {
      width,
      height,
      format,
      thumbSizeBytes: webpBuffer.length,
    },
  };
}
