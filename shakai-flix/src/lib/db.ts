import Dexie, { type EntityTable } from "dexie";
import type { MyListEntry, Note, QuizAttempt, UserSettings, WatchProgress } from "./types";

export class ShakaiFlixDB extends Dexie {
  watchProgress!: EntityTable<WatchProgress, "videoId">;
  notes!: EntityTable<Note, "videoId">;
  quizAttempts!: EntityTable<QuizAttempt, "id">;
  myList!: EntityTable<MyListEntry, "videoId">;
  settings!: EntityTable<UserSettings, "id">;

  constructor() {
    super("shakai-flix");
    this.version(1).stores({
      watchProgress: "videoId, lastWatchedAt, completed",
      notes: "videoId, updatedAt, *tags",
      quizAttempts: "id, videoId, finishedAt, passed",
      myList: "videoId, addedAt",
      settings: "id",
    });
  }
}

let singleton: ShakaiFlixDB | null = null;

export function getDB(): ShakaiFlixDB {
  if (typeof window === "undefined") {
    throw new Error("IndexedDB is browser-only. Call getDB() inside client code.");
  }
  if (!singleton) singleton = new ShakaiFlixDB();
  return singleton;
}

export const DEFAULT_SETTINGS: UserSettings = {
  id: "singleton",
  theme: "dark",
  playbackRate: 1,
  defaultLayout: "theater",
  dailyGoalMinutes: 20,
};
