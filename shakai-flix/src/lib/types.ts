export type Category = "geography" | "history" | "civics";

export type Grade = 1 | 2 | 3;

export const CATEGORY_LABEL: Record<Category, string> = {
  geography: "地理",
  history: "歴史",
  civics: "公民",
};

export interface VideoMeta {
  id: string;
  series: string;
  episode: number;
  title: string;
  description: string;
  thumbnailUrl: string;
  sourceUrl: string;
  embedUrl?: string;
  durationSec: number;
  category: Category;
  grade: Grade[];
  tags: string[];
  curriculumCodes: string[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  choices: string[];
  answerIndex: number;
  explanation: string;
  tags: string[];
  timestampSec?: number;
}

export interface Quiz {
  videoId: string;
  questions: QuizQuestion[];
}

export interface WatchProgress {
  videoId: string;
  positionSec: number;
  durationSec: number;
  lastWatchedAt: number;
  completed: boolean;
  completedAt?: number;
}

export interface Note {
  videoId: string;
  content: string;
  contentMarkdown: string;
  screenshots: { dataUrl: string; atSec: number }[];
  tags: string[];
  updatedAt: number;
}

export interface QuizAttempt {
  id: string;
  videoId: string;
  startedAt: number;
  finishedAt: number;
  answers: { questionId: string; chosenIndex: number; correct: boolean }[];
  score: number;
  passed: boolean;
}

export interface MyListEntry {
  videoId: string;
  addedAt: number;
}

export type PlayerLayout = "theater" | "study" | "fullscreen";

export interface UserSettings {
  id: "singleton";
  theme: "dark" | "light" | "auto";
  playbackRate: number;
  defaultLayout: PlayerLayout;
  dailyGoalMinutes: number;
  anthropicApiKey?: string;
}
