import { describe, it, expect } from "vitest";
import { validateWebhookUrl } from "../notification/webhook.service";

describe("validateWebhookUrl", () => {
  it("allows https URLs", () => {
    expect(validateWebhookUrl("https://example.com/webhook")).toEqual({ valid: true });
  });
  it("allows http to public IPs", () => {
    expect(validateWebhookUrl("http://8.8.8.8/webhook")).toEqual({ valid: true });
  });
  it("rejects invalid URL", () => {
    const r = validateWebhookUrl("not-a-url");
    expect(r.valid).toBe(false);
  });
  it("rejects file:// protocol", () => {
    const r = validateWebhookUrl("file:///etc/passwd");
    expect(r.valid).toBe(false);
  });
  it("rejects localhost", () => {
    const r = validateWebhookUrl("http://localhost:8787/api");
    expect(r.valid).toBe(false);
  });
  it("rejects 127.0.0.1", () => {
    const r = validateWebhookUrl("http://127.0.0.1:8787");
    expect(r.valid).toBe(false);
  });
  it("rejects 10.0.0.0/8", () => {
    expect(validateWebhookUrl("http://10.0.0.1").valid).toBe(false);
  });
  it("rejects 172.16.0.0/12", () => {
    expect(validateWebhookUrl("http://172.16.0.1").valid).toBe(false);
    expect(validateWebhookUrl("http://172.31.255.255").valid).toBe(false);
  });
  it("rejects 192.168.0.0/16", () => {
    expect(validateWebhookUrl("http://192.168.0.1").valid).toBe(false);
  });
  it("rejects 169.254.169.254 (cloud metadata)", () => {
    const r = validateWebhookUrl("http://169.254.169.254/latest/meta-data/");
    expect(r.valid).toBe(false);
  });
  it("rejects GCP metadata hostname", () => {
    const r = validateWebhookUrl("http://metadata.google.internal/");
    expect(r.valid).toBe(false);
  });
  it("rejects IPv6 loopback", () => {
    const r = validateWebhookUrl("http://[::1]:8787");
    expect(r.valid).toBe(false);
  });
  it("rejects IPv6 unique-local", () => {
    const r = validateWebhookUrl("http://[fc00::1]");
    expect(r.valid).toBe(false);
  });
  it("rejects .local domains", () => {
    const r = validateWebhookUrl("http://my-service.local:8787");
    expect(r.valid).toBe(false);
  });
  it("rejects 100.64.0.0/10 CGNAT", () => {
    expect(validateWebhookUrl("http://100.64.0.1").valid).toBe(false);
  });
  it("rejects TEST-NET-1", () => {
    expect(validateWebhookUrl("http://192.0.2.1").valid).toBe(false);
  });
  it("rejects 198.18.0.0/15", () => {
    expect(validateWebhookUrl("http://198.18.0.1").valid).toBe(false);
  });
});
