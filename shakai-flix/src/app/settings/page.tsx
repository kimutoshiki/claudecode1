"use client";

import { useState } from "react";
import { Type } from "lucide-react";
import {
  getStoredFontSize,
  setStoredFontSize,
  useSettings,
  type FontSize,
} from "@/hooks/useSettings";
import { cn } from "@/lib/utils";
import type { PlayerLayout } from "@/lib/types";

const FONT_SIZES: { value: FontSize; label: string }[] = [
  { value: "sm", label: "小" },
  { value: "base", label: "標準" },
  { value: "lg", label: "大" },
];

const LAYOUTS: { value: PlayerLayout; label: string }[] = [
  { value: "theater", label: "シアター" },
  { value: "study", label: "スタディ（ノート併用）" },
  { value: "fullscreen", label: "フルスクリーン" },
];

export default function SettingsPage() {
  const { settings, update } = useSettings();
  const [fontSize, setFontSize] = useState<FontSize>("base");
  const [mounted, setMounted] = useState(false);

  if (!mounted && typeof window !== "undefined") {
    setMounted(true);
    setFontSize(getStoredFontSize());
  }

  const changeFont = (size: FontSize) => {
    setFontSize(size);
    setStoredFontSize(size);
  };

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8 px-6 py-10">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold">設定</h1>
        <p className="text-sm text-[color:var(--muted)]">
          学習アプリの動作をあなた好みに調整できます。
        </p>
      </header>

      <Section title="表示" icon={<Type size={16} />}>
        <Row label="フォントサイズ">
          <SegmentedControl
            options={FONT_SIZES}
            value={fontSize}
            onChange={changeFont}
          />
        </Row>
      </Section>

      <Section title="プレイヤー">
        <Row label="既定レイアウト">
          <SegmentedControl
            options={LAYOUTS}
            value={settings.defaultLayout}
            onChange={(v) => update({ defaultLayout: v })}
          />
        </Row>
      </Section>

      <Section title="学習目標">
        <Row label="1日の目標分数">
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={5}
              max={180}
              step={5}
              value={settings.dailyGoalMinutes}
              onChange={(e) =>
                update({
                  dailyGoalMinutes: Math.max(1, Number(e.target.value)),
                })
              }
              className="w-24 rounded border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-1.5 text-right text-sm"
              aria-label="1日の目標分数"
            />
            <span className="text-sm text-[color:var(--muted)]">分</span>
          </div>
        </Row>
      </Section>

      <p className="text-xs text-[color:var(--muted)]">
        設定は端末のブラウザ内 (IndexedDB / LocalStorage) に保存されます。他の端末には共有されません。
      </p>
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-[color:var(--muted)]">
        {icon}
        {title}
      </h2>
      <div className="rounded-md border border-[color:var(--border)] bg-[color:var(--surface)]">
        {children}
      </div>
    </section>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[color:var(--border)] px-4 py-3 last:border-b-0">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </div>
  );
}

function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex overflow-hidden rounded border border-[color:var(--border)]">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          aria-pressed={value === opt.value}
          className={cn(
            "px-3 py-1.5 text-xs transition",
            value === opt.value
              ? "bg-[color:var(--foreground)] text-black"
              : "text-[color:var(--muted)] hover:bg-[color:var(--surface-hover)]",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
