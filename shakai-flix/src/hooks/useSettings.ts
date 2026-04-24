"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { useCallback, useEffect } from "react";
import { getDB } from "@/lib/db";
import type { UserSettings } from "@/lib/types";

const DEFAULTS: UserSettings = {
  id: "singleton",
  theme: "dark",
  playbackRate: 1,
  defaultLayout: "theater",
  dailyGoalMinutes: 15,
};

export type FontSize = "sm" | "base" | "lg";

const FONT_SIZE_KEY = "shakai-flix:font-size";

export function useSettings() {
  const settings = useLiveQuery(async () => {
    const db = getDB();
    return (await db.settings.get("singleton")) ?? DEFAULTS;
  }, []);

  const update = useCallback(async (patch: Partial<UserSettings>) => {
    const db = getDB();
    const existing = (await db.settings.get("singleton")) ?? DEFAULTS;
    await db.settings.put({ ...existing, ...patch, id: "singleton" });
  }, []);

  return { settings: settings ?? DEFAULTS, update };
}

export function getStoredFontSize(): FontSize {
  if (typeof window === "undefined") return "base";
  const v = window.localStorage.getItem(FONT_SIZE_KEY);
  if (v === "sm" || v === "base" || v === "lg") return v;
  return "base";
}

export function setStoredFontSize(size: FontSize) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(FONT_SIZE_KEY, size);
  applyFontSize(size);
}

function applyFontSize(size: FontSize) {
  const root = document.documentElement;
  root.dataset.fontSize = size;
  root.style.fontSize =
    size === "sm" ? "14px" : size === "lg" ? "18px" : "16px";
}

export function useFontSizeBoot() {
  useEffect(() => {
    applyFontSize(getStoredFontSize());
  }, []);
}
