import type { MetadataRoute } from "next";
import { withBasePath } from "@/lib/utils";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  const start = withBasePath("/") || "/";
  return {
    name: "Shakai Flix — 中学社会 学習アプリ",
    short_name: "Shakai Flix",
    description:
      "NHK for School の中学社会動画を Netflix 風 UI で視聴・学習管理",
    start_url: start,
    scope: start,
    display: "standalone",
    background_color: "#0f0f0f",
    theme_color: "#e50914",
    orientation: "any",
    lang: "ja",
    icons: [
      {
        src: withBasePath("/icons/icon-192.svg"),
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: withBasePath("/icons/icon-512.svg"),
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
