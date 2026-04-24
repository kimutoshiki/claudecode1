import type { VideoMeta, WatchProgress } from "./types";
import { getAllVideos, getVideosBySeries } from "./videos";

export interface QueueContext {
  currentId: string;
  progress: Map<string, WatchProgress>;
}

export function buildNextUpQueue({ currentId, progress }: QueueContext, limit = 8): VideoMeta[] {
  const all = getAllVideos();
  const current = all.find((v) => v.id === currentId);
  if (!current) return [];

  const isCompleted = (id: string) => progress.get(id)?.completed === true;

  const sameSeriesNext: VideoMeta[] = getVideosBySeries(current.series).filter(
    (v) => v.episode > current.episode,
  );

  const tagSet = new Set(current.tags);
  const sameTagUnseen = all.filter(
    (v) =>
      v.id !== currentId &&
      v.series !== current.series &&
      !isCompleted(v.id) &&
      v.tags.some((t) => tagSet.has(t)),
  );

  const recommended = all.filter(
    (v) =>
      v.id !== currentId &&
      !sameSeriesNext.includes(v) &&
      !sameTagUnseen.includes(v),
  );

  const merged: VideoMeta[] = [];
  const seen = new Set<string>([currentId]);
  for (const v of [...sameSeriesNext, ...sameTagUnseen, ...recommended]) {
    if (seen.has(v.id)) continue;
    seen.add(v.id);
    merged.push(v);
    if (merged.length >= limit) break;
  }
  return merged;
}
