import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      // MinIO — local Docker dev
      {
        protocol: "http",
        hostname: "localhost",
        port: "9000",
        pathname: "/**",
      },
      // AWS CloudFront — production
      {
        protocol: "https",
        hostname: "*.cloudfront.net",
        pathname: "/**",
      },
    ],
  },
  experimental: {
    // Required for React 19 compatibility
    reactCompiler: false,
  },
};

export default nextConfig;
