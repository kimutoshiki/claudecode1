"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { useEffect, useState } from "react";
import type { VideoMeta } from "@/lib/types";
import { cn, withBasePath } from "@/lib/utils";

interface HeroCarouselProps {
  videos: VideoMeta[];
  intervalMs?: number;
}

export function HeroCarousel({ videos, intervalMs = 5000 }: HeroCarouselProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (videos.length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % videos.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [videos.length, intervalMs]);

  if (videos.length === 0) return null;
  const current = videos[index];
  if (!current) return null;

  const prev = () => setIndex((i) => (i - 1 + videos.length) % videos.length);
  const next = () => setIndex((i) => (i + 1) % videos.length);

  return (
    <div className="relative isolate h-[min(60vh,560px)] w-full overflow-hidden">
      <Image
        src={withBasePath(current.thumbnailUrl)}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />
      <div className="relative z-10 mx-auto flex h-full w-full max-w-[1400px] flex-col justify-end px-6 pb-16">
        <p className="text-xs font-semibold tracking-[0.2em] text-[color:var(--accent)]">
          FEATURED · {current.series}
        </p>
        <h1 className="mt-2 max-w-2xl text-3xl font-bold leading-tight sm:text-5xl">
          {current.title}
        </h1>
        <p className="mt-3 max-w-xl text-sm text-[color:var(--muted)] sm:text-base">
          {current.description}
        </p>
        <div className="mt-6 flex gap-3">
          <Link
            href={`/watch/${current.id}`}
            className="inline-flex items-center gap-2 rounded bg-[color:var(--foreground)] px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-white"
          >
            <Play size={16} fill="currentColor" />
            視聴する
          </Link>
          <Link
            href={`/video/${current.id}`}
            className="inline-flex items-center gap-2 rounded bg-[color:var(--surface)]/70 px-5 py-2.5 text-sm font-semibold text-[color:var(--foreground)] backdrop-blur transition hover:bg-[color:var(--surface-hover)]"
          >
            詳細を見る
          </Link>
        </div>
      </div>
      {videos.length > 1 && (
        <>
          <button
            type="button"
            aria-label="前の動画"
            onClick={prev}
            className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/40 p-2 backdrop-blur hover:bg-black/70"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            type="button"
            aria-label="次の動画"
            onClick={next}
            className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/40 p-2 backdrop-blur hover:bg-black/70"
          >
            <ChevronRight size={24} />
          </button>
          <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-1.5">
            {videos.map((v, i) => (
              <button
                key={v.id}
                type="button"
                aria-label={`スライド ${i + 1}`}
                onClick={() => setIndex(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === index
                    ? "w-8 bg-[color:var(--accent)]"
                    : "w-4 bg-white/30 hover:bg-white/60",
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
