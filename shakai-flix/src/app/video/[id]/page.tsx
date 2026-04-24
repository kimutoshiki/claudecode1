import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, Play } from "lucide-react";
import { MyListButton } from "@/components/video/MyListButton";
import { VideoCard } from "@/components/video/VideoCard";
import { CATEGORY_LABEL } from "@/lib/types";
import { formatDuration, withBasePath } from "@/lib/utils";
import { getAllVideos, getVideoById, getVideosBySeries } from "@/lib/videos";

export function generateStaticParams() {
  return getAllVideos().map((v) => ({ id: v.id }));
}

export default async function VideoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const video = getVideoById(id);
  if (!video) notFound();

  const seriesEpisodes = getVideosBySeries(video.series).filter((v) => v.id !== video.id);
  const related = getAllVideos()
    .filter((v) => v.id !== video.id && v.series !== video.series)
    .filter((v) => v.tags.some((t) => video.tags.includes(t)))
    .slice(0, 8);

  return (
    <article className="flex flex-col">
      <section className="relative isolate h-[min(50vh,420px)] w-full overflow-hidden">
        <Image src={withBasePath(video.thumbnailUrl)} alt="" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
      </section>
      <div className="mx-auto -mt-32 flex w-full max-w-[1400px] flex-col gap-6 px-6 pb-16">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[color:var(--muted)]">
            <span className="rounded bg-[color:var(--surface)] px-2 py-0.5">
              {CATEGORY_LABEL[video.category]}
            </span>
            <span>{video.series}</span>
            <span>· 第 {video.episode} 回</span>
            <span>· {formatDuration(video.durationSec)}</span>
          </div>
          <h1 className="text-3xl font-bold sm:text-4xl">{video.title}</h1>
          <p className="max-w-3xl text-[color:var(--muted)]">{video.description}</p>
          <div className="flex flex-wrap gap-2">
            {video.tags.map((t) => (
              <span
                key={t}
                className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-1 text-xs text-[color:var(--muted)]"
              >
                #{t}
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/watch/${video.id}`}
            className="inline-flex items-center gap-2 rounded bg-[color:var(--foreground)] px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-white"
          >
            <Play size={16} fill="currentColor" />
            視聴する
          </Link>
          <Link
            href={`/quiz/${video.id}`}
            className="inline-flex items-center gap-2 rounded bg-[color:var(--surface)]/70 px-5 py-2.5 text-sm font-semibold backdrop-blur transition hover:bg-[color:var(--surface-hover)]"
          >
            クイズに挑戦
          </Link>
          <MyListButton videoId={video.id} />
          <a
            href={video.sourceUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-2 rounded border border-[color:var(--border)] px-4 py-2.5 text-sm text-[color:var(--muted)] transition hover:text-[color:var(--foreground)]"
          >
            <ExternalLink size={14} />
            NHK for School で開く
          </a>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <dl className="space-y-1 rounded-md bg-[color:var(--surface)] p-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-[color:var(--muted)]">対象学年</dt>
              <dd>{video.grade.map((g) => `中${g}`).join(" / ")}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[color:var(--muted)]">学習指導要領</dt>
              <dd className="font-mono text-xs">{video.curriculumCodes.join(", ")}</dd>
            </div>
          </dl>
        </div>
        {seriesEpisodes.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">同じシリーズの他の回</h2>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
              {seriesEpisodes.map((v) => (
                <VideoCard key={v.id} video={v} />
              ))}
            </div>
          </section>
        )}
        {related.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">関連動画</h2>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
              {related.map((v) => (
                <VideoCard key={v.id} video={v} />
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
