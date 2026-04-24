import { HeroCarousel } from "@/components/video/HeroCarousel";
import { VideoRow } from "@/components/video/VideoRow";
import { HomeContinueRow } from "@/components/home/HomeContinueRow";
import { HomeMyListRow } from "@/components/home/HomeMyListRow";
import { getAllVideos, getVideosByCategory } from "@/lib/videos";

export default function Home() {
  const all = getAllVideos();
  const hero = all.slice(0, Math.min(3, all.length));
  const history = getVideosByCategory("history");
  const geography = getVideosByCategory("geography");
  const civics = getVideosByCategory("civics");

  return (
    <div className="flex flex-col gap-10 pb-16">
      <HeroCarousel videos={hero} />
      <div className="space-y-10">
        <HomeContinueRow allVideos={all} />
        {geography.length > 0 && (
          <VideoRow
            title="地理"
            subtitle={`${geography.length} 本`}
            videos={geography}
          />
        )}
        {history.length > 0 && (
          <VideoRow
            title="歴史"
            subtitle={`${history.length} 本`}
            videos={history}
          />
        )}
        {civics.length > 0 && (
          <VideoRow
            title="公民"
            subtitle={`${civics.length} 本`}
            videos={civics}
          />
        )}
        <HomeMyListRow allVideos={all} />
      </div>
    </div>
  );
}
