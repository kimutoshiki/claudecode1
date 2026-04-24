"use client";

import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { useEffect, useMemo, useState } from "react";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Award, Clock, Flame, Trophy } from "lucide-react";
import { VideoCard } from "@/components/video/VideoCard";
import { getDB } from "@/lib/db";
import {
  computeDaily,
  computePassedCount,
  computeStreak,
  computeTagWeakness,
  computeTotalMinutes,
} from "@/lib/stats";
import { loadQuiz } from "@/lib/quiz";
import { getVideoById } from "@/lib/videos";

export default function ProfilePage() {
  const progress = useLiveQuery(() => getDB().watchProgress.toArray(), []);
  const attempts = useLiveQuery(() => getDB().quizAttempts.toArray(), []);
  const myList = useLiveQuery(
    () => getDB().myList.orderBy("addedAt").reverse().toArray(),
    [],
  );

  const stats = useMemo(() => {
    const prog = progress ?? [];
    const att = attempts ?? [];
    const daily = computeDaily(prog);
    return {
      totalMinutes: computeTotalMinutes(prog),
      streak: computeStreak(daily),
      passed: computePassedCount(att),
      daily,
    };
  }, [progress, attempts]);

  const recent = useMemo(() => {
    const prog = (progress ?? [])
      .slice()
      .sort((a, b) => b.lastWatchedAt - a.lastWatchedAt)
      .slice(0, 8);
    return prog
      .map((p) => getVideoById(p.videoId))
      .filter((v): v is NonNullable<typeof v> => !!v);
  }, [progress]);

  const myListVideos = useMemo(() => {
    return (myList ?? [])
      .map((e) => getVideoById(e.videoId))
      .filter((v): v is NonNullable<typeof v> => !!v);
  }, [myList]);

  const heatmapValues = useMemo(() => {
    return stats.daily.map((d) => ({ date: d.date, count: d.minutes }));
  }, [stats.daily]);

  const chartData = useMemo(() => {
    return stats.daily.slice(-14).map((d) => ({
      day: d.date.slice(5),
      minutes: d.minutes,
    }));
  }, [stats.daily]);

  const weakness = useWeakness(attempts);

  const today = new Date();
  const startDate = new Date();
  startDate.setMonth(today.getMonth() - 5);

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-8 px-6 py-10">
      <section className="space-y-1">
        <h1 className="text-3xl font-bold">マイページ</h1>
        <p className="text-sm text-[color:var(--muted)]">
          学習の記録を振り返り、次に見る動画を決めましょう。
        </p>
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          icon={<Clock size={18} />}
          label="総視聴時間"
          value={`${stats.totalMinutes} 分`}
        />
        <StatCard
          icon={<Flame size={18} />}
          label="連続学習日数"
          value={`${stats.streak} 日`}
        />
        <StatCard
          icon={<Trophy size={18} />}
          label="クイズ合格数"
          value={`${stats.passed} 本`}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-[color:var(--muted)]">
          直近 2 週間の学習
        </h2>
        <div className="h-48 rounded-md bg-[color:var(--surface)] p-3">
          {chartData.length === 0 ? (
            <p className="flex h-full items-center justify-center text-xs text-[color:var(--muted)]">
              まだ学習記録がありません。
            </p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  vertical={false}
                />
                <XAxis dataKey="day" stroke="var(--muted)" fontSize={11} />
                <YAxis stroke="var(--muted)" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: 4,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="minutes" fill="var(--accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-[color:var(--muted)]">
          学習ヒートマップ（6ヶ月）
        </h2>
        <div className="overflow-x-auto rounded-md bg-[color:var(--surface)] p-4 [&_.react-calendar-heatmap_.color-empty]:fill-[color:var(--border)] [&_.react-calendar-heatmap_rect]:rx-1 [&_.react-calendar-heatmap_text]:fill-[color:var(--muted)]">
          <CalendarHeatmap
            startDate={startDate}
            endDate={today}
            values={heatmapValues}
            classForValue={(value) => {
              if (!value || value.count === 0) return "color-empty";
              if (value.count < 10) return "color-scale-1";
              if (value.count < 30) return "color-scale-2";
              if (value.count < 60) return "color-scale-3";
              return "color-scale-4";
            }}
            showWeekdayLabels
          />
          <style>{`
            .react-calendar-heatmap .color-scale-1 { fill: #5a1218; }
            .react-calendar-heatmap .color-scale-2 { fill: #8b1a1f; }
            .react-calendar-heatmap .color-scale-3 { fill: #b81d24; }
            .react-calendar-heatmap .color-scale-4 { fill: #e50914; }
          `}</style>
        </div>
      </section>

      {weakness.length > 0 && (
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-[color:var(--muted)]">
            <Award size={14} /> 苦手タグ（正答率低い順）
          </h2>
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
            {weakness.slice(0, 6).map((w) => (
              <li
                key={w.tag}
                className="flex items-center justify-between rounded-md border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2 text-sm"
              >
                <span className="font-medium">#{w.tag}</span>
                <span className="font-mono text-xs text-[color:var(--muted)]">
                  {w.correct} / {w.total} 正解
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {recent.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-[color:var(--muted)]">
            最近見た
          </h2>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
            {recent.map((v) => (
              <VideoCard key={v.id} video={v} />
            ))}
          </div>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-[color:var(--muted)]">
          マイリスト
        </h2>
        {myListVideos.length === 0 ? (
          <p className="rounded-md border border-dashed border-[color:var(--border)] p-6 text-center text-sm text-[color:var(--muted)]">
            まだ追加されていません。動画カードの「+ マイリスト」から追加できます。
            <Link
              href="/"
              className="ml-2 text-[color:var(--accent)] underline"
            >
              動画を探す
            </Link>
          </p>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
            {myListVideos.map((v) => (
              <VideoCard key={v.id} video={v} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-md bg-[color:var(--surface)] p-4">
      <div className="rounded bg-[color:var(--accent)]/20 p-2 text-[color:var(--accent)]">
        {icon}
      </div>
      <div>
        <div className="text-xs text-[color:var(--muted)]">{label}</div>
        <div className="text-xl font-bold">{value}</div>
      </div>
    </div>
  );
}

function useWeakness(
  attempts:
    | {
        videoId: string;
        answers: { questionId: string; correct: boolean }[];
      }[]
    | undefined,
) {
  const [tagMap, setTagMap] = useState<Map<string, Map<string, string[]>>>(
    () => new Map(),
  );

  useEffect(() => {
    const atts = attempts ?? [];
    if (atts.length === 0) return;
    const uniqueIds = Array.from(new Set(atts.map((a) => a.videoId)));
    let cancelled = false;
    (async () => {
      const next = new Map<string, Map<string, string[]>>();
      const quizzes = await Promise.all(uniqueIds.map((id) => loadQuiz(id)));
      for (const q of quizzes) {
        if (!q) continue;
        const per = new Map<string, string[]>();
        for (const question of q.questions) {
          per.set(question.id, question.tags);
        }
        next.set(q.videoId, per);
      }
      if (!cancelled) setTagMap(next);
    })();
    return () => {
      cancelled = true;
    };
  }, [attempts]);

  return useMemo(() => {
    const atts = attempts ?? [];
    if (atts.length === 0 || tagMap.size === 0) return [];
    return computeTagWeakness(
      atts as Parameters<typeof computeTagWeakness>[0],
      tagMap,
    );
  }, [attempts, tagMap]);
}
