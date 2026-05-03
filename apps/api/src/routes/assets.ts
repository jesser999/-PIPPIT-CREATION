import { Router, type IRouter } from "express";
import { prisma } from "@pippit/db";
import type { Request, Response } from "express";

const router: IRouter = Router();

// ─── GET /api/assets ──────────────────────────────────────────────────────────
router.get("/", async (req: Request, res: Response): Promise<void> => {
  const folder = req.query.folder ? String(req.query.folder) : undefined;
  const status  = req.query.status  ? String(req.query.status)  : undefined;
  const cursor  = req.query.cursor  ? String(req.query.cursor)  : undefined;
  const take    = Math.min(parseInt(String(req.query.limit ?? "20"), 10), 100);

  try {
    const assets = await prisma.asset.findMany({
      where: {
        ...(folder ? { folder } : {}),
        ...(status ? { status: status as any } : {}),
      },
      orderBy: { createdAt: "desc" },
      take,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    res.json({
      assets,
      nextCursor:
        assets.length === take ? assets[assets.length - 1].id : null,
    });
  } catch (err) {
    console.error("[assets] list error:", err);
    res.status(500).json({ error: "Failed to fetch assets" });
  }
});

// ─── GET /api/assets/:id ──────────────────────────────────────────────────────
router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const asset = await prisma.asset.findUniqueOrThrow({
      where: { id: String(req.params.id) },
    });
    res.json({ asset });
  } catch {
    res.status(404).json({ error: "Asset not found" });
  }
});

export default router;
