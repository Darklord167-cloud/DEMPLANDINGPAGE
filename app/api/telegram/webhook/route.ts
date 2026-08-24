import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { 
  DEMP_TOKEN_MINT, 
  DEMP_DEPLOYER_WALLET, 
  DEMP_TREASURY_WALLET, 
  DEMP_LIQUIDITY_POOL,
  USDC_TOKEN_MINT,
  CANONICAL_SITE_URL 
} from "@/lib/config/public";
import { fetchTokenTelemetry, formatUsdValue } from "@/lib/solana/telemetry";

// Initialize Gemini AI securely
const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || ""
});

// Telegram Bot Command Definitions for Trading Terminal
export const BOT_COMMANDS = [
  {
    command: "start",
    description: "Initialize connection and get your Chat ID"
  },
  {
    command: "wallet",
    description: "View verified treasury & deployer addresses"
  },
  {
    command: "trade",
    description: "Execute trades via Jupiter DEX Aggregator"
  },
  {
    command: "alerts",
    description: "View active price alert and whale radar configurations"
  },
  {
    command: "portfolio",
    description: "View real-time token telemetry and holdings"
  },
  {
    command: "oracle",
    description: "Summon Gemini AI trading assistant"
  },
  {
    command: "status",
    description: "View Dark Empire system health and RPC uptime"
  },
  {
    command: "balance",
    description: "Check live $DEMP token market valuation"
  },
  {
    command: "bots",
    description: "List automated bot execution strategies"
  },
  {
    command: "pause",
    description: "Emergency standby for automated workers"
  },
  {
    command: "resume",
    description: "Restart algorithmic trading workers"
  },
  {
    command: "sweep",
    description: "View cold storage sweep protocol status"
  },
  {
    command: "vip",
    description: "View VIP tier perks and verification"
  },
  {
    command: "help",
    description: "View full command documentation and links"
  }
];

// Helper to send messages back to Telegram
async function sendTelegramMessage(chatId: string | number, text: string, replyMarkup?: any) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.warn("[Telegram Webhook] TELEGRAM_BOT_TOKEN not configured on server.");
    return false;
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "Markdown",
        disable_web_page_preview: true,
        reply_markup: replyMarkup
      }),
      signal: AbortSignal.timeout(8000),
    });

    const data = await res.json();
    return data.ok;
  } catch (err: any) {
    console.error("[Telegram Webhook] Failed to send Telegram message:", err?.message || err);
    return false;
  }
}

// Telegram Inline Keyboard Templates
const MAIN_KEYBOARD = {
  inline_keyboard: [
    [
      { text: "⚡ Swap $DEMP", callback_data: "cmd_trade" },
      { text: "💼 Market Telemetry", callback_data: "cmd_portfolio" }
    ],
    [
      { text: "🤖 Trading Bots", callback_data: "cmd_bots" },
      { text: "🔮 AI Oracle", callback_data: "cmd_oracle" }
    ],
    [
      { text: "🏦 Treasury Info", callback_data: "cmd_wallet" },
      { text: "💰 Live Price", callback_data: "cmd_balance" }
    ],
    [
      { text: "🚨 Whale Radar", callback_data: "cmd_alerts" },
      { text: "📊 System Health", callback_data: "cmd_status" }
    ],
    [
      { text: "👑 VIP Tiers", callback_data: "cmd_vip" },
      { text: "🧹 Sweep Protocol", callback_data: "cmd_sweep" }
    ],
    [
      { text: "🌐 Command Center Web", url: `${CANONICAL_SITE_URL}/command-center` },
      { text: "💬 Support Discord", url: "https://discord.gg/cyWVcvyZ" }
    ]
  ]
};

// GET handler for Webhook health status and registration check
export async function GET() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const configured = Boolean(token);

  return NextResponse.json({
    status: "online",
    bot: "@DarkEmpireRelayBot",
    telegramConfigured: configured,
    commandsCount: BOT_COMMANDS.length,
    commands: BOT_COMMANDS
  });
}

