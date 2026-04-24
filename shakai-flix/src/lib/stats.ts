import type { QuizAttempt, WatchProgress } from "./types";

export interface DailyStat {
  date: string;
  minutes: number;
}

function toDateKey(epochMs: number): string {
  const d = new Date(epochMs);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function computeDaily(progress: WatchProgress[]): DailyStat[] {
  const bucket = new Map<string, number>();
  for (const p of progress) {
    const key = toDateKey(p.lastWatchedAt);
    const minutes = Math.max(1, Math.round(p.positionSec / 60));
    bucket.set(key, (bucket.get(key) ?? 0) + minutes);
  }
  return Array.from(bucket.entries())
    .map(([date, minutes]) => ({ date, minutes }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function computeStreak(daily: DailyStat[]): number {
  if (daily.length === 0) return 0;
  const days = new Set(daily.map((d) => d.date));
  let streak = 0;
  const cursor = new Date();
  for (;;) {
    const key = toDateKey(cursor.getTime());
    if (days.has(key)) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      if (streak === 0) {
        cursor.setDate(cursor.getDate() - 1);
        const prev = toDateKey(cursor.getTime());
        if (days.has(prev)) {
          streak++;
          cursor.setDate(cursor.getDate() - 1);
          continue;
        }
      }
      break;
    }
  }
  return streak;
}

export function computeTotalMinutes(progress: WatchProgress[]): number {
  return progress.reduce((sum, p) => sum + Math.round(p.positionSec / 60), 0);
}

export function computePassedCount(attempts: QuizAttempt[]): number {
  const passed = new Set<string>();
  for (const a of attempts) if (a.passed) passed.add(a.videoId);
  return passed.size;
}

export interface TagWeakness {
  tag: string;
  correct: number;
  total: number;
  wrongRate: number;
}

export function computeTagWeakness(
  attempts: QuizAttempt[],
  questionTagsByVideo: Map<string, Map<string, string[]>>,
): TagWeakness[] {
  const counter = new Map<string, { correct: number; total: number }>();
  for (const attempt of attempts) {
    const perQ = questionTagsByVideo.get(attempt.videoId);
    if (!perQ) continue;
    for (const ans of attempt.answers) {
      const tags = perQ.get(ans.questionId) ?? [];
      for (const t of tags) {
        const cur = counter.get(t) ?? { correct: 0, total: 0 };
        cur.total += 1;
        if (ans.correct) cur.correct += 1;
        counter.set(t, cur);
      }
    }
  }
  return Array.from(counter.entries())
    .map(([tag, { correct, total }]) => ({
      tag,
      correct,
      total,
      wrongRate: total === 0 ? 0 : 1 - correct / total,
    }))
    .sort((a, b) => b.wrongRate - a.wrongRate);
}
