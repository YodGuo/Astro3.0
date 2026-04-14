import { describe, it, expect } from "vitest";
import { renderTemplate, templateKey, getAvailableVariables } from "../notification/template-engine";

describe("renderTemplate", () => {
  it("replaces {{variable}} with HTML-escaped value", () => {
    expect(renderTemplate("Hello {{name}}!", { name: "<script>alert(1)</script>" })).toBe(
      "Hello &lt;script&gt;alert(1)&lt;/script&gt;!"
    );
  });
  it("replaces {{{variable}}} with raw value", () => {
    expect(renderTemplate("Content: {{{html}}}", { html: "<b>bold</b>" })).toBe("Content: <b>bold</b>");
  });
  it("returns empty for undefined variables", () => {
    expect(renderTemplate("{{missing}}", {})).toBe("");
  });
  it("handles multiple variables", () => {
    expect(renderTemplate("{{a}} {{b}}!", { a: "Hello", b: "World" })).toBe("Hello World!");
  });
  it("escapes HTML entities", () => {
    expect(renderTemplate("{{x}}", { x: '&<">\'' })).toBe("&amp;&lt;&quot;&gt;&#39;");
  });
});

describe("templateKey", () => {
  it("returns correct key", () => {
    expect(templateKey("quote.created")).toBe("template:quote.created");
  });
});

describe("getAvailableVariables", () => {
  it("returns variables for quote.created", () => {
    const vars = getAvailableVariables("quote.created");
    expect(vars).toContain("customerName");
    expect(vars).toContain("customerEmail");
  });
  it("returns empty for unknown", () => {
    expect(getAvailableVariables("unknown.event")).toEqual([]);
  });
});
