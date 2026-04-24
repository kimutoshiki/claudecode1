"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface SplitPaneProps {
  left: React.ReactNode;
  right: React.ReactNode;
  initialLeftPct?: number;
  minLeftPct?: number;
  maxLeftPct?: number;
}

export function SplitPane({
  left,
  right,
  initialLeftPct = 50,
  minLeftPct = 25,
  maxLeftPct = 75,
}: SplitPaneProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [leftPct, setLeftPct] = useState(initialLeftPct);
  const draggingRef = useRef(false);

  const onMouseDown = useCallback(() => {
    draggingRef.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!draggingRef.current) return;
      const c = containerRef.current;
      if (!c) return;
      const rect = c.getBoundingClientRect();
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      setLeftPct(Math.max(minLeftPct, Math.min(maxLeftPct, pct)));
    };
    const onUp = () => {
      if (draggingRef.current) {
        draggingRef.current = false;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      }
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [minLeftPct, maxLeftPct]);

  return (
    <div ref={containerRef} className="flex h-full w-full overflow-hidden">
      <div className="overflow-hidden" style={{ width: `${leftPct}%` }}>
        {left}
      </div>
      <div
        role="separator"
        aria-orientation="vertical"
        aria-valuenow={Math.round(leftPct)}
        onMouseDown={onMouseDown}
        className={cn(
          "w-1 shrink-0 cursor-col-resize bg-[color:var(--border)]",
          "hover:bg-[color:var(--accent)]",
        )}
      />
      <div className="overflow-hidden" style={{ width: `${100 - leftPct}%` }}>
        {right}
      </div>
    </div>
  );
}
