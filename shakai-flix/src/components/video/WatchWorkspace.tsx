"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Keyboard, Maximize, Layout, Columns } from "lucide-react";
import { NoteEditor } from "@/components/note/NoteEditor";
import { NextUpQueue } from "@/components/video/NextUpQueue";
import { Player } from "@/components/video/Player";
import { ShortcutsModal } from "@/components/layout/ShortcutsModal";
import { SplitPane } from "@/components/layout/SplitPane";
import { useWatchProgress } from "@/hooks/useWatchProgress";
import { cn } from "@/lib/utils";
import { usePlayerStore } from "@/stores/playerStore";
import type { PlayerLayout, VideoMeta } from "@/lib/types";

interface Props {
  video: VideoMeta;
}

export function WatchWorkspace({ video }: Props) {
  const layout = usePlayerStore((s) => s.layout);
  const setLayout = usePlayerStore((s) => s.setLayout);
  const toggleShortcuts = usePlayerStore((s) => s.toggleShortcuts);
  const { progress } = useWatchProgress(video.id);
  const [currentPositionSec, setCurrentPositionSec] = useState(0);
  const [hydratedKey, setHydratedKey] = useState<number | null>(null);

  if (progress?.positionSec && hydratedKey !== progress.lastWatchedAt) {
    setHydratedKey(progress.lastWatchedAt);
    setCurrentPositionSec(progress.positionSec);
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const inEditor =
        target?.closest("input, textarea, [contenteditable='true']") != null;
      if (inEditor) return;
      if (e.key === "1") setLayout("theater");
      if (e.key === "2") setLayout("study");
      if (e.key === "3") setLayout("fullscreen");
      if (e.key === "?" || (e.shiftKey && e.key === "/")) toggleShortcuts();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setLayout, toggleShortcuts]);

  return (
    <div className="flex h-[calc(100vh-56px)] flex-col bg-[color:var(--background)]">
      <header className="flex items-center justify-between gap-3 border-b border-[color:var(--border)] bg-[color:var(--surface)]/60 px-4 py-2">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href={`/video/${video.id}`}
            aria-label="詳細へ戻る"
            className="rounded p-1.5 text-[color:var(--muted)] hover:bg-[color:var(--surface-hover)] hover:text-[color:var(--foreground)]"
          >
            <ArrowLeft size={16} />
          </Link>
          <div className="min-w-0">
            <div className="truncate text-xs text-[color:var(--muted)]">
              {video.series} · 第 {video.episode} 回
            </div>
            <h1 className="truncate text-sm font-semibold">{video.title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <LayoutToggle value={layout} onChange={setLayout} />
          <button
            type="button"
            onClick={toggleShortcuts}
            title="ショートカット一覧 (?)"
            aria-label="ショートカット一覧を開く"
            className="rounded p-1.5 text-[color:var(--muted)] hover:bg-[color:var(--surface-hover)] hover:text-[color:var(--foreground)]"
          >
            <Keyboard size={16} />
          </button>
          <Link
            href={`/quiz/${video.id}`}
            className="inline-flex items-center rounded bg-[color:var(--accent)] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[color:var(--accent-hover)]"
          >
            クイズに挑戦
          </Link>
        </div>
      </header>

      <div className="min-h-0 flex-1">
        {layout === "fullscreen" && (
          <div className="h-full">
            <Player video={video} onPositionChange={setCurrentPositionSec} />
          </div>
        )}
        {layout === "theater" && (
          <div className="grid h-full grid-cols-1 lg:grid-cols-[1fr_320px]">
            <div className="min-h-0">
              <Player video={video} onPositionChange={setCurrentPositionSec} />
            </div>
            <aside className="hidden min-h-0 overflow-y-auto border-l border-[color:var(--border)] bg-[color:var(--surface)]/40 p-3 lg:block">
              <NextUpQueue currentId={video.id} />
            </aside>
          </div>
        )}
        {layout === "study" && (
          <SplitPane
            initialLeftPct={58}
            minLeftPct={35}
            maxLeftPct={75}
            left={
              <Player
                video={video}
                compact
                onPositionChange={setCurrentPositionSec}
              />
            }
            right={
              <NoteEditor video={video} currentPositionSec={currentPositionSec} />
            }
          />
        )}
      </div>

      <ShortcutsModal />
    </div>
  );
}

function LayoutToggle({
  value,
  onChange,
}: {
  value: PlayerLayout;
  onChange: (l: PlayerLayout) => void;
}) {
  const items: { key: PlayerLayout; label: string; icon: React.ReactNode; hint: string }[] = [
    { key: "theater", label: "シアター", icon: <Layout size={14} />, hint: "1" },
    { key: "study", label: "スタディ", icon: <Columns size={14} />, hint: "2" },
    { key: "fullscreen", label: "フル", icon: <Maximize size={14} />, hint: "3" },
  ];
  return (
    <div className="inline-flex overflow-hidden rounded border border-[color:var(--border)]">
      {items.map((it) => (
        <button
          key={it.key}
          type="button"
          onClick={() => onChange(it.key)}
          aria-pressed={value === it.key}
          title={`${it.label} (${it.hint})`}
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs transition",
            value === it.key
              ? "bg-[color:var(--foreground)] text-black"
              : "text-[color:var(--muted)] hover:bg-[color:var(--surface-hover)]",
          )}
        >
          {it.icon}
          <span className="hidden sm:inline">{it.label}</span>
        </button>
      ))}
    </div>
  );
}
