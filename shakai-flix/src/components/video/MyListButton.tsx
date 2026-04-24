"use client";

import { Check, Plus } from "lucide-react";
import { useMyList } from "@/hooks/useMyList";

interface Props {
  videoId: string;
}

export function MyListButton({ videoId }: Props) {
  const { toggle, inList } = useMyList();
  const added = inList(videoId);

  return (
    <button
      type="button"
      onClick={() => toggle(videoId)}
      aria-pressed={added}
      className="inline-flex items-center gap-2 rounded bg-[color:var(--surface)]/70 px-4 py-2.5 text-sm font-semibold backdrop-blur transition hover:bg-[color:var(--surface-hover)]"
    >
      {added ? <Check size={16} /> : <Plus size={16} />}
      {added ? "マイリスト済" : "マイリストに追加"}
    </button>
  );
}
