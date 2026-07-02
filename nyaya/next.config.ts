import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Pin the tracing root so stray lockfiles above this directory can't make
  // Next bundle serverless functions with wrong relative paths.
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
