"use client";

import Image from "next/image";
import { CheckCircle2, ExternalLink, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { useWatchProgress } from "@/hooks/useWatchProgress";
import type { VideoMeta } from "@/lib/types";
import { cn, formatDuration, withBasePath } from "@/lib/utils";

interface PlayerProps {
  video: VideoMeta;
  compact?: boolean;
  onPositionChange?: (sec: number) => void;
}

export function Player({ video, compact = false, onPositionChange }: PlayerProps) {
  const { progress, save } = useWatchProgress(video.id);
  const [positionSec, setPositionSec] = useState(0);
  const [hydratedKey, setHydratedKey] = useState<number | null>(null);

  if (progress && progress.positionSec > 0 && hydratedKey !== progress.lastWatchedAt) {
    setHydratedKey(progress.lastWatchedAt);
    setPositionSec(progress.positionSec);
  }

  useEffect(() => {
    onPositionChange?.(positionSec);
  }, [positionSec, onPositionChange]);

  const pct = video.durationSec > 0 ? (positionSec / video.durationSec) * 100 : 0;
  const completed = progress?.completed === true;

  const openSource = () => {
    window.open(video.sourceUrl, "_blank", "noopener,noreferrer");
    save({ positionSec, durationSec: video.durationSec });
  };

  const markWatched = () => {
    setPositionSec(video.durationSec);
    save({
      positionSec: video.durationSec,
      durationSec: video.durationSec,
    });
  };

  const resetProgress = () => {
    setPositionSec(0);
    save({ positionSec: 0, durationSec: video.durationSec });
  };

  return (
    <div className={cn("flex h-full w-full flex-col bg-black", compact && "rounded-md")}>
      <div className="relative flex flex-1 items-center justify-center overflow-hidden">
        <Image
          src={withBasePath(video.thumbnailUrl)}
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-40"
        />
        <div className="relative z-10 flex max-w-xl flex-col items-center gap-4 px-6 py-8 text-center">
          <p className="text-xs font-semibold tracking-[0.2em] text-[color:var(--accent)]">
            NHK FOR SCHOOL · EXTERNAL VIEWING
          </p>
          <h2 className="text-2xl font-bold">{video.title}</h2>
          <p className="text-sm text-[color:var(--muted)]">
            NHK for School の動画は iframe 埋め込みが許可されていないため、公式サイトで視聴します。
            視聴後に下の手動進捗ボタンで記録してください。
          </p>
          <button
            type="button"
            onClick={openSource}
            className="inline-flex items-center gap-2 rounded bg-[color:var(--accent)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-[color:var(--accent-hover)]"
          >
            <ExternalLink size={16} />
            NHK for School で視聴する
          </button>
          {completed && (
            <div className="inline-flex items-center gap-2 rounded-full bg-[color:var(--surface)]/80 px-3 py-1 text-sm text-[color:var(--accent)]">
              <CheckCircle2 size={16} /> クイズ合格済
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-[color:var(--border)] bg-[color:var(--surface)] p-4">
        <div className="flex items-center gap-3 text-xs text-[color:var(--muted)]">
          <span>視聴位置</span>
          <div className="flex-1">
            <input
              type="range"
              min={0}
              max={video.durationSec}
              step={5}
              value={positionSec}
              onChange={(e) => setPositionSec(Number(e.target.value))}
              onPointerUp={() =>
                save({ positionSec, durationSec: video.durationSec })
              }
              aria-label="視聴位置を設定"
              className="w-full accent-[color:var(--accent)]"
            />
          </div>
          <span className="font-mono text-[color:var(--foreground)]">
            {formatDuration(positionSec)} / {formatDuration(video.durationSec)}
          </span>
          <span className="font-mono">{Math.round(pct)}%</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={markWatched}
            className="inline-flex items-center gap-2 rounded bg-[color:var(--foreground)] px-4 py-2 text-xs font-semibold text-black transition hover:bg-white"
          >
            <CheckCircle2 size={14} />
            最後まで見た
          </button>
          <button
            type="button"
            onClick={resetProgress}
            className="inline-flex items-center gap-2 rounded border border-[color:var(--border)] px-4 py-2 text-xs text-[color:var(--muted)] transition hover:text-[color:var(--foreground)]"
          >
            <RotateCcw size={14} />
            進捗をリセット
          </button>
          <p className="flex-1 text-right text-[10px] text-[color:var(--muted)]">
            視聴が終わったら <span className="text-[color:var(--foreground)]">クイズに挑戦</span> して✅ をゲット
          </p>
        </div>
      </div>
    </div>
  );
}
