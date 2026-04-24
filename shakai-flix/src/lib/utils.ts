import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  const mm = String(m).padStart(h > 0 ? 2 : 1, "0");
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function withBasePath(url: string): string {
  if (!url) return url;
  if (/^[a-z][a-z0-9+.-]*:/i.test(url) || url.startsWith("//")) return url;
  if (!url.startsWith("/")) return url;
  if (BASE_PATH && url.startsWith(BASE_PATH + "/")) return url;
  return `${BASE_PATH}${url}`;
}

export function parseTimestamp(text: string): number | null {
  const match = text.match(/^\[(\d{1,2}):(\d{2})(?::(\d{2}))?\]$/);
  if (!match) return null;
  const [, a, b, c] = match;
  if (!a || !b) return null;
  if (c !== undefined) {
    return Number(a) * 3600 + Number(b) * 60 + Number(c);
  }
  return Number(a) * 60 + Number(b);
}
