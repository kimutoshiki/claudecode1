import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const isGhPages = process.env.GH_PAGES === "true";
const basePath = isGhPages ? "/claudecode1/shakai-flix" : "";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  cacheOnNavigation: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development" || isGhPages,
});

const nextConfig: NextConfig = {
  output: isGhPages ? "export" : undefined,
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
  trailingSlash: true,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  images: {
    unoptimized: true,
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default withSerwist(nextConfig);
