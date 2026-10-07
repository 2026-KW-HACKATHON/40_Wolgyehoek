import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "../proxy";

afterEach(() => vi.unstubAllEnvs());

describe("device cookie behind HTTPS termination", () => {
  it("sets Secure even when the internal upstream URL is HTTP", () => {
    vi.stubEnv("COOKIE_SECURE", "true");
    const response = proxy(new NextRequest("http://web:3000/"));
    expect(response.cookies.get("dn_device")?.secure).toBe(true);
    expect(response.cookies.get("dn_device")?.httpOnly).toBe(true);
    expect(response.headers.get("x-middleware-request-cookie")).toMatch(/dn_device=d_[0-9a-f]{16}/);
  });
  it("keeps local HTTP usable without the public deployment setting", () => {
    vi.stubEnv("COOKIE_SECURE", "");
    expect(proxy(new NextRequest("http://localhost:3000/")).cookies.get("dn_device")?.secure).toBe(false);
  });
  it("preserves the same device across requests", () => {
    vi.stubEnv("COOKIE_SECURE", "true");
    const request = new NextRequest("http://web:3000/", { headers: { cookie: "dn_device=d_0123456789abcdef" } });
    expect(proxy(request).cookies.get("dn_device")).toBeUndefined();
  });
});
