import { describe, expect, it } from "vitest";
import { sizedImage } from "./image";

describe("sizedImage", () => {
  it("changes the width of an Unsplash photo", () => {
    const url = "https://images.unsplash.com/photo-1?auto=format&fit=crop&w=1200&q=75";
    expect(sizedImage(url, 600)).toBe(
      "https://images.unsplash.com/photo-1?auto=format&fit=crop&w=600&q=75",
    );
  });

  it("adds quality and format when they are missing", () => {
    expect(sizedImage("https://images.unsplash.com/photo-1", 300)).toBe(
      "https://images.unsplash.com/photo-1?w=300&q=75&auto=format",
    );
  });

  it("leaves other images alone", () => {
    expect(sizedImage("/template1.webp", 600)).toBe("/template1.webp");
    expect(sizedImage("https://example.com/a.jpg?w=1200", 600)).toBe("https://example.com/a.jpg?w=1200");
    expect(sizedImage(null, 600)).toBeNull();
  });
});
