"use client";

import Image from "next/image";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { useMemo } from "react";
import { useAllWatchProgress } from "@/hooks/useWatchProgress";
import { CATEGORY_LABEL, type VideoMeta } from "@/lib/types";
import { cn, formatDuration, withBasePath } from "@/lib/utils";

interface VideoCardProps {
  video: VideoMeta;
  size?: "default" | "compact";
}

export function VideoCard({ video, size = "default" }: VideoCardProps) {
  const all = useAllWatchProgress();
  const progress = useMemo(
    () => all?.find((p) => p.videoId === video.id) ?? null,
    [all, video.id],
  );
  const pct =
    progress && progress.durationSec > 0
      ? Math.min(100, Math.round((progress.positionSec / progress.durationSec) * 100))
      : 0;
  const completed = progress?.completed === true;

  return (
    <Link
      href={`/video/${video.id}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-md bg-[color:var(--surface)]",
        "ring-1 ring-transparent transition-all duration-200",
        "hover:-translate-y-1 hover:scale-[1.03] hover:ring-[color:var(--accent)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]",
        size === "compact" ? "min-w-[180px]" : "min-w-[260px]",
      )}
      aria-label={`${video.title} — 視聴`}
    >
      <div className="relative aspect-video w-full overflow-hidden bg-black">
        <Image
          src={withBasePath(video.thumbnailUrl)}
          alt=""
          fill
          sizes="(max-width: 640px) 50vw, 260px"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {completed && (
          <div className="absolute right-2 top-2 rounded-full bg-black/70 p-1 text-[color:var(--accent)]">
            <CheckCircle2 size={18} aria-label="クイズ合格済" />
          </div>
        )}
        {pct > 0 && !completed && (
          <div className="absolute inset-x-0 bottom-0 h-1 bg-black/60">
            <div
              className="h-full bg-[color:var(--accent)]"
              style={{ width: `${pct}%` }}
            />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1 p-3">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-[color:var(--muted)]">
          <span className="rounded bg-black/40 px-1.5 py-0.5">
            {CATEGORY_LABEL[video.category]}
          </span>
          <span>{formatDuration(video.durationSec)}</span>
        </div>
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug">
          {video.title}
        </h3>
        <p className="text-xs text-[color:var(--muted)]">
          {video.series} · 第 {video.episode} 回
        </p>
      </div>
    </Link>
  );
}
