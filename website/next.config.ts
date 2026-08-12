import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  agentRules: false,
  transpilePackages: ["react-icon-transition"],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "react-icon-transition": path.resolve(root, "../package/src/index.ts"),
    };
    return config;
  },
};

export default nextConfig;
