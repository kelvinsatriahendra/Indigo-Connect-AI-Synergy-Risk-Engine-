import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  serverExternalPackages: ["pdf2json"],
  experimental: {
    authInterrupts: true,
  },
};

export default nextConfig;
