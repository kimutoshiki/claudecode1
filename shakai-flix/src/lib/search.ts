import Fuse from "fuse.js";
import { getAllVideos } from "./videos";
import type { VideoMeta } from "./types";

let fuseInstance: Fuse<VideoMeta> | null = null;

function getFuse(): Fuse<VideoMeta> {
  if (!fuseInstance) {
    fuseInstance = new Fuse(getAllVideos(), {
      keys: [
        { name: "title", weight: 2 },
        { name: "description", weight: 1 },
        { name: "series", weight: 1.5 },
        { name: "tags", weight: 1.5 },
      ],
      threshold: 0.35,
      ignoreLocation: true,
      includeScore: false,
    });
  }
  return fuseInstance;
}

export function searchVideos(query: string): VideoMeta[] {
  const q = query.trim();
  if (!q) return [];
  return getFuse()
    .search(q)
    .map((r) => r.item);
}
