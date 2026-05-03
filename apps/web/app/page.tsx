import Link from "next/link";
import BrainHero from "@/components/BrainHero";
import AssetGrid from "@/components/AssetGrid";
import { listAssets } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // SSR initial asset load — Socket.IO takes over after hydration
  let initialAssets: any[] = [];
  try {
    const { assets } = await listAssets({ limit: 40 });
    initialAssets = assets;
  } catch {
    // API might not be ready yet; grid starts empty
  }

  return (
    <main className="page-bg">
      <BrainHero />

      {/* Navigation bar */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 1.5rem 1.5rem",
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "1.15rem",
            color: "#E2E8F0",
            margin: 0,
          }}
        >
          Asset Library
          <span
            style={{
              marginLeft: "0.65rem",
              fontFamily: "var(--font-mono)",
              fontSize: "0.7rem",
              color: "rgba(168,85,247,0.8)",
              background: "rgba(124,58,237,0.12)",
              padding: "0.15rem 0.5rem",
              borderRadius: "var(--radius-pill)",
              border: "1px solid rgba(124,58,237,0.2)",
            }}
          >
            {initialAssets.length} assets
          </span>
        </h2>

        <Link href="/upload" id="go-to-upload">
          <button className="btn-primary">
            <span>⬆️</span> Upload Asset
          </button>
        </Link>
      </nav>

      {/* Real-time asset grid */}
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <AssetGrid initialAssets={initialAssets} />
      </div>
    </main>
  );
}
