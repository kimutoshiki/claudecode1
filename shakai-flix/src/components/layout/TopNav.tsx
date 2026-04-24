"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Settings, User } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "ホーム" },
  { href: "/category/history", label: "歴史" },
  { href: "/category/geography", label: "地理" },
  { href: "/category/civics", label: "公民" },
];

export function TopNav() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-40 border-b border-[color:var(--border)] bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-[1400px] items-center gap-6 px-6">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-[color:var(--accent)] hover:text-[color:var(--accent-hover)]"
        >
          Shakai Flix
        </Link>
        <nav className="hidden items-center gap-4 md:flex">
          {NAV_ITEMS.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm transition-colors hover:text-[color:var(--foreground)]",
                  active
                    ? "text-[color:var(--foreground)]"
                    : "text-[color:var(--muted)]",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex flex-1 items-center justify-end gap-3">
          <Link
            href="/search"
            aria-label="検索"
            className="rounded p-2 text-[color:var(--muted)] hover:bg-[color:var(--surface)] hover:text-[color:var(--foreground)]"
          >
            <Search size={18} />
          </Link>
          <Link
            href="/profile"
            aria-label="マイページ"
            className="rounded p-2 text-[color:var(--muted)] hover:bg-[color:var(--surface)] hover:text-[color:var(--foreground)]"
          >
            <User size={18} />
          </Link>
          <Link
            href="/settings"
            aria-label="設定"
            className="rounded p-2 text-[color:var(--muted)] hover:bg-[color:var(--surface)] hover:text-[color:var(--foreground)]"
          >
            <Settings size={18} />
          </Link>
        </div>
      </div>
    </header>
  );
}
