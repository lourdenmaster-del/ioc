import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  /** Isolate tracing when this app lives inside a parent repo with another lockfile. */
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
