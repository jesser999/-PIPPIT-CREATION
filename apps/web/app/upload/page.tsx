import type { Metadata } from "next";
import Link from "next/link";
import UploadZone from "@/components/UploadZone";

export const metadata: Metadata = {
  title: "Upload Asset — PIPPIT CREATION",
  description: "Upload PIPPIT character PNGs and animation frames to AWS S3 via secure presigned URLs.",
};

export default function UploadPage() {
  return (
    <main className="page-bg">
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "3rem 0" }}>
        {/* Back link */}
        <div style={{ padding: "0 1.5rem 2rem" }}>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              fontSize: "0.85rem",
              color: "rgba(168,85,247,0.8)",
              textDecoration: "none",
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              transition: "color 0.2s",
            }}
          >
            ← Back to Library
          </Link>
        </div>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <h1
            className="gradient-text"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
              fontWeight: 800,
              margin: "0 0 0.75rem",
              letterSpacing: "-0.02em",
            }}
          >
            Upload Asset
          </h1>
          <p style={{ color: "rgba(226,232,240,0.55)", fontSize: "0.95rem", margin: 0 }}>
            Files are uploaded directly to S3 via presigned URL.
            <br />
            The API generates a WebP thumbnail automatically.
          </p>
        </div>

        {/* Upload component */}
        <UploadZone />

        {/* Info cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
            padding: "2rem 1.5rem 0",
          }}
        >
          {[
            { icon: "🔐", title: "Presigned URL", body: "15-min expiry. File goes directly from your browser to S3 — API never proxies binary data." },
            { icon: "⚡", title: "WebP Thumbnails", body: "Sharp processes your image server-side and generates a 400px WebP thumbnail on confirm." },
            { icon: "🌐", title: "CloudFront CDN", body: "Assets are served globally with minimal latency via AWS CloudFront edge locations." },
            { icon: "📡", title: "Real-time", body: "The asset grid updates instantly via Socket.IO — no manual refresh required." },
          ].map(({ icon, title, body }) => (
            <div key={title} className="glass" style={{ padding: "1rem 1.1rem" }}>
              <div style={{ fontSize: "1.4rem", marginBottom: "0.4rem" }}>{icon}</div>
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  color: "#E2E8F0",
                  margin: "0 0 0.35rem",
                }}
              >
                {title}
              </h3>
              <p style={{ fontSize: "0.75rem", color: "rgba(226,232,240,0.5)", margin: 0, lineHeight: 1.5 }}>
                {body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
