import { describe, it, expect } from "vitest";

function sanitizeFilename(name: string): string {
  return name.replace(/[^\w.-]/g, '_').replace(/\.{2,}/g, '_').replace(/^\.+/, '').slice(0, 80) || 'file';
}

describe("sanitizeFilename", () => {
  it("passes safe names", () => { expect(sanitizeFilename("photo.jpg")).toBe("photo.jpg"); });
  it("blocks path traversal", () => {
    const r = sanitizeFilename("../../etc/passwd");
    expect(r).not.toContain("..");
  });
  it("strips leading dots", () => { expect(sanitizeFilename(".env")).toBe("env"); });
  it("replaces spaces", () => { expect(sanitizeFilename("my photo.jpg")).toBe("my_photo.jpg"); });
  it("replaces shell chars", () => { expect(sanitizeFilename("file;rm.jpg")).toBe("file_rm.jpg"); });
  it("truncates to 80", () => {
    expect(sanitizeFilename("a".repeat(100) + ".jpg").length).toBeLessThanOrEqual(80);
  });
  it("returns file for empty", () => { expect(sanitizeFilename("")).toBe("file"); });
  it("handles consecutive dots", () => { expect(sanitizeFilename("file...jpg")).toBe("file_jpg"); });
});
