"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { useCallback } from "react";
import { getDB } from "@/lib/db";
import type { WatchProgress } from "@/lib/types";

export function useWatchProgress(videoId: string) {
  const progress = useLiveQuery(async () => {
    const db = getDB();
    return (await db.watchProgress.get(videoId)) ?? null;
  }, [videoId]);

  const save = useCallback(
    async (patch: Partial<Omit<WatchProgress, "videoId">>) => {
      const db = getDB();
      const existing = (await db.watchProgress.get(videoId)) ?? null;
      const base: WatchProgress = existing ?? {
        videoId,
        positionSec: 0,
        durationSec: 0,
        lastWatchedAt: Date.now(),
        completed: false,
      };
      const next: WatchProgress = {
        ...base,
        ...patch,
        videoId,
        lastWatchedAt: Date.now(),
      };
      await db.watchProgress.put(next);
    },
    [videoId],
  );

  return { progress, save };
}

export function useAllWatchProgress() {
  return useLiveQuery(async () => {
    const db = getDB();
    return db.watchProgress.toArray();
  }, []);
}
