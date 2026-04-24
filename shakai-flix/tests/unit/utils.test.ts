import { describe, expect, it } from "vitest";
import { cn, formatDuration, parseTimestamp } from "@/lib/utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("removes falsy values", () => {
    expect(cn("a", false && "b", undefined, null, "c")).toBe("a c");
  });

  it("deduplicates tailwind conflicts via tailwind-merge", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });
});

describe("formatDuration", () => {
  it("formats under an hour as M:SS", () => {
    expect(formatDuration(0)).toBe("0:00");
    expect(formatDuration(65)).toBe("1:05");
    expect(formatDuration(600)).toBe("10:00");
  });

  it("formats over an hour as H:MM:SS", () => {
    expect(formatDuration(3600)).toBe("1:00:00");
    expect(formatDuration(3725)).toBe("1:02:05");
  });

  it("returns 0:00 for invalid input", () => {
    expect(formatDuration(Number.NaN)).toBe("0:00");
    expect(formatDuration(-10)).toBe("0:00");
  });
});

describe("parseTimestamp", () => {
  it("parses [MM:SS]", () => {
    expect(parseTimestamp("[02:34]")).toBe(154);
  });

  it("parses [H:MM:SS]", () => {
    expect(parseTimestamp("[1:02:05]")).toBe(3725);
  });

  it("returns null for malformed input", () => {
    expect(parseTimestamp("02:34")).toBeNull();
    expect(parseTimestamp("[abc]")).toBeNull();
  });
});