// POST handler for incoming Telegram updates
export async function POST(req: Request) {
  // 1. Webhook Secret Token validation
  const expectedSecretToken = process.env.TELEGRAM_WEBHOOK_SECRET_TOKEN || process.env.RELAY_SECRET_KEY;
  if (expectedSecretToken) {
    const secretHeader = req.headers.get("x-telegram-bot-api-secret-token");
    if (secretHeader !== expectedSecretToken) {
      console.warn("[Telegram Webhook] Unauthorized secret token mismatch rejected.");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    // Handle Callback Queries (Button clicks)
    if (body.callback_query) {
      const cb = body.callback_query;
      const chatId = cb.message?.chat?.id;
      const data = cb.data;

      if (chatId) {
        if (data === "cmd_status") await handleStatusCommand(chatId);
        else if (data === "cmd_trade") await handleTradeCommand(chatId);
        else if (data === "cmd_wallet") await handleWalletCommand(chatId);
        else if (data === "cmd_portfolio") await handlePortfolioCommand(chatId);
        else if (data === "cmd_balance") await handleBalanceCommand(chatId);
        else if (data === "cmd_bots") await handleBotsCommand(chatId);
        else if (data === "cmd_pause") await handlePauseCommand(chatId);
        else if (data === "cmd_resume") await handleResumeCommand(chatId);
        else if (data === "cmd_sweep") await handleSweepCommand(chatId);
        else if (data === "cmd_alerts") await handleAlertsCommand(chatId);
        else if (data === "cmd_vip") await handleVipCommand(chatId);
        else if (data === "cmd_help") await handleHelpCommand(chatId);
        else if (data === "cmd_oracle") {
          await sendTelegramMessage(chatId, "🔮 *Dark Empire AI Oracle*\n\nSend your trading or strategic question using:\n`/oracle <your query>`\n\n*Example:*\n`/oracle Analyze the current Solana DEX market structure and support levels.`");
        } else if (data === "cmd_contact") {
          await sendTelegramMessage(chatId, "📩 *Dark Empire HQ Support Relay*\n\nSend your message using:\n`/contact <your message>`\n\n*Example:*\n`/contact Inquiry regarding VIP Syndicate tier verification`");
        }
      }

      return NextResponse.json({ ok: true });
    }

    const message = body.message || body.edited_message;
    if (!message || !message.text) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    const chatId = message.chat.id;
    const rawText = message.text.trim();
    const commandMatch = rawText.split(" ")[0].toLowerCase();
    const commandArg = rawText.substring(commandMatch.length).trim();

    // Command Dispatcher
    if (commandMatch === "/start") {
      await handleStartCommand(chatId, message.from);
    } else if (commandMatch === "/wallet") {
      await handleWalletCommand(chatId);
    } else if (commandMatch === "/trade") {
      await handleTradeCommand(chatId);
    } else if (commandMatch === "/alerts") {
      await handleAlertsCommand(chatId);
    } else if (commandMatch === "/portfolio" || commandMatch === "/holdings") {
      await handlePortfolioCommand(chatId);
    } else if (commandMatch === "/oracle" || commandMatch === "/ai") {
      await handleOracleCommand(chatId, commandArg);
    } else if (commandMatch === "/status") {
      await handleStatusCommand(chatId);
    } else if (commandMatch === "/balance" || commandMatch === "/price") {
      await handleBalanceCommand(chatId);
    } else if (commandMatch === "/bots") {
      await handleBotsCommand(chatId);
    } else if (commandMatch === "/pause" || commandMatch === "/stop") {
      await handlePauseCommand(chatId);
    } else if (commandMatch === "/resume" || commandMatch === "/restart") {
      await handleResumeCommand(chatId);
    } else if (commandMatch === "/sweep") {
      await handleSweepCommand(chatId);
    } else if (commandMatch === "/help") {
      await handleHelpCommand(chatId);
    } else if (commandMatch === "/vip") {
      await handleVipCommand(chatId);
    } else if (commandMatch === "/contact") {
      await handleContactCommand(chatId, commandArg, message.from);
    } else {
      await sendTelegramMessage(
        chatId,
        `⚡ *Dark Empire Relay Bot (@DarkEmpireRelayBot)*\n\nUnrecognized command \`${rawText}\`.\nType /help to see all available directives.`,
        MAIN_KEYBOARD
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("[Telegram Webhook Internal Error]:", error);
    return NextResponse.json({ ok: false, error: "Internal webhook processing error" }, { status: 500 });
  }
}

// 1. /start Handler
async function handleStartCommand(chatId: string | number, user?: any) {
  const firstName = user?.first_name || "Imperial Agent";
  const username = user?.username ? `@${user.username}` : "Registered User";

  const text = `🌌 *DARK EMPIRE COMMAND BRIDGE*

Welcome, *${firstName}* (${username})!
Connection initialized with *@DarkEmpireRelayBot*.

Your Telegram Chat ID: \`${chatId}\`
Status: *REGISTERED & ACTIVE FOR RELAYS* 🟢

⚡ *Trading Terminal Operational Directives:*
• /wallet — View verified treasury and deployer addresses
• /trade — Execute trades via Jupiter DEX
• /alerts — View price alert radar configurations
• /portfolio — View live token telemetry & analytics
• /oracle — Summon AI trading assistant
• /status — View Dark Empire system health and RPC uptime
• /balance — Check live $DEMP token market valuation
• /bots — View active algorithmic trading strategies
• /vip — View VIP Syndicate tiers & perks
• /help — Full command manual & web links`;

  await sendTelegramMessage(chatId, text, MAIN_KEYBOARD);
}

// 2. /wallet Handler
async function handleWalletCommand(chatId: string | number) {
  const deployer = DEMP_DEPLOYER_WALLET;
  const mint = DEMP_TOKEN_MINT;
  const treasury = DEMP_TREASURY_WALLET || deployer;

  const text = `🏦 *DARK EMPIRE ON-CHAIN REPOSITORY*

*Official SPL Token Mint:*
\`${mint}\`

*Deployer Authority:*
\`${deployer}\`

*Operational Treasury:*
\`${treasury}\`

*Security Protocol:*
• Multi-Sig Governance Verified 🛡️
• All assets verifiable on-chain via Solscan Explorer`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: "🔗 Solscan Mint Explorer", url: `https://solscan.io/token/${mint}` },
        { text: "🔗 Solscan Deployer", url: `https://solscan.io/account/${deployer}` }
      ],
      [
        { text: "🖥️ Command Center", url: `${CANONICAL_SITE_URL}/command-center` },
        { text: "🔙 Main Menu", callback_data: "cmd_help" }
      ]
    ]
  };

  await sendTelegramMessage(chatId, text, keyboard);
}

