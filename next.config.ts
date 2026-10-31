import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained server build for a small Docker image.
  output: "standalone",
  // Public hostnames `next dev` may be served under (comma-separated), e.g. a
  // dev tunnel for demoing. Dev-only; no effect on the production container.
  allowedDevOrigins: process.env.DEV_ALLOWED_ORIGINS?.split(",").filter(Boolean) ?? [],
};

export default nextConfig;
