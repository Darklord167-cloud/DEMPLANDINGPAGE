import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { POST } from "../app/api/contact/route";

describe("Contact Form API Route", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it("should process valid payload and return success response", async () => {
    const payload = {
      name: "Darth Vader",
      email: "vader@darkempire.com",
      subject: "Alliance Inquiry",
      message: "We request a formal meeting regarding planetary infrastructure.",
    };

    const req = new Request("http://localhost/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.message).toBe("Message sent successfully!");
    expect(json.contact).toBeDefined();
    expect(json.contact.name).toBe(payload.name);
  });

  it("should return 400 for invalid email address", async () => {
    const payload = {
      name: "Darth Vader",
      email: "invalid-email-address",
      subject: "Alliance Inquiry",
      message: "Testing invalid email.",
    };

    const req = new Request("http://localhost/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.message).toContain("valid email");
  });

  it("should return 400 for missing required fields", async () => {
    const payload = {
      name: "",
      email: "vader@darkempire.com",
      subject: "",
      message: "",
    };

    const req = new Request("http://localhost/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.success).toBe(false);
  });

  it("should attempt relay when Discord webhook URL is configured", async () => {
    process.env.DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/mock/test";

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: true }), { status: 200 })
    );

    const payload = {
      name: "Emperor Palpatine",
      email: "emperor@darkempire.com",
      subject: "Imperial Decree",
      message: "Execute order 66.",
    };

    const req = new Request("http://localhost/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://discord.com/api/webhooks/mock/test",
      expect.objectContaining({ method: "POST" })
    );
  });
});
