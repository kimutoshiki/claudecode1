"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { usePlayerStore } from "@/stores/playerStore";

const SHORTCUTS: { keys: string; label: string }[] = [
  { keys: "1 / 2 / 3", label: "レイアウト切替（シアター / スタディ / フル）" },
  { keys: "?", label: "このヘルプを開く/閉じる" },
  { keys: "Ctrl + K", label: "ノートにタイムスタンプ挿入" },
  { keys: "Ctrl + S", label: "ノートを今すぐ保存" },
  { keys: "Esc", label: "モーダルを閉じる" },
];

export function ShortcutsModal() {
  const open = usePlayerStore((s) => s.showShortcuts);
  const close = usePlayerStore((s) => s.closeShortcuts);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={close}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-2xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id="shortcuts-title" className="text-lg font-semibold">
            キーボードショートカット
          </h2>
          <button
            type="button"
            onClick={close}
            aria-label="閉じる"
            className="rounded p-1 text-[color:var(--muted)] hover:bg-[color:var(--surface-hover)] hover:text-[color:var(--foreground)]"
          >
            <X size={16} />
          </button>
        </div>
        <ul className="space-y-2">
          {SHORTCUTS.map((s) => (
            <li key={s.keys} className="flex items-center justify-between text-sm">
              <span className="text-[color:var(--muted)]">{s.label}</span>
              <kbd className="rounded border border-[color:var(--border)] bg-[color:var(--background)] px-2 py-0.5 font-mono text-xs">
                {s.keys}
              </kbd>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
