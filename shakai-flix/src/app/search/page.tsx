"use client";

import { useState, useMemo } from "react";
import { Search as SearchIcon } from "lucide-react";
import { VideoCard } from "@/components/video/VideoCard";
import { searchVideos } from "@/lib/search";
import { getAllVideos } from "@/lib/videos";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const all = useMemo(() => getAllVideos(), []);
  const results = useMemo(
    () => (query.trim() ? searchVideos(query) : all),
    [query, all],
  );

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 px-6 py-10">
      <div className="space-y-3">
        <h1 className="text-3xl font-bold">検索</h1>
        <div className="flex items-center gap-2 rounded-md border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2 focus-within:ring-1 focus-within:ring-[color:var(--accent)]">
          <SearchIcon size={18} className="text-[color:var(--muted)]" />
          <input
            autoFocus
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="タイトル・単元・タグで検索（例: EU、ヨーロッパ、地理）"
            className="w-full bg-transparent text-sm text-[color:var(--foreground)] outline-none placeholder:text-[color:var(--muted)]"
            aria-label="動画を検索"
          />
        </div>
        <p className="text-xs text-[color:var(--muted)]">
          {query.trim()
            ? `${results.length} 件ヒット`
            : `登録動画 ${all.length} 件を表示中`}
        </p>
      </div>
      {results.length === 0 ? (
        <p className="text-[color:var(--muted)]">該当する動画が見つかりません。</p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
          {results.map((v) => (
            <VideoCard key={v.id} video={v} />
          ))}
        </div>
      )}
    </div>
  );
}
