"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ExternalLink, RotateCcw, XCircle } from "lucide-react";
import { getDB } from "@/lib/db";
import {
  PASS_THRESHOLD,
  loadQuiz,
  prepareQuestions,
  scoreAttempt,
  type ShuffledQuestion,
} from "@/lib/quiz";
import { cn, formatDuration } from "@/lib/utils";
import type { Quiz, QuizAttempt, VideoMeta } from "@/lib/types";

interface Props {
  video: VideoMeta;
}

type Phase = "loading" | "playing" | "result" | "notfound";

export function QuizRunner({ video }: Props) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<ShuffledQuestion[]>([]);
  const [startedAt, setStartedAt] = useState<number>(() => Date.now());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [attemptId, setAttemptId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const q = await loadQuiz(video.id);
      if (cancelled) return;
      if (!q || q.questions.length === 0) {
        setPhase("notfound");
        return;
      }
      setQuiz(q);
      setQuestions(prepareQuestions(q));
      setStartedAt(Date.now());
      setPhase("playing");
    })();
    return () => {
      cancelled = true;
    };
  }, [video.id]);

  const result = useMemo(() => {
    if (phase !== "result") return null;
    return scoreAttempt(questions, answers);
  }, [phase, questions, answers]);

  const restart = () => {
    if (!quiz) return;
    setQuestions(prepareQuestions(quiz));
    setAnswers({});
    setRevealed({});
    setCurrentIndex(0);
    setStartedAt(Date.now());
    setAttemptId(null);
    setPhase("playing");
  };

  const handleSelect = (questionId: string, chosenIndex: number) => {
    if (revealed[questionId]) return;
    setAnswers((a) => ({ ...a, [questionId]: chosenIndex }));
    setRevealed((r) => ({ ...r, [questionId]: true }));
  };

  const goNext = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      return;
    }
    const scored = scoreAttempt(questions, answers);
    const attempt: QuizAttempt = {
      id: `${video.id}-${startedAt}`,
      videoId: video.id,
      startedAt,
      finishedAt: Date.now(),
      answers: scored.details,
      score: scored.correct,
      passed: scored.passed,
    };
    const db = getDB();
    await db.quizAttempts.put(attempt);
    if (scored.passed) {
      const existing = (await db.watchProgress.get(video.id)) ?? null;
      await db.watchProgress.put({
        videoId: video.id,
        positionSec: existing?.positionSec ?? video.durationSec,
        durationSec: video.durationSec,
        lastWatchedAt: Date.now(),
        completed: true,
        completedAt: Date.now(),
      });
    }
    setAttemptId(attempt.id);
    setPhase("result");
  };

  if (phase === "loading") {
    return (
      <p className="p-10 text-center text-[color:var(--muted)]">
        クイズを読み込み中…
      </p>
    );
  }
  if (phase === "notfound") {
    return (
      <div className="mx-auto max-w-xl space-y-3 p-10 text-center">
        <h1 className="text-2xl font-bold">クイズはまだありません</h1>
        <p className="text-[color:var(--muted)]">
          この動画向けのクイズが未登録です。動画視聴後の確認は他の動画で試してみてください。
        </p>
        <Link
          href={`/video/${video.id}`}
          className="inline-block rounded bg-[color:var(--surface)] px-4 py-2 text-sm hover:bg-[color:var(--surface-hover)]"
        >
          動画詳細に戻る
        </Link>
      </div>
    );
  }

  if (phase === "result" && result) {
    return (
      <QuizResult
        video={video}
        correct={result.correct}
        total={result.total}
        passed={result.passed}
        questions={questions}
        answers={answers}
        onRetry={restart}
        attemptId={attemptId}
      />
    );
  }

  const question = questions[currentIndex];
  if (!question) return null;
  const chosen = answers[question.id];
  const isRevealed = !!revealed[question.id];
  const answeredCount = Object.keys(revealed).length;
  const progressPct = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="mx-auto max-w-2xl space-y-5 px-4 py-8">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-[color:var(--muted)]">
          <span>
            問題 {currentIndex + 1} / {questions.length}
          </span>
          <span>回答済み {answeredCount}</span>
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-[color:var(--surface)]">
          <div
            className="h-full bg-[color:var(--accent)] transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <div className="space-y-4 rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] p-5">
        <h2 className="text-lg font-semibold">{question.question}</h2>
        <ul className="space-y-2">
          {question.choiceOrder.map((origIndex) => {
            const label = question.choices[origIndex];
            const isChosen = chosen === origIndex;
            const isCorrect = origIndex === question.answerIndex;
            const showState = isRevealed;
            return (
              <li key={origIndex}>
                <button
                  type="button"
                  disabled={isRevealed}
                  onClick={() => handleSelect(question.id, origIndex)}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-md border px-4 py-2.5 text-left text-sm transition",
                    !showState &&
                      "border-[color:var(--border)] bg-[color:var(--background)] hover:border-[color:var(--accent)]",
                    showState && isCorrect &&
                      "border-emerald-500 bg-emerald-500/10 text-emerald-200",
                    showState && !isCorrect && isChosen &&
                      "border-rose-500 bg-rose-500/10 text-rose-200",
                    showState && !isCorrect && !isChosen &&
                      "border-[color:var(--border)] bg-[color:var(--background)] opacity-60",
                  )}
                >
                  <span>{label}</span>
                  {showState && isCorrect && <CheckCircle2 size={16} />}
                  {showState && !isCorrect && isChosen && <XCircle size={16} />}
                </button>
              </li>
            );
          })}
        </ul>

        {isRevealed && (
          <div className="rounded-md bg-[color:var(--background)] p-3 text-sm">
            <p className="mb-1 text-xs font-semibold text-[color:var(--accent)]">
              解説
            </p>
            <p className="text-[color:var(--muted)]">{question.explanation}</p>
            {question.timestampSec !== undefined && (
              <p className="mt-2 text-xs">
                該当時刻:{" "}
                <Link
                  href={`/watch/${video.id}`}
                  className="font-mono text-[color:var(--accent)] underline"
                >
                  {formatDuration(question.timestampSec)}
                </Link>
              </p>
            )}
          </div>
        )}

        <div className="flex items-center justify-end">
          <button
            type="button"
            disabled={!isRevealed}
            onClick={goNext}
            className={cn(
              "inline-flex items-center gap-1.5 rounded px-4 py-2 text-sm font-semibold transition",
              isRevealed
                ? "bg-[color:var(--accent)] text-white hover:bg-[color:var(--accent-hover)]"
                : "cursor-not-allowed bg-[color:var(--surface-hover)] text-[color:var(--muted)]",
            )}
          >
            {currentIndex < questions.length - 1 ? "次の問題" : "結果を見る"}
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      <p className="text-center text-xs text-[color:var(--muted)]">
        合格ライン: {PASS_THRESHOLD} / {questions.length} 問正解
      </p>
    </div>
  );
}

