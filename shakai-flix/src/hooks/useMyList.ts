"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { useCallback } from "react";
import { getDB } from "@/lib/db";

export function useMyList() {
  const entries = useLiveQuery(async () => {
    const db = getDB();
    return db.myList.orderBy("addedAt").reverse().toArray();
  }, []);

  const toggle = useCallback(async (videoId: string) => {
    const db = getDB();
    const existing = await db.myList.get(videoId);
    if (existing) {
      await db.myList.delete(videoId);
    } else {
      await db.myList.put({ videoId, addedAt: Date.now() });
    }
  }, []);

  const inList = useCallback((videoId: string) => {
    return entries?.some((e) => e.videoId === videoId) ?? false;
  }, [entries]);

  return { entries: entries ?? [], toggle, inList };
}