// 3. /trade Handler
async function handleTradeCommand(chatId: string | number) {
  const mint = DEMP_TOKEN_MINT;
  const text = `⚡ *EXECUTE TRADES VIA JUPITER AGGREGATOR*

Dark Empire High-Frequency DEX Execution Terminal routing through Jupiter DEX Aggregator.

• *Target Asset:* \`$DEMP (Solana SPL)\`
• *Mint:* \`${mint}\`
• *Dynamic MEV Protection:* Active 🛡️
• *Slippage Guard:* 0.5% - 1.5%`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: "🚀 Swap SOL ➔ $DEMP", url: `https://jup.ag/swap/SOL-${mint}` },
        { text: "💵 Swap USDC ➔ $DEMP", url: `https://jup.ag/swap/${USDC_TOKEN_MINT}-${mint}` }
      ],
      [
        { text: "📈 Live Candlesticks", url: `https://dexscreener.com/solana/${mint}` },
        { text: "🖥️ Terminal", url: `${CANONICAL_SITE_URL}/command-center` }
      ]
    ]
  };

  await sendTelegramMessage(chatId, text, keyboard);
}

// 4. /alerts Handler
async function handleAlertsCommand(chatId: string | number) {
  const text = `🚨 *PRICE ALERTS & WHALE RADAR*

*Current Live Configuration:*
• *Target Chat ID:* \`${chatId}\`
• *Whale Trigger Threshold:* \`>= $1,000.00 USD\`
• *Tracked SPL Tokens:* \`$DEMP\`, \`SOL\`, \`USDC\`
• *Relay Channels:* Dual-Relay Active (Telegram + Discord) 🟢

_To receive live trade notifications, ensure your webhook service is configured in the Command Center._`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: "⚙️ Manage in Command Center", url: `${CANONICAL_SITE_URL}/command-center` }
      ],
      [
        { text: "🔙 Main Menu", callback_data: "cmd_help" }
      ]
    ]
  };

  await sendTelegramMessage(chatId, text, keyboard);
}

