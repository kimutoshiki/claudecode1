import { describe, expect, it } from "vitest";
import { getAllVideos, getVideoById, getVideosByCategory, getSeriesList } from "@/lib/videos";

describe("videos loader", () => {
  it("loads at least one sample", () => {
    expect(getAllVideos().length).toBeGreaterThan(0);
  });

  it("has unique ids", () => {
    const ids = getAllVideos().map((v) => v.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("looks up by id", () => {
    const video = getVideoById("10min-chiri-eu");
    expect(video?.series).toBe("10min.ボックス 地理");
  });

  it("filters by category", () => {
    expect(getVideosByCategory("geography").every((v) => v.category === "geography")).toBe(true);
    expect(getVideosByCategory("geography").length).toBeGreaterThan(0);
  });

  it("returns series list without duplicates", () => {
    const list = getSeriesList();
    expect(new Set(list).size).toBe(list.length);
  });
});
