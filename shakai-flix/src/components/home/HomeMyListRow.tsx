"use client";

import { useMemo } from "react";
import { VideoRow } from "@/components/video/VideoRow";
import { useMyList } from "@/hooks/useMyList";
import type { VideoMeta } from "@/lib/types";

interface Props {
  allVideos: VideoMeta[];
}

export function HomeMyListRow({ allVideos }: Props) {
  const { entries } = useMyList();

  const list = useMemo(() => {
    const byId = new Map(allVideos.map((v) => [v.id, v] as const));
    return entries.map((e) => byId.get(e.videoId)).filter((v): v is VideoMeta => Boolean(v));
  }, [entries, allVideos]);

  if (list.length === 0) return null;

  return (
    <VideoRow title="マイリスト" subtitle={`${list.length} 本`} videos={list} />
  );
}