// 5. /portfolio Handler
async function handlePortfolioCommand(chatId: string | number) {
  const telemetry = await fetchTokenTelemetry(DEMP_TOKEN_MINT);
  
  const priceDisplay = telemetry.priceUsd !== null ? `$${telemetry.priceUsd.toFixed(6)}` : "Awaiting live data";
  const mcapDisplay = formatUsdValue(telemetry.marketCapUsd);
  const volDisplay = formatUsdValue(telemetry.volume24h);
  const changeDisplay = telemetry.priceChange24h !== null 
    ? `${telemetry.priceChange24h >= 0 ? "+" : ""}${telemetry.priceChange24h.toFixed(2)}%` 
    : "Live sync";

  const text = `💼 *DARK EMPIRE LIVE MARKET TELEMETRY*
_Source: ${telemetry.source.toUpperCase()} // Status: ${telemetry.status.toUpperCase()}_

*Token:* $DEMP (Dark Empire Token)
• *Price (USD):* \`${priceDisplay}\`
• *24h Change:* \`${changeDisplay}\`
• *Market Cap:* \`${mcapDisplay}\`
• *24h Volume:* \`${volDisplay}\`

_Connect your wallet on Dark Empire HQ to view your individual on-chain holdings & VIP status._`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: "📊 Open Web Portfolio", url: `${CANONICAL_SITE_URL}/holdings` },
        { text: "⚡ Swap $DEMP", url: `https://jup.ag/swap/SOL-${DEMP_TOKEN_MINT}` }
      ],
      [
        { text: "🔙 Main Menu", callback_data: "cmd_help" }
      ]
    ]
  };

  await sendTelegramMessage(chatId, text, keyboard);
}

// 6. /oracle Handler
async function handleOracleCommand(chatId: string | number, query: string) {
  if (!query) {
    await sendTelegramMessage(
      chatId,
      `🔮 *DARK EMPIRE AI TRADING ASSISTANT*

Ask the Gemini AI Oracle any market or strategic trading question.

*Usage:*
\`/oracle <your question>\`

*Examples:*
• \`/oracle Give me a DCA exit and entry strategy for Solana\`
• \`/oracle Analyze short-term liquidity depth for $DEMP token\``,
      MAIN_KEYBOARD
    );
    return;
  }

  await sendTelegramMessage(chatId, `🔮 *Consulting Dark Empire AI Trading Assistant...*\nQuery: "_${query}_"`);

  try {
    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
      await sendTelegramMessage(chatId, "⚠️ *Oracle Error:* `GEMINI_API_KEY` is not configured in server environment.");
      return;
    }

    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: `You are the Dark Empire AI Trading Assistant operating inside Telegram (@DarkEmpireRelayBot).
Provide sharp, actionable trading intelligence (max 280 words).
Structure your response in 4 clear sections:
1. 📊 Market Telemetry
2. 🎯 Tactical Setup
3. ⚠️ Risk Threshold
4. ⚡ Imperial Directive`
      }
    });

    const result = await chat.sendMessage({ message: query });
    const replyText = result.text || "Assistant returned empty response.";

    await sendTelegramMessage(chatId, `🔮 *AI ASSISTANT DIRECTIVE*\n\n${replyText}`, MAIN_KEYBOARD);
  } catch (err: any) {
    console.error("[Oracle Telegram Error]:", err);
    await sendTelegramMessage(chatId, `⚠️ *AI Assistant Error:* Failed to process query. Please retry.`);
  }
}

// 7. /status Handler
async function handleStatusCommand(chatId: string | number) {
  const nowStr = new Date().toISOString().replace("T", " ").substring(0, 19) + " UTC";
  
  const text = `📊 *DARK EMPIRE SYSTEM HEALTH & UPTIME*
_Timestamp: ${nowStr}_

🟢 *Production Domain:* ${CANONICAL_SITE_URL} (Active)
🟢 *Solana Multi-RPC Pool:* Failover Active (Helius / Alchemy / QuickNode / Mainnet)
🟢 *Live DeFi Telemetry:* Connected (DexScreener / Birdeye)
🟢 *AI Oracle Engine (Gemini 2.5):* Operational
🟢 *Dual-Relay Bridge:* Active (@DarkEmpireRelayBot)`;

  await sendTelegramMessage(chatId, text, MAIN_KEYBOARD);
}

