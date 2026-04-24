import type { Quiz, QuizAttempt, QuizQuestion } from "./types";

export const PASS_THRESHOLD = 8;

export async function loadQuiz(videoId: string): Promise<Quiz | null> {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  try {
    const res = await fetch(`${base}/data/quizzes/${videoId}.json`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = (await res.json()) as Quiz;
    return json;
  } catch {
    return null;
  }
}

export function shuffle<T>(arr: readonly T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = a[i] as T;
    a[i] = a[j] as T;
    a[j] = tmp;
  }
  return a;
}

export interface ShuffledQuestion extends QuizQuestion {
  choiceOrder: number[];
}

export function prepareQuestions(quiz: Quiz): ShuffledQuestion[] {
  return shuffle(quiz.questions).map((q) => {
    const order = shuffle(q.choices.map((_, i) => i));
    return { ...q, choiceOrder: order };
  });
}

export function scoreAttempt(
  questions: QuizQuestion[],
  answers: Record<string, number>,
): { correct: number; total: number; passed: boolean; details: QuizAttempt["answers"] } {
  const details: QuizAttempt["answers"] = questions.map((q) => {
    const chosen = answers[q.id];
    const chosenIndex = typeof chosen === "number" ? chosen : -1;
    const correct = chosenIndex === q.answerIndex;
    return { questionId: q.id, chosenIndex, correct };
  });
  const correctCount = details.filter((d) => d.correct).length;
  return {
    correct: correctCount,
    total: questions.length,
    passed: correctCount >= PASS_THRESHOLD,
    details,
  };
}
