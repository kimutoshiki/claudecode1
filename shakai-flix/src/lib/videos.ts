import videosJson from "@/../public/data/videos.json";
import type { Category, VideoMeta } from "./types";

const videos = videosJson as VideoMeta[];

export function getAllVideos(): VideoMeta[] {
  return videos;
}

export function getVideoById(id: string): VideoMeta | undefined {
  return videos.find((v) => v.id === id);
}

export function getVideosByCategory(category: Category): VideoMeta[] {
  return videos.filter((v) => v.category === category);
}

export function getVideosBySeries(series: string): VideoMeta[] {
  return videos.filter((v) => v.series === series).sort((a, b) => a.episode - b.episode);
}

export function getSeriesList(): string[] {
  return Array.from(new Set(videos.map((v) => v.series)));
}