interface ResultProps {
  video: VideoMeta;
  correct: number;
  total: number;
  passed: boolean;
  questions: ShuffledQuestion[];
  answers: Record<string, number>;
  onRetry: () => void;
  attemptId: string | null;
}

function QuizResult({
  video,
  correct,
  total,
  passed,
  questions,
  answers,
  onRetry,
}: ResultProps) {
  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <section
        className={cn(
          "rounded-lg border p-6 text-center",
          passed
            ? "border-emerald-500 bg-emerald-500/10"
            : "border-rose-500/60 bg-rose-500/5",
        )}
      >
        {passed ? (
          <>
            <CheckCircle2 className="mx-auto text-emerald-400" size={44} />
            <h1 className="mt-3 text-2xl font-bold">合格！</h1>
            <p className="mt-1 text-sm text-[color:var(--muted)]">
              {correct} / {total} 問正解 — ✅バッジを獲得しました
            </p>
          </>
        ) : (
          <>
            <XCircle className="mx-auto text-rose-400" size={44} />
            <h1 className="mt-3 text-2xl font-bold">もう一歩！</h1>
            <p className="mt-1 text-sm text-[color:var(--muted)]">
              {correct} / {total} 問正解（合格ライン: {PASS_THRESHOLD} 問）
            </p>
          </>
        )}
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 rounded bg-[color:var(--foreground)] px-4 py-2 text-sm font-semibold text-black hover:bg-white"
          >
            <RotateCcw size={14} />
            もう一度挑戦
          </button>
          <Link
            href={`/watch/${video.id}`}
            className="inline-flex items-center gap-1.5 rounded bg-[color:var(--surface)] px-4 py-2 text-sm hover:bg-[color:var(--surface-hover)]"
          >
            <ExternalLink size={14} />
            動画に戻る
          </Link>
          <Link
            href="/profile"
            className="inline-flex items-center gap-1.5 rounded bg-[color:var(--surface)] px-4 py-2 text-sm hover:bg-[color:var(--surface-hover)]"
          >
            マイページ
          </Link>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-[color:var(--muted)]">
          回答レビュー
        </h2>
        <ol className="space-y-2">
          {questions.map((q, i) => {
            const chosen = answers[q.id];
            const isCorrect = chosen === q.answerIndex;
            return (
              <li
                key={q.id}
                className="rounded-md border border-[color:var(--border)] bg-[color:var(--surface)] p-3 text-sm"
              >
                <div className="flex items-start gap-2">
                  {isCorrect ? (
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-400" />
                  ) : (
                    <XCircle size={16} className="mt-0.5 shrink-0 text-rose-400" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-[color:var(--muted)]">Q{i + 1}</div>
                    <div className="font-medium">{q.question}</div>
                    {!isCorrect && (
                      <div className="mt-1 text-xs text-[color:var(--muted)]">
                        正解: {q.choices[q.answerIndex]}
                      </div>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
