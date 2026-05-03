import type { Asset, PresignRequest, PresignResponse } from "@pippit/shared";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// ─── Assets ──────────────────────────────────────────────────────────────────

export async function listAssets(params?: {
  folder?: string;
  status?: string;
  cursor?: string;
  limit?: number;
}): Promise<{ assets: Asset[]; nextCursor: string | null }> {
  const url = new URL("/api/assets", API_URL);
  if (params?.folder) url.searchParams.set("folder", params.folder);
  if (params?.status) url.searchParams.set("status", params.status);
  if (params?.cursor) url.searchParams.set("cursor", params.cursor);
  if (params?.limit) url.searchParams.set("limit", String(params.limit));

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch assets");
  return res.json();
}

// ─── Upload Flow ──────────────────────────────────────────────────────────────

export async function presignUpload(
  body: PresignRequest
): Promise<PresignResponse & { assetId: string }> {
  const res = await fetch(`${API_URL}/api/upload/presign`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Presign request failed");
  }
  return res.json();
}

export async function confirmUpload(
  assetId: string,
  sizeBytes: number
): Promise<{ asset: Asset }> {
  const res = await fetch(`${API_URL}/api/upload/confirm`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ assetId, sizeBytes }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Confirm request failed");
  }
  return res.json();
}
