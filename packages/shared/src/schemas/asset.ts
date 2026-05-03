import { z } from "zod";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const AssetFolderEnum = z.enum(["characters", "frames", "misc"]);
export type AssetFolder = z.infer<typeof AssetFolderEnum>;

export const AssetStatusEnum = z.enum(["PENDING", "READY", "FAILED"]);
export type AssetStatus = z.infer<typeof AssetStatusEnum>;

export const ImageContentTypeEnum = z.enum([
  "image/png",
  "image/jpeg",
  "image/webp",
]);
export const VideoContentTypeEnum = z.enum(["video/mp4", "video/webm"]);
export const ContentTypeEnum = z.union([
  ImageContentTypeEnum,
  VideoContentTypeEnum,
]);
export type ContentType = z.infer<typeof ContentTypeEnum>;

// ─── HTTP Request Schemas ─────────────────────────────────────────────────────

export const presignRequestSchema = z.object({
  filename: z.string().min(1).max(255),
  contentType: ContentTypeEnum,
  folder: AssetFolderEnum,
  sizeBytes: z.number().int().positive().max(200_000_000), // 200 MB
});
export type PresignRequest = z.infer<typeof presignRequestSchema>;

export const confirmUploadSchema = z.object({
  assetId: z.string().cuid(),
  sizeBytes: z.number().int().positive(),
});
export type ConfirmUpload = z.infer<typeof confirmUploadSchema>;

// ─── HTTP Response Schemas ────────────────────────────────────────────────────

export const presignResponseSchema = z.object({
  uploadUrl: z.string().url(),
  assetId: z.string(),
  key: z.string(),
});
export type PresignResponse = z.infer<typeof presignResponseSchema>;

// ─── Asset Model (mirrors Prisma output) ─────────────────────────────────────

export const assetSchema = z.object({
  id: z.string(),
  key: z.string(),
  publicUrl: z.string().url().nullable(),
  thumbUrl: z.string().url().nullable(),
  filename: z.string(),
  contentType: z.string(),
  sizeBytes: z.number(),
  folder: z.string(),
  status: AssetStatusEnum,
  metadata: z.record(z.unknown()).nullable(),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
});
export type Asset = z.infer<typeof assetSchema>;

// ─── Socket.IO Event Schemas ──────────────────────────────────────────────────

export const assetPendingEventSchema = z.object({
  id: z.string(),
  filename: z.string(),
  folder: AssetFolderEnum,
});
export type AssetPendingEvent = z.infer<typeof assetPendingEventSchema>;

export const assetReadyEventSchema = z.object({
  id: z.string(),
  publicUrl: z.string().url(),
  thumbUrl: z.string().url().optional(),
  filename: z.string(),
  metadata: z.record(z.unknown()).optional(),
});
export type AssetReadyEvent = z.infer<typeof assetReadyEventSchema>;

export const assetFailedEventSchema = z.object({
  id: z.string(),
  error: z.string(),
});
export type AssetFailedEvent = z.infer<typeof assetFailedEventSchema>;

// ─── Socket.IO Typed Events Map ───────────────────────────────────────────────

export interface ServerToClientEvents {
  "asset:pending": (data: AssetPendingEvent) => void;
  "asset:ready": (data: AssetReadyEvent) => void;
  "asset:failed": (data: AssetFailedEvent) => void;
}

export interface ClientToServerEvents {
  // reserved for future use
}
