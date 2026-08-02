import { NextResponse } from 'next/server';

interface TradePayload {
  amountUsd?: number;
  usdValue?: number;
  tradeSizeUsd?: number;
  amount_usd?: number;
  valueUsd?: number;
  type?: string;
  side?: string;
  operationType?: string;
  tokenSymbol?: string;
  symbol?: string;
  token?: string;
  tokenAmount?: number | string;
  amount?: number | string;
  trader?: string;
  wallet?: string;
  traderWallet?: string;
  account?: string;
  buyer?: string;
  seller?: string;
  signature?: string;
  txHash?: string;
  txId?: string;
  txSignature?: string;
  timestamp?: string | number;
  priceUsd?: number;
  price?: number;
  chat_id?: string;
}

export async function POST(req: Request) {
  try {
    // 1. Security Authorization Validation
    const relaySecretKey = process.env.RELAY_SECRET_KEY;
    const authHeader = req.headers.get('authorization') || req.headers.get('x-relay-secret-key') || req.headers.get('x-secret-key');

    if (relaySecretKey) {
      const isValidAuth = authHeader === relaySecretKey || authHeader === `Bearer ${relaySecretKey}`;
      if (!isValidAuth) {
        return NextResponse.json(
          { error: 'Unauthorized: Invalid or missing authorization secret' },
          { status: 401 }
        );
      }
    }

    // 2. Parse Incoming Payload
    const body = await req.json().catch(() => ({}));
    const rawTrade: TradePayload = body.trade || body.payload || (Array.isArray(body) ? body[0] : body) || {};

    const rawAmountUsd =
      rawTrade.amountUsd ??
      rawTrade.usdValue ??
      rawTrade.tradeSizeUsd ??
      rawTrade.amount_usd ??
      rawTrade.valueUsd ??
      (rawTrade.amount && rawTrade.price ? Number(rawTrade.amount) * Number(rawTrade.price) : undefined) ??
      (rawTrade.tokenAmount && rawTrade.priceUsd ? Number(rawTrade.tokenAmount) * Number(rawTrade.priceUsd) : undefined);

    const amountUsd = Number(rawAmountUsd || 0);

    // 3. Webhook Threshold Check (> $1,000 USD)
    if (amountUsd <= 1000) {
      return NextResponse.json(
        {
          success: true,
          alerted: false,
          reason: 'Trade value is $1,000 USD or below. Whale alert threshold not met.',
          amountUsd,
        },
        { status: 200 }
      );
    }

    // 4. Format Trade Data for WHALE ALERT Payload
    const type = (rawTrade.type || rawTrade.side || rawTrade.operationType || 'SWAP').toUpperCase();
    const tokenSymbol = rawTrade.tokenSymbol || rawTrade.symbol || rawTrade.token || '$DEMP';
    const tokenAmount = rawTrade.tokenAmount ?? rawTrade.amount ?? 'N/A';
    const trader = rawTrade.trader || rawTrade.wallet || rawTrade.traderWallet || rawTrade.account || rawTrade.buyer || rawTrade.seller || 'Unknown';
    const signature = rawTrade.signature || rawTrade.txHash || rawTrade.txId || rawTrade.txSignature || '';
    const timestamp = rawTrade.timestamp ? new Date(rawTrade.timestamp).toISOString() : new Date().toISOString();

    const formattedUsd = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(amountUsd);

    const formattedTokenAmount =
      typeof tokenAmount === 'number'
        ? new Intl.NumberFormat('en-US', { maximumFractionDigits: 4 }).format(tokenAmount)
        : String(tokenAmount);

    const solscanUrl = signature ? `https://solscan.io/tx/${signature}` : null;

    // Discord Payload Formatting
    const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;
    const discordPayload = {
      username: 'Dark Empire Whale Bot',
      avatar_url: 'https://darkempirelords.com/assets/demp-logo.png',
      embeds: [
        {
          title: '🚨 WHALE ALERT DETECTED 🚨',
          description: `A high-value transaction of **${formattedUsd}** was executed on the Dark Empire Protocol!`,
          color: 0xa855f7, // Neon Purple
          fields: [
            { name: '💵 Value (USD)', value: `**${formattedUsd}**`, inline: true },
            { name: '🔄 Type', value: `**${type}**`, inline: true },
            { name: '🪙 Token', value: `**${tokenSymbol}**`, inline: true },
            { name: '📊 Amount', value: formattedTokenAmount, inline: true },
            { name: '👤 Trader', value: `\`${trader}\``, inline: true },
            ...(solscanUrl ? [{ name: '🔗 Solscan', value: `[View Transaction](${solscanUrl})`, inline: false }] : []),
          ],
          footer: {
            text: 'Dark Empire Dual-Relay Webhook Architecture',
          },
          timestamp,
        },
      ],
    };

    // Telegram Payload Formatting
    const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
    const telegramChatId = process.env.TELEGRAM_CHAT_ID || rawTrade.chat_id || body.chat_id || '@DarkEmpireHQ';

    const telegramText = [
      `🚨 *WHALE ALERT DETECTED* 🚨`,
      ``,
      `💰 *Value:* ${formattedUsd}`,
      `🔄 *Type:* ${type}`,
      `🪙 *Token:* ${tokenSymbol}`,
      `📊 *Amount:* ${formattedTokenAmount}`,
      `👤 *Trader:* \`${trader}\``,
      solscanUrl ? `🔗 [View Solscan Transaction](${solscanUrl})` : null,
      ``,
      `⚡ _Powered by Dark Empire Dual-Relay Infrastructure_`,
    ]
      .filter(Boolean)
      .join('\n');

    // 5. Broadcast Handlers (Discord & Telegram)
    const relayResults = await Promise.allSettled([
      // Discord Relay Handler
      (async () => {
        if (!discordWebhookUrl) {
          return { relay: 'discord', success: false, error: 'DISCORD_WEBHOOK_URL is not configured' };
        }
        const res = await fetch(discordWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(discordPayload),
        });
        if (!res.ok) {
          const errText = await res.text();
          return { relay: 'discord', success: false, error: `Discord HTTP ${res.status}: ${errText}` };
        }
        return { relay: 'discord', success: true };
      })(),

      // Telegram Relay Handler
      (async () => {
        if (!telegramBotToken) {
          return { relay: 'telegram', success: false, error: 'TELEGRAM_BOT_TOKEN is not configured' };
        }
        const telegramEndpoint = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;
        const res = await fetch(telegramEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: telegramChatId,
            text: telegramText,
            parse_mode: 'Markdown',
            disable_web_page_preview: false,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.ok) {
          return {
            relay: 'telegram',
            success: false,
            error: data?.description || `Telegram HTTP ${res.status}`,
          };
        }
        return { relay: 'telegram', success: true };
      })(),
    ]);

    const discordStatus =
      relayResults[0].status === 'fulfilled'
        ? relayResults[0].value
        : { relay: 'discord', success: false, error: String(relayResults[0].reason) };

    const telegramStatus =
      relayResults[1].status === 'fulfilled'
        ? relayResults[1].value
        : { relay: 'telegram', success: false, error: String(relayResults[1].reason) };

    return NextResponse.json(
      {
        success: true,
        alerted: true,
        whaleAlert: {
          amountUsd,
          formattedUsd,
          type,
          tokenSymbol,
          tokenAmount: formattedTokenAmount,
          trader,
          signature,
          timestamp,
        },
        relays: {
          discord: discordStatus,
          telegram: telegramStatus,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[Trade Alerts Webhook Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error processing trade alert webhook' },
      { status: 500 }
    );
  }
}
