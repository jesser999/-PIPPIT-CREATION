"use client";

import Image from "next/image";

export default function BrainHero() {
  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "4rem 1.5rem 2rem",
        textAlign: "center",
        position: "relative",
      }}
    >
      {/* Ambient glow ring */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          width: "340px",
          height: "340px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Brain character — floating animation */}
      <div className="animate-float" style={{ position: "relative", width: 220, height: 220 }}>
        <Image
          src="/brain-character.png"
          alt="PIPPIT Brain Character"
          width={220}
          height={220}
          priority
          style={{ filter: "drop-shadow(0 8px 32px rgba(124,58,237,0.5))", objectFit: "contain" }}
        />
      </div>

      {/* Headings */}
      <h1
        className="gradient-text"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(2rem, 5vw, 3.5rem)",
          fontWeight: 800,
          lineHeight: 1.1,
          margin: "1.5rem 0 0.75rem",
          letterSpacing: "-0.03em",
        }}
      >
        PIPPIT CREATION
      </h1>

      <p
        style={{
          color: "rgba(226,232,240,0.65)",
          fontSize: "1.05rem",
          maxWidth: "480px",
          lineHeight: 1.7,
          margin: "0 auto",
        }}
      >
        High-performance media management for your animated series.
        <br />
        Upload, process, and stream assets globally — in real time.
      </p>

      {/* Stats bar */}
      <div
        style={{
          display: "flex",
          gap: "2rem",
          marginTop: "2.5rem",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {[
          { label: "CDN", value: "CloudFront" },
          { label: "Storage", value: "AWS S3" },
          { label: "Real-time", value: "Socket.IO" },
          { label: "Processing", value: "Sharp WebP" },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="glass"
            style={{
              padding: "0.75rem 1.25rem",
              textAlign: "center",
              minWidth: "110px",
            }}
          >
            <div
              style={{
                fontSize: "0.65rem",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "rgba(168,85,247,0.8)",
                marginBottom: "0.25rem",
              }}
            >
              {label}
            </div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "0.95rem",
                color: "#E2E8F0",
              }}
            >
              {value}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
