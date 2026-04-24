"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useAllWatchProgress } from "@/hooks/useWatchProgress";
import { buildNextUpQueue } from "@/lib/queue";
import { CATEGORY_LABEL, type VideoMeta } from "@/lib/types";
import { formatDuration } from "@/lib/utils";

interface Props {
  currentId: string;
}

export function NextUpQueue({ currentId }: Props) {
  const progress = useAllWatchProgress();

  const queue = useMemo(() => {
    if (!progress) return [];
    const map = new Map(progress.map((p) => [p.videoId, p] as const));
    return buildNextUpQueue({ currentId, progress: map });
  }, [currentId, progress]);

  return (
    <aside className="flex flex-col gap-2">
      <h3 className="px-1 text-sm font-semibold text-[color:var(--muted)]">
        次に見る
      </h3>
      {queue.length === 0 ? (
        <p className="px-1 text-xs text-[color:var(--muted)]">
          候補はありません。
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {queue.map((v: VideoMeta) => (
            <li key={v.id}>
              <Link
                href={`/watch/${v.id}`}
                className="flex gap-3 rounded-md bg-[color:var(--surface)] p-2 transition hover:bg-[color:var(--surface-hover)]"
              >
                <div className="relative aspect-video w-28 shrink-0 overflow-hidden rounded bg-black">
                  <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1 font-mono text-[10px]">
                    {formatDuration(v.durationSec)}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] uppercase tracking-wider text-[color:var(--muted)]">
                    {CATEGORY_LABEL[v.category]} · {v.series}
                  </div>
                  <div className="line-clamp-2 text-xs font-semibold leading-snug">
                    {v.title}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
