"use client";

import { useReducer, useEffect } from "react";
import AssetCard from "./AssetCard";
import { useAssetSocket, assetReducer } from "@/hooks/useAssetSocket";
import type { Asset } from "@pippit/shared";

interface AssetGridProps {
  initialAssets: Partial<Asset>[];
}

export default function AssetGrid({ initialAssets }: AssetGridProps) {
  const [assets, dispatch] = useReducer(assetReducer, initialAssets);

  // Subscribe to real-time socket events
  useAssetSocket(dispatch);

  if (assets.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          padding: "5rem 2rem",
          color: "rgba(226,232,240,0.4)",
        }}
      >
        <span style={{ fontSize: "3rem" }}>🎞️</span>
        <p style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", margin: 0 }}>
          No assets yet — upload one to get started.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
        gap: "1.25rem",
        padding: "0 1.5rem 3rem",
      }}
    >
      {assets.map((asset) => (
        <AssetCard key={asset.id} asset={asset} />
      ))}
    </div>
  );
}
