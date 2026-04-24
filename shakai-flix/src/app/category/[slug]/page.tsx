import { notFound } from "next/navigation";
import { VideoCard } from "@/components/video/VideoCard";
import { CATEGORY_LABEL, type Category } from "@/lib/types";
import { getVideosByCategory } from "@/lib/videos";

const VALID_SLUGS: Category[] = ["geography", "history", "civics"];

function isCategory(slug: string): slug is Category {
  return (VALID_SLUGS as string[]).includes(slug);
}

export function generateStaticParams() {
  return VALID_SLUGS.map((slug) => ({ slug }));
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!isCategory(slug)) notFound();
  const videos = getVideosByCategory(slug);
  const label = CATEGORY_LABEL[slug];

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-8 px-6 py-10">
      <header className="space-y-2">
        <p className="text-xs font-semibold tracking-[0.2em] text-[color:var(--accent)]">
          CATEGORY
        </p>
        <h1 className="text-3xl font-bold">{label}</h1>
        <p className="text-sm text-[color:var(--muted)]">
          {videos.length} 本の動画が登録されています
        </p>
      </header>
      {videos.length === 0 ? (
        <p className="text-[color:var(--muted)]">
          この分野にはまだ動画が登録されていません。
        </p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
          {videos.map((v) => (
            <VideoCard key={v.id} video={v} />
          ))}
        </div>
      )}
    </div>
  );
}
