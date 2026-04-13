import { describe, it, expect } from "vitest";
import { sanitizeHtml } from "../sanitize";

describe("sanitizeHtml", () => {
  it("returns empty string for empty input", () => { expect(sanitizeHtml("")).toBe(""); });
  it("passes through plain text unchanged", () => { expect(sanitizeHtml("Hello world")).toBe("Hello world"); });
  it("preserves allowed tags", () => {
    expect(sanitizeHtml("<p>Hello</p>")).toBe("<p>Hello</p>");
    expect(sanitizeHtml("<strong>bold</strong>")).toBe("<strong>bold</strong>");
    expect(sanitizeHtml("<br>")).toBe("<br>");
  });
  it("preserves allowed attributes on allowed tags", () => {
    expect(sanitizeHtml('<a href="https://example.com">link</a>')).toBe(
      '<a href="https://example.com" rel="noopener noreferrer">link</a>'
    );
  });
  it("strips disallowed tags but keeps content", () => {
    expect(sanitizeHtml("<script>alert('xss')</script>")).toBe("alert('xss')");
    expect(sanitizeHtml("<iframe src='evil.com'></iframe>")).toBe("");
  });
  it("strips disallowed attributes on allowed tags", () => {
    expect(sanitizeHtml('<p onclick="alert(1)">text</p>')).toBe("<p>text</p>");
  });
  it("blocks javascript: protocol in href", () => {
    expect(sanitizeHtml('<a href="javascript:alert(1)">click</a>')).toBe(
      '<a rel="noopener noreferrer">click</a>'
    );
  });
  it("blocks data: protocol in href", () => {
    const result = sanitizeHtml('<a href="data:text/html,test">click</a>');
    expect(result).not.toContain("data:");
  });
  it("blocks vbscript: protocol", () => {
    expect(sanitizeHtml('<a href="vbscript:MsgBox(1)">click</a>')).toBe(
      '<a rel="noopener noreferrer">click</a>'
    );
  });
  it("blocks javascript: in img src", () => {
    expect(sanitizeHtml('<img src="javascript:alert(1)">')).toBe("<img>");
  });
  it("removes HTML comments", () => {
    expect(sanitizeHtml("<!-- comment --><p>text</p>")).toBe("<p>text</p>");
  });
  it("handles nested tags", () => {
    expect(sanitizeHtml("<div><p><strong>bold</strong></p></div>")).toBe(
      "<div><p><strong>bold</strong></p></div>"
    );
  });
  it("forces rel=noopener noreferrer on links", () => {
    expect(sanitizeHtml('<a href="https://example.com">link</a>')).toContain('rel="noopener noreferrer"');
  });
  it("does not duplicate rel if already present", () => {
    const result = sanitizeHtml('<a href="https://example.com" rel="nofollow">link</a>');
    expect(result).toContain('rel="nofollow"');
    expect(result).not.toContain("noopener");
  });
  it("normalizes tag case", () => {
    expect(sanitizeHtml("<SCRIPT>alert(1)</SCRIPT>")).toBe("alert(1)");
    expect(sanitizeHtml("<P>text</P>")).toBe("<p>text</p>");
  });
  it("handles mixed-case protocol", () => {
    expect(sanitizeHtml('<a href="JaVaScRiPt:alert(1)">click</a>')).toBe(
      '<a rel="noopener noreferrer">click</a>'
    );
  });
  it("handles malformed HTML", () => {
    expect(sanitizeHtml("<p>unclosed")).toBe("<p>unclosed");
    expect(sanitizeHtml("<<>>")).toBe("<<>>");
  });
  it("preserves table structure", () => {
    const html = '<table><thead><tr><th colspan="2">H</th></tr></thead><tbody><tr><td>C</td></tr></tbody></table>';
    expect(sanitizeHtml(html)).toBe(html);
  });
  it("sanitizes solution content with mixed safe and unsafe HTML", () => {
    const input = '<h2>Our Solutions</h2><p>Reliable <strong>UPS systems</strong></p><script>alert("xss")</script><img src="x" onerror="alert(1)">';
    const result = sanitizeHtml(input);
    expect(result).toContain("<h2>Our Solutions</h2>");
    expect(result).toContain("<strong>UPS systems</strong>");
    expect(result).not.toContain("<script>");
    expect(result).not.toContain("onerror");
  });
  it("handles null input gracefully", () => {
    expect(sanitizeHtml(null as unknown as string)).toBe("");
  });
  it("strips script tags from about story body text", () => {
    const input = "Our company<script>alert('xss')</script> is great";
    const result = sanitizeHtml(input);
    expect(result).not.toContain("<script>");
    expect(result).toContain("Our company");
    expect(result).toContain("is great");
  });
  it("strips inline event handlers from about story body text", () => {
    const input = 'Click <a href="https://example.com" onclick="alert(1)">here</a>';
    const result = sanitizeHtml(input);
    expect(result).not.toContain("onclick");
    expect(result).toContain('rel="noopener noreferrer"');
  });
});
