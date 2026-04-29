"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import { VideoCard } from "./VideoCard";
import type { VideoMeta } from "@/lib/types";

interface VideoRowProps {
  title: string;
  subtitle?: string;
  videos: VideoMeta[];
  emptyMessage?: string;
}

export function VideoRow({ title, subtitle, videos, emptyMessage }: VideoRowProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  const scroll = (dir: -1 | 1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <section className="space-y-3">
      <div className="flex items-baseline gap-3 px-6">
        <h2 className="text-2xl font-semibold">{title}</h2>
        {subtitle && (
          <p className="text-sm text-[color:var(--muted)]">{subtitle}</p>
        )}
      </div>
      {videos.length === 0 ? (
        <p className="px-6 text-base text-[color:var(--muted)]">
          {emptyMessage ?? "まだ動画がありません。"}
        </p>
      ) : (
        <div className="group/row relative">
          <button
            type="button"
            aria-label="左へスクロール"
            onClick={() => scroll(-1)}
            className="absolute left-0 top-0 z-10 hidden h-full items-center bg-gradient-to-r from-background/80 to-transparent px-2 opacity-0 transition-opacity group-hover/row:flex group-hover/row:opacity-100"
          >
            <ChevronLeft size={32} />
          </button>
          <div
            ref={ref}
            className="flex gap-3 overflow-x-auto scroll-smooth px-6 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {videos.map((v) => (
              <div key={v.id} className="shrink-0">
                <VideoCard video={v} />
              </div>
            ))}
          </div>
          <button
            type="button"
            aria-label="右へスクロール"
            onClick={() => scroll(1)}
            className="absolute right-0 top-0 z-10 hidden h-full items-center bg-gradient-to-l from-background/80 to-transparent px-2 opacity-0 transition-opacity group-hover/row:flex group-hover/row:opacity-100"
          >
            <ChevronRight size={32} />
          </button>
        </div>
      )}
    </section>
  );
}
