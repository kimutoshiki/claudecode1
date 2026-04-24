import { notFound } from "next/navigation";
import { WatchWorkspace } from "@/components/video/WatchWorkspace";
import { getAllVideos, getVideoById } from "@/lib/videos";

export function generateStaticParams() {
  return getAllVideos().map((v) => ({ id: v.id }));
}

export default async function WatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const video = getVideoById(id);
  if (!video) notFound();
  return <WatchWorkspace video={video} />;
}
