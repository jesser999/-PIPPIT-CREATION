"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { presignUpload, confirmUpload } from "@/lib/api";
import { uploadToS3 } from "@/lib/uploadToS3";
import type { AssetFolder } from "@pippit/shared";

const FOLDERS: AssetFolder[] = ["characters", "frames", "misc"];

const ACCEPT = {
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/webp": [".webp"],
  "video/mp4": [".mp4"],
  "video/webm": [".webm"],
};

interface UploadState {
  status: "idle" | "presigning" | "uploading" | "confirming" | "done" | "error";
  percent: number;
  error?: string;
  filename?: string;
}

export default function UploadZone() {
  const [folder, setFolder] = useState<AssetFolder>("characters");
  const [uploadState, setUploadState] = useState<UploadState>({
    status: "idle",
    percent: 0,
  });

  const reset = () => setUploadState({ status: "idle", percent: 0 });

  const handleUpload = useCallback(
    async (file: File) => {
      try {
        setUploadState({ status: "presigning", percent: 0, filename: file.name });

        // 1. Get presigned URL + create PENDING record
        const { uploadUrl, assetId } = await presignUpload({
          filename: file.name,
          contentType: file.type as any,
          folder,
          sizeBytes: file.size,
        });

        // 2. PUT directly to S3/MinIO
        setUploadState({ status: "uploading", percent: 0, filename: file.name });
        await uploadToS3(uploadUrl, file, file.type, ({ percent }: { percent: number }) => {
          setUploadState((s) => ({ ...s, percent }));
        });

        // 3. Confirm → triggers Sharp + READY transition
        setUploadState({ status: "confirming", percent: 100, filename: file.name });
        await confirmUpload(assetId, file.size);

        setUploadState({ status: "done", percent: 100, filename: file.name });
        setTimeout(reset, 3000);
      } catch (err: any) {
        setUploadState({
          status: "error",
          percent: 0,
          error: err?.message || "Upload failed",
          filename: file.name,
        });
        setTimeout(reset, 5000);
      }
    },
    [folder]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files) => files[0] && handleUpload(files[0]),
    accept: ACCEPT,
    multiple: false,
    disabled: uploadState.status !== "idle",
    maxSize: 200 * 1024 * 1024,
  });

  const isActive = uploadState.status !== "idle";

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: "0 1.5rem" }}>
      {/* Folder selector */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", justifyContent: "center" }}>
        {FOLDERS.map((f) => (
          <button
            key={f}
            onClick={() => setFolder(f)}
            disabled={isActive}
            style={{
              padding: "0.4rem 1rem",
              borderRadius: "var(--radius-pill)",
              border: folder === f ? "1px solid var(--color-electric-purple)" : "1px solid var(--color-border)",
              background: folder === f ? "rgba(124,58,237,0.2)" : "transparent",
              color: folder === f ? "var(--color-electric-purple)" : "rgba(226,232,240,0.5)",
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              fontSize: "0.8rem",
              cursor: isActive ? "not-allowed" : "pointer",
              textTransform: "capitalize",
              transition: "all 0.2s ease",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Drop zone */}
      <div
        {...getRootProps()}
        id="upload-dropzone"
        className="glass"
        style={{
          padding: "3rem 2rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          cursor: isActive ? "not-allowed" : "pointer",
          border: isDragActive
            ? "2px dashed var(--color-electric-purple)"
            : "2px dashed rgba(124,58,237,0.3)",
          transition: "border-color 0.2s ease, background 0.2s ease",
          background: isDragActive ? "rgba(124,58,237,0.08)" : undefined,
          minHeight: 200,
        }}
      >
        <input {...getInputProps()} id="upload-file-input" />

        {uploadState.status === "idle" && (
          <>
            <div style={{ fontSize: "2.5rem" }}>
              {isDragActive ? "📂" : "☁️"}
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, margin: 0, fontSize: "1rem", color: "#E2E8F0" }}>
                {isDragActive ? "Drop it!" : "Drag & drop or click to upload"}
              </p>
              <p style={{ margin: "0.35rem 0 0", fontSize: "0.78rem", color: "rgba(226,232,240,0.4)" }}>
                PNG, JPG, WebP, MP4, WebM · max 200 MB · folder: <strong style={{ color: "var(--color-electric-purple)" }}>{folder}</strong>
              </p>
            </div>
          </>
        )}

        {uploadState.status === "presigning" && (
          <StatusMessage icon="🔑" text={`Securing upload URL for ${uploadState.filename}…`} />
        )}

        {uploadState.status === "uploading" && (
          <ProgressBar percent={uploadState.percent} label={uploadState.filename} />
        )}

        {uploadState.status === "confirming" && (
          <StatusMessage icon="⚡" text="Processing with Sharp — generating WebP thumbnail…" />
        )}

        {uploadState.status === "done" && (
          <StatusMessage icon="✅" text={`${uploadState.filename} is live!`} color="var(--color-success)" />
        )}

        {uploadState.status === "error" && (
          <StatusMessage icon="❌" text={uploadState.error ?? "Upload failed"} color="var(--color-danger)" />
        )}
      </div>
    </div>
  );
}

function StatusMessage({
  icon,
  text,
  color,
}: {
  icon: string;
  text: string;
  color?: string;
}) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{icon}</div>
      <p
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "0.9rem",
          color: color ?? "#E2E8F0",
          margin: 0,
        }}
      >
        {text}
      </p>
    </div>
  );
}

function ProgressBar({ percent, label }: { percent: number; label?: string }) {
  return (
    <div style={{ width: "100%", maxWidth: 340, textAlign: "center" }}>
      <p style={{ fontFamily: "var(--font-display)", fontSize: "0.88rem", color: "#E2E8F0", margin: "0 0 0.75rem" }}>
        Uploading {label} — {percent}%
      </p>
      <div
        style={{
          width: "100%",
          height: 6,
          background: "var(--color-surface-raised)",
          borderRadius: "var(--radius-pill)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${percent}%`,
            height: "100%",
            background: "linear-gradient(90deg, var(--color-neon-violet), var(--color-electric-purple))",
            borderRadius: "var(--radius-pill)",
            transition: "width 0.3s ease",
            boxShadow: "var(--shadow-glow-violet)",
          }}
        />
      </div>
    </div>
  );
}
