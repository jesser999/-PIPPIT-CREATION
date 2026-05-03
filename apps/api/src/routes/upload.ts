import "dotenv/config";
import { Router, type IRouter } from "express";
import type { Request, Response } from "express";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";
import { prisma, Prisma } from "@pippit/db";
import { presignRequestSchema, confirmUploadSchema } from "@pippit/shared";
import { s3Client, BUCKET_NAME, CDN_DOMAIN } from "../lib/s3";
import { processImage } from "../lib/imageProcessor";
import { validateBody } from "../middleware/validateBody";
import {
  emitAssetPending,
  emitAssetReady,
  emitAssetFailed,
} from "../socket/events";

const router: IRouter = Router();

// ─── POST /api/upload/presign ──────────────────────────────────────────────────
router.post(
  "/presign",
  validateBody(presignRequestSchema),
  async (req: Request, res: Response): Promise<void> => {
    const { filename, contentType, folder, sizeBytes } = req.body;

    try {
      const ext = filename.split(".").pop() ?? "bin";
      const uniqueKey = `${folder}/${crypto.randomUUID()}-${Date.now()}.${ext}`;

      // Create PENDING record before generating URL
      const asset = await prisma.asset.create({
        data: { key: uniqueKey, filename, contentType, sizeBytes, folder, status: "PENDING" },
      });

      // Generate 15-minute presigned PUT URL
      const uploadUrl = await getSignedUrl(
        s3Client,
        new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: uniqueKey,
          ContentType: contentType,
        }),
        { expiresIn: 900 }
      );

      // Notify all connected clients
      emitAssetPending(req.io, {
        id: asset.id,
        filename: asset.filename,
        folder: asset.folder as any,
      });

      res.json({ uploadUrl, assetId: asset.id, key: uniqueKey });
    } catch (err) {
      console.error("[presign] error:", err);
      res.status(500).json({ error: "Failed to generate upload URL" });
    }
  }
);

// ─── POST /api/upload/confirm ──────────────────────────────────────────────────
router.post(
  "/confirm",
  validateBody(confirmUploadSchema),
  async (req: Request, res: Response): Promise<void> => {
    const { assetId, sizeBytes } = req.body;

    let asset;
    try {
      asset = await prisma.asset.findUniqueOrThrow({ where: { id: assetId } });
    } catch {
      res.status(404).json({ error: "Asset not found" });
      return;
    }

    try {
      // Run Sharp thumbnail generation (skipped automatically for videos)
      let thumbUrl: string | undefined;
      let metadata: Prisma.JsonObject = {};

      try {
        const result = await processImage(asset.key, asset.contentType);
        if (result) {
          thumbUrl = result.thumbUrl;
          metadata = result.metadata as Prisma.JsonObject;
        }
      } catch (procErr) {
        console.error("[confirm] Sharp error (non-fatal):", procErr);
        metadata = { processingWarning: String(procErr) } as Prisma.JsonObject;
      }

      const publicUrl = `${CDN_DOMAIN}/${asset.key}`;

      // Transition to READY
      const updated = await prisma.asset.update({
        where: { id: assetId },
        data: { status: "READY", publicUrl, thumbUrl, sizeBytes, metadata },
      });

      emitAssetReady(req.io, {
        id: updated.id,
        publicUrl: updated.publicUrl!,
        thumbUrl: updated.thumbUrl ?? undefined,
        filename: updated.filename,
        metadata,
      });

      res.json({ asset: updated });
    } catch (err) {
      console.error("[confirm] error:", err);

      // Transition to FAILED
      await prisma.asset
        .update({
          where: { id: assetId },
          data: { status: "FAILED", metadata: { error: String(err) } },
        })
        .catch(() => {});

      emitAssetFailed(req.io, { id: assetId, error: String(err) });
      res.status(500).json({ error: "Failed to process upload" });
    }
  }
);

export default router;