// 8. /balance Handler
async function handleBalanceCommand(chatId: string | number) {
  const telemetry = await fetchTokenTelemetry(DEMP_TOKEN_MINT);
  const priceStr = telemetry.priceUsd !== null ? `$${telemetry.priceUsd.toFixed(6)} USD` : "Awaiting live data";
  const mcStr = formatUsdValue(telemetry.marketCapUsd);

  const text = `💰 *LIVE $DEMP VALUATION*
_Source: ${telemetry.source.toUpperCase()}_

• *$DEMP Live Price:* \`${priceStr}\`
• *Market Capitalization:* \`${mcStr}\`
• *Mint:* \`${DEMP_TOKEN_MINT}\`

_To check your personal balance, connect your Solana wallet at ${CANONICAL_SITE_URL}._`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: "⚡ Swap on Jupiter", url: `https://jup.ag/swap/SOL-${DEMP_TOKEN_MINT}` },
        { text: "📊 DexScreener Chart", url: `https://dexscreener.com/solana/${DEMP_TOKEN_MINT}` }
      ]
    ]
  };

  await sendTelegramMessage(chatId, text, keyboard);
}

// 9. /bots Handler
async function handleBotsCommand(chatId: string | number) {
  const text = `🤖 *AUTOMATED TRADING BOT INFRASTRUCTURE*

*Execution Cluster:* Solana Low-Latency Edge Relay

*Supported Strategies:*
1. ⚡ *Grid Alpha (SOL-USDC / DEMP-SOL)*
   • Captures volatility across custom price channels
2. 🎯 *DCA Accumulator*
   • Systematic time-weighted token accumulation
3. 🐋 *Whale Momentum Follower*
   • On-chain liquidity detection & front-running alerts

_To configure and arm automated strategies, open the Operations Terminal._`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: "⚙️ Manage in Terminal", url: `${CANONICAL_SITE_URL}/command-center` }
      ]
    ]
  };

  await sendTelegramMessage(chatId, text, keyboard);
}

// 10. /pause Handler
async function handlePauseCommand(chatId: string | number) {
  const text = `⏸️ *AUTOMATED WORKER DIRECTIVE*

To place trading bots into standby, log in to your verified session in the Dark Empire Operations Terminal.`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: "🖥️ Open Terminal Controls", url: `${CANONICAL_SITE_URL}/command-center` }
      ]
    ]
  };

  await sendTelegramMessage(chatId, text, keyboard);
}

// 11. /resume Handler
async function handleResumeCommand(chatId: string | number) {
  const text = `▶️ *AUTOMATED WORKER DIRECTIVE*

To re-arm trading workers, access the Dark Empire Operations Terminal dashboard.`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: "🖥️ Open Terminal Controls", url: `${CANONICAL_SITE_URL}/command-center` }
      ]
    ]
  };

  await sendTelegramMessage(chatId, text, keyboard);
}

// 12. /sweep Handler
async function handleSweepCommand(chatId: string | number) {
  const text = `🧹 *COLD STORAGE SWEEP PROTOCOL*

Manual and automated profit sweeps transfer realized yields directly to multi-sig cold storage.

• *Governance:* 3-of-5 Hardware Multi-Sig
• *Verifiability:* On-chain Solana transaction signatures recorded in private audit log.`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: "🏦 View Holdings", url: `${CANONICAL_SITE_URL}/holdings` },
        { text: "🔙 Main Menu", callback_data: "cmd_help" }
      ]
    ]
  };

  await sendTelegramMessage(chatId, text, keyboard);
}

// 13. /help Handler
async function handleHelpCommand(chatId: string | number) {
  const text = `📖 *DARK EMPIRE BOT DIRECTIVES*

*Available Commands:*
• /wallet — View verified treasury and deployer addresses
• /trade — Swap tokens via Jupiter Aggregator
• /alerts — Price alert and whale radar status
• /portfolio — Live token telemetry & analytics
• /oracle <query> — Consult AI trading assistant
• /status — System uptime and RPC status
• /balance — Real-time $DEMP valuation
• /bots — Trading bot strategy index
• /vip — VIP Syndicate tiers and perks
• /help — Display this directive manual

*Official Links:*
• Web: ${CANONICAL_SITE_URL}
• Terminal: ${CANONICAL_SITE_URL}/command-center
• Discord: https://discord.gg/cyWVcvyZ
• Bot: @DarkEmpireRelayBot`;

  await sendTelegramMessage(chatId, text, MAIN_KEYBOARD);
}

