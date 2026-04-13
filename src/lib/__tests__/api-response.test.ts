import { describe, it, expect } from "vitest";
import { apiError, apiBadRequest, apiNotFound, apiSuccess, apiUnavailable } from "../api-response";

async function bodyJson(response: Response) { return JSON.parse(await response.text()); }

describe("apiError", () => {
  it("returns 500 by default", () => { expect(apiError(new Error("test")).status).toBe(500); });
  it("returns custom status", () => { expect(apiError(new Error("bad"), 400).status).toBe(400); });
  it("hides error details", async () => {
    const body = await bodyJson(apiError(new Error("SECRET_DB_URL=postgres://...")));
    expect(body.error.message).toBe("Internal server error");
    expect(body.error.message).not.toContain("SECRET");
    expect(body.error.code).toBe("INTERNAL_ERROR");
    expect(body.ok).toBe(false);
  });
  it("handles null", async () => {
    const body = await bodyJson(apiError(null));
    expect(body.error.message).toBe("Internal server error");
    expect(body.ok).toBe(false);
  });
  it("sets Content-Type json", () => {
    expect(apiError(new Error("t")).headers.get("Content-Type")).toBe("application/json");
  });
  it("returns valid JSON", async () => {
    const body = await bodyJson(apiError(new Error("t")));
    expect(body).toHaveProperty("error");
    expect(body).toHaveProperty("ok");
  });
});

describe("apiBadRequest", () => {
  it("returns 400 with validation error code", async () => {
    const res = apiBadRequest("Email is required");
    expect(res.status).toBe(400);
    const body = await bodyJson(res);
    expect(body.ok).toBe(false);
    expect(body.error.message).toBe("Email is required");
    expect(body.error.code).toBe("VALIDATION_ERROR");
  });
});

describe("apiNotFound", () => {
  it("returns 404 with resource name", async () => {
    const res = apiNotFound("Product");
    expect(res.status).toBe(404);
    const body = await bodyJson(res);
    expect(body.error.message).toBe("Product not found");
    expect(body.error.code).toBe("NOT_FOUND");
  });
});

describe("apiUnavailable", () => {
  it("returns 503", async () => {
    const res = apiUnavailable("D1 not available");
    expect(res.status).toBe(503);
    const body = await bodyJson(res);
    expect(body.error.message).toBe("D1 not available");
    expect(body.error.code).toBe("SERVICE_UNAVAILABLE");
  });
});

describe("apiSuccess", () => {
  it("returns 200 with data", async () => {
    const res = apiSuccess({ id: "123" });
    expect(res.status).toBe(200);
    const body = await bodyJson(res);
    expect(body.ok).toBe(true);
    expect(body.data).toEqual({ id: "123" });
  });
});
