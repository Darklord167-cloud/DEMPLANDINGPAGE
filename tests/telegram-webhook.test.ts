import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GET, POST, BOT_COMMANDS } from '../app/api/telegram/webhook/route';
import { GET as setupGET } from '../app/api/telegram/setup-commands/route';

describe('Telegram Bot Webhook & Commands API Route', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it('should return bot commands metadata on GET /api/telegram/webhook', async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.status).toBe('online');
    expect(json.bot).toBe('@DarkEmpireRelayBot');
    expect(json.commandsCount).toBe(13);
    expect(json.commands).toHaveLength(13);
  });

  it('should process /start command', async () => {
    process.env.TELEGRAM_BOT_TOKEN = 'mock-telegram-token';

    const mockFetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true, result: {} }), { status: 200 })
    );
    vi.stubGlobal('fetch', mockFetch);

    const req = new Request('http://localhost/api/telegram/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: {
          chat: { id: 12345678 },
          text: '/start',
          from: { first_name: 'Imperial', username: 'DarkLords' }
        }
      })
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('api.telegram.org/botmock-telegram-token/sendMessage'),
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('DARK EMPIRE COMMAND BRIDGE')
      })
    );
  });

  it('should process /help command', async () => {
    process.env.TELEGRAM_BOT_TOKEN = 'mock-telegram-token';

    const mockFetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true, result: {} }), { status: 200 })
    );
    vi.stubGlobal('fetch', mockFetch);

    const req = new Request('http://localhost/api/telegram/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: {
          chat: { id: 12345678 },
          text: '/help'
        }
      })
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('sendMessage'),
      expect.objectContaining({
        body: expect.stringContaining('DARK EMPIRE BOT & WEBHOOK DIRECTIVES')
      })
    );
  });

  it('should process /status command', async () => {
    process.env.TELEGRAM_BOT_TOKEN = 'mock-telegram-token';

    const mockFetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true, result: {} }), { status: 200 })
    );
    vi.stubGlobal('fetch', mockFetch);

    const req = new Request('http://localhost/api/telegram/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: {
          chat: { id: 12345678 },
          text: '/status'
        }
      })
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('sendMessage'),
      expect.objectContaining({
        body: expect.stringContaining('DARK EMPIRE SYSTEM HEALTH & UPTIME')
      })
    );
  });

  it('should process /contact command through dual-relay', async () => {
    process.env.TELEGRAM_BOT_TOKEN = 'mock-telegram-token';
    process.env.TELEGRAM_CHAT_ID = '987654321';
    process.env.DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/mock';

    const mockFetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true, result: {} }), { status: 200 })
    );
    vi.stubGlobal('fetch', mockFetch);

    const req = new Request('http://localhost/api/telegram/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: {
          chat: { id: 12345678 },
          text: '/contact Requesting VIP verification details for tier upgrade',
          from: { first_name: 'Lord', username: 'DarkHacker' }
        }
      })
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
  });

  it('should process /trade command', async () => {
    process.env.TELEGRAM_BOT_TOKEN = 'mock-telegram-token';

    const mockFetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true, result: {} }), { status: 200 })
    );
    vi.stubGlobal('fetch', mockFetch);

    const req = new Request('http://localhost/api/telegram/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: {
          chat: { id: 12345678 },
          text: '/trade'
        }
      })
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('sendMessage'),
      expect.objectContaining({
        body: expect.stringContaining('EXECUTE TRADES VIA AI ENGINE')
      })
    );
  });

  it('should process /balance command', async () => {
    process.env.TELEGRAM_BOT_TOKEN = 'mock-telegram-token';

    const mockFetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true, result: {} }), { status: 200 })
    );
    vi.stubGlobal('fetch', mockFetch);

    const req = new Request('http://localhost/api/telegram/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: {
          chat: { id: 12345678 },
          text: '/balance'
        }
      })
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('sendMessage'),
      expect.objectContaining({
        body: expect.stringContaining('LIVE PORTFOLIO BALANCES')
      })
    );
  });

  it('should process /bots command', async () => {
    process.env.TELEGRAM_BOT_TOKEN = 'mock-telegram-token';

    const mockFetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true, result: {} }), { status: 200 })
    );
    vi.stubGlobal('fetch', mockFetch);

    const req = new Request('http://localhost/api/telegram/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: {
          chat: { id: 12345678 },
          text: '/bots'
        }
      })
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('sendMessage'),
      expect.objectContaining({
        body: expect.stringContaining('ACTIVE AUTOMATED TRADING BOTS')
      })
    );
  });

  it('should call setMyCommands when setup-commands is invoked', async () => {
    process.env.TELEGRAM_BOT_TOKEN = 'mock-telegram-token';

    const mockFetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true, result: true }), { status: 200 })
    );
    vi.stubGlobal('fetch', mockFetch);

    const req = new Request('http://localhost/api/telegram/setup-commands');
    const res = await setupGET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.bot).toBe('@DarkEmpireRelayBot');
  });
});