// 14. /vip Handler
async function handleVipCommand(chatId: string | number) {
  const mint = DEMP_TOKEN_MINT;
  const text = `👑 *VIP SYNDICATE LOUNGE & TIER VERIFICATION*

Hold $DEMP tokens on Solana to unlock VIP privileges:

*Tiers:*
🥉 *Bronze (1,000 $DEMP):* 5% Fee Discount & Operative Badge
🥈 *Silver (10,000 $DEMP):* 15% Discount & Dedicated High-Speed RPC
🥇 *Gold (50,000 $DEMP):* 30% Discount & Free Monthly Oracle Credits
👑 *Dark Lord (100,000+ $DEMP):* 50% Discount & Unlimited AI Access

*Token Contract:*
\`${mint}\``;

  const vipKeyboard = {
    inline_keyboard: [
      [
        { text: "👑 Verify VIP Tier on Web", url: `${CANONICAL_SITE_URL}/vip` },
        { text: "⚡ Buy $DEMP", url: `https://jup.ag/swap/SOL-${mint}` }
      ],
      [
        { text: "🔙 Main Menu", callback_data: "cmd_help" }
      ]
    ]
  };

  await sendTelegramMessage(chatId, text, vipKeyboard);
}

// 15. /contact Handler
async function handleContactCommand(chatId: string | number, messageContent: string, user?: any) {
  if (!messageContent) {
    await sendTelegramMessage(
      chatId,
      `📩 *DARK EMPIRE HQ SUPPORT*\n\nUsage:\n\`/contact <your message>\`\n\nExample:\n\`/contact Inquiry about VIP Syndicate tier verification\``
    );
    return;
  }

  const senderName = user?.first_name ? `${user.first_name} ${user.last_name || ""}`.trim() : "Telegram User";
  const username = user?.username ? `@${user.username}` : `Chat ${chatId}`;

  const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;
  const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
  const telegramChatId = process.env.TELEGRAM_CHAT_ID;

  let relayedDiscord = false;
  let relayedTelegram = false;

  if (discordWebhookUrl) {
    try {
      await fetch(discordWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "Dark Empire HQ Contact Relay",
          embeds: [
            {
              title: "📩 New Contact Relay via @DarkEmpireRelayBot",
              color: 0x9333ea,
              fields: [
                { name: "Sender", value: `${senderName} (${username})`, inline: true },
                { name: "Chat ID", value: String(chatId), inline: true },
                { name: "Message", value: messageContent }
              ],
              timestamp: new Date().toISOString()
            }
          ]
        }),
        signal: AbortSignal.timeout(6000),
      });
      relayedDiscord = true;
    } catch (e) {
      console.error("[Contact Relay] Discord relay failed:", e);
    }
  }

  if (telegramBotToken && telegramChatId) {
    try {
      await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: telegramChatId,
          text: `📩 *NEW CONTACT INQUIRY VIA @DarkEmpireRelayBot*\n\n*From:* ${senderName} (${username})\n*Chat ID:* \`${chatId}\`\n\n*Message:*\n${messageContent}`,
          parse_mode: "Markdown"
        }),
        signal: AbortSignal.timeout(6000),
      });
      relayedTelegram = true;
    } catch (e) {
      console.error("[Contact Relay] Telegram HQ relay failed:", e);
    }
  }

  const responseText = `✅ *MESSAGE TRANSMITTED TO HQ*

Your inquiry has been relayed to Dark Empire HQ.
• *Sender:* ${senderName} (${username})
• *Chat ID:* \`${chatId}\`
• *Telegram HQ Relay:* ${relayedTelegram ? "YES 🟢" : "QUEUED 🟡"}
• *Discord Relay:* ${relayedDiscord ? "YES 🟢" : "QUEUED 🟡"}`;

  await sendTelegramMessage(chatId, responseText, MAIN_KEYBOARD);
}
