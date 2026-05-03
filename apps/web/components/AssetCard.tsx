"use client";

import Image from "next/image";
import type { Asset } from "@pippit/shared";

interface AssetCardProps {
  asset: Partial<Asset>;
}

const STATUS_COLORS = {
  PENDING: "badge-pending",
  READY:   "badge-ready",
  FAILED:  "badge-failed",
};

const STATUS_DOTS = {
  PENDING: "🟡",
  READY:   "🟢",
  FAILED:  "🔴",
};

function formatBytes(bytes?: number) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(2)} MB`;
}

export default function AssetCard({ asset }: AssetCardProps) {
  const status = (asset.status ?? "PENDING") as keyof typeof STATUS_COLORS;
  const isImage = asset.contentType?.startsWith("image/");
  const displayUrl = asset.thumbUrl || asset.publicUrl;

  return (
    <article
      className="glass animate-slide-up"
      style={{
        overflow: "hidden",
        transition: "transform 0.25s ease, box-shadow 0.25s ease",
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
        (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-glow-violet)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-card)";
      }}
    >
      {/* Thumbnail area */}
      <div
        style={{
          width: "100%",
          aspectRatio: "16/9",
          background: "var(--color-deep-space)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {status === "PENDING" && (
          <div
            className="skeleton"
            style={{ width: "100%", height: "100%", borderRadius: 0 }}
          />
        )}

        {status === "READY" && displayUrl && isImage && (
          <Image
            src={displayUrl}
            alt={asset.filename ?? "asset"}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            style={{ objectFit: "cover" }}
          />
        )}

        {status === "READY" && !isImage && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              fontSize: "2.5rem",
            }}
          >
            🎬
          </div>
        )}

        {status === "FAILED" && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              gap: "0.5rem",
              color: "var(--color-danger)",
              fontSize: "0.8rem",
            }}
          >
            <span style={{ fontSize: "1.8rem" }}>⚠️</span>
            Processing failed
          </div>
        )}

        {/* Status badge overlay */}
        <div style={{ position: "absolute", top: "0.5rem", right: "0.5rem" }}>
          <span className={`badge ${STATUS_COLORS[status]}`}>
            {STATUS_DOTS[status]} {status}
          </span>
        </div>
      </div>

      {/* Card body */}
      <div style={{ padding: "0.85rem 1rem" }}>
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            fontSize: "0.9rem",
            color: "#E2E8F0",
            margin: "0 0 0.35rem",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={asset.filename}
        >
          {asset.filename ?? "Uploading…"}
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "0.72rem",
            color: "rgba(226,232,240,0.45)",
            fontFamily: "var(--font-mono)",
          }}
        >
          <span>{asset.folder ?? "—"}</span>
          <span>{formatBytes(asset.sizeBytes)}</span>
        </div>
      </div>
    </article>
  );
}
