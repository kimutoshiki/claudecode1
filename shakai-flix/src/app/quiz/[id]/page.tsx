import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { QuizRunner } from "@/components/quiz/QuizRunner";
import { getAllVideos, getVideoById } from "@/lib/videos";

export function generateStaticParams() {
  return getAllVideos().map((v) => ({ id: v.id }));
}

export default async function QuizPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const video = getVideoById(id);
  if (!video) notFound();

  return (
    <div className="min-h-[calc(100vh-56px)]">
      <header className="border-b border-[color:var(--border)] bg-[color:var(--surface)]/60">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-3 px-4 py-3">
          <Link
            href={`/video/${video.id}`}
            aria-label="戻る"
            className="rounded p-1.5 text-[color:var(--muted)] hover:bg-[color:var(--surface-hover)] hover:text-[color:var(--foreground)]"
          >
            <ArrowLeft size={16} />
          </Link>
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-wider text-[color:var(--muted)]">
              理解度クイズ
            </div>
            <h1 className="truncate text-sm font-semibold">{video.title}</h1>
          </div>
        </div>
      </header>
      <QuizRunner video={video} />
    </div>
  );
}
