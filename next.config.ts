import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  basePath: isProd ? "/food-logger-ai" : "",
  assetPrefix: isProd ? "/food-logger-ai/" : "",
};

export default nextConfig;
