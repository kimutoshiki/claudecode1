"use client";

import { useMemo } from "react";
import { VideoRow } from "@/components/video/VideoRow";
import { useAllWatchProgress } from "@/hooks/useWatchProgress";
import type { VideoMeta } from "@/lib/types";

interface Props {
  allVideos: VideoMeta[];
}

export function HomeContinueRow({ allVideos }: Props) {
  const progress = useAllWatchProgress();

  const continueList = useMemo(() => {
    if (!progress) return [];
    const inProgress = progress
      .filter((p) => !p.completed && p.positionSec > 0)
      .sort((a, b) => b.lastWatchedAt - a.lastWatchedAt);
    const byId = new Map(allVideos.map((v) => [v.id, v] as const));
    return inProgress
      .map((p) => byId.get(p.videoId))
      .filter((v): v is VideoMeta => Boolean(v));
  }, [progress, allVideos]);

  if (continueList.length === 0) return null;

  return (
    <VideoRow
      title="続きから見る"
      subtitle={`${continueList.length} 本`}
      videos={continueList}
    />
  );
}
