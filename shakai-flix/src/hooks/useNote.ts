"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { useCallback } from "react";
import { getDB } from "@/lib/db";
import type { Note } from "@/lib/types";

export function useNote(videoId: string) {
  const note = useLiveQuery(async () => {
    const db = getDB();
    return (await db.notes.get(videoId)) ?? null;
  }, [videoId]);

  const save = useCallback(
    async (patch: Partial<Omit<Note, "videoId" | "updatedAt">>) => {
      const db = getDB();
      const existing = (await db.notes.get(videoId)) ?? null;
      const base: Note = existing ?? {
        videoId,
        content: "",
        contentMarkdown: "",
        screenshots: [],
        tags: [],
        updatedAt: Date.now(),
      };
      const next: Note = {
        ...base,
        ...patch,
        videoId,
        updatedAt: Date.now(),
      };
      await db.notes.put(next);
    },
    [videoId],
  );

  return { note, save };
}
