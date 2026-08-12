import { NextResponse } from 'next/server';

const DEMP_TOKEN_MINT = '8yGrrj6d9p4WNPRkunVo1NwkRSX3VTo43ZS39xu7jupx';

interface HeliusTokenTransfer {
  userAccount?: string;
  tokenAccount?: string;
  rawTokenAmount?: {
    tokenAmount?: string | number;
    decimals?: number;
  };
  tokenAmount?: number | string;
  mint?: string;
  symbol?: string;
}

interface HeliusSwapEvent {
  nativeInput?: any;
  nativeOutput?: any;
  tokenInputs?: HeliusTokenTransfer[];
  tokenOutputs?: HeliusTokenTransfer[];
  amountUsd?: number;
  usdValue?: number;
  tradeSizeUsd?: number;
  tokenAmount?: number | string;
}

interface TradePayload {
  description?: string;
  type?: string;
  source?: string;
  feePayer?: string;
  signature?: string;
  txSignature?: string;
  txHash?: string;
  txId?: string;
  timestamp?: string | number;
  events?: {
    swap?: HeliusSwapEvent;
    SWAP?: HeliusSwapEvent;
  };
  swap?: HeliusSwapEvent;
  amountUsd?: number;
  usdValue?: number;
  tradeSizeUsd?: number;
  amount_usd?: number;
  valueUsd?: number;
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

    // 2. Parse Incoming Payload (Supports Helius Enhanced Webhook array format & direct object payloads)
    const body = await req.json().catch(() => ({}));
    let rawTrade: TradePayload = {};

    if (Array.isArray(body)) {
      // Helius sends an array of EnhancedTransaction objects.
      // Extract the first transaction where type === "SWAP"
      const swapTx = body.find(
        (tx: any) =>
          tx &&
          typeof tx === 'object' &&
          ((tx.type && String(tx.type).toUpperCase() === 'SWAP') || tx.events?.swap || tx.events?.SWAP)
      );
      rawTrade = swapTx || body[0] || {};
    } else if (body && typeof body === 'object') {
      if (Array.isArray(body.data)) {
        const swapTx = body.data.find(
          (tx: any) =>
            tx &&
            typeof tx === 'object' &&
            ((tx.type && String(tx.type).toUpperCase() === 'SWAP') || tx.events?.swap || tx.events?.SWAP)
        );
        rawTrade = swapTx || body.data[0] || {};
      } else {
        rawTrade = body.trade || body.payload || body;
      }
    }

    // 3. Extract Helius events.swap if present
    const swapEvent = rawTrade.events?.swap || rawTrade.events?.SWAP || rawTrade.swap;

    let derivedType: string | undefined;
    let derivedTokenAmount: number | string | undefined;
    let derivedAmountUsd: number | undefined;

    if (swapEvent) {
      // Determine BUY vs SELL based on $DEMP direction in events.swap:
      // If $DEMP is in tokenOutputs (going TO the user), it's a BUY.
      // If $DEMP is in tokenInputs (going FROM the user to the pool), it's a SELL.
      const dempOutput = swapEvent.tokenOutputs?.find(
        (t) => t.mint === DEMP_TOKEN_MINT || t.symbol === '$DEMP' || t.symbol === 'DEMP'
      );
      const dempInput = swapEvent.tokenInputs?.find(
        (t) => t.mint === DEMP_TOKEN_MINT || t.symbol === '$DEMP' || t.symbol === 'DEMP'
      );

      if (dempOutput) {
        derivedType = 'BUY';
        if (dempOutput.tokenAmount !== undefined) {
          derivedTokenAmount = Number(dempOutput.tokenAmount);
        } else if (dempOutput.rawTokenAmount?.tokenAmount !== undefined) {
          const decimals = dempOutput.rawTokenAmount.decimals ?? 6;
          derivedTokenAmount = Number(dempOutput.rawTokenAmount.tokenAmount) / Math.pow(10, decimals);
        }
      } else if (dempInput) {
        derivedType = 'SELL';
        if (dempInput.tokenAmount !== undefined) {
          derivedTokenAmount = Number(dempInput.tokenAmount);
        } else if (dempInput.rawTokenAmount?.tokenAmount !== undefined) {
          const decimals = dempInput.rawTokenAmount.decimals ?? 6;
          derivedTokenAmount = Number(dempInput.rawTokenAmount.tokenAmount) / Math.pow(10, decimals);
        }
      }

      derivedAmountUsd = swapEvent.amountUsd ?? swapEvent.usdValue ?? swapEvent.tradeSizeUsd;
      if (derivedTokenAmount === undefined && swapEvent.tokenAmount !== undefined) {
        derivedTokenAmount = swapEvent.tokenAmount;
      }
    }

    // 4. Calculate Final Trade Telemetry
    const rawAmountUsd =
      derivedAmountUsd ??
      rawTrade.amountUsd ??
      rawTrade.usdValue ??
      rawTrade.tradeSizeUsd ??
      rawTrade.amount_usd ??
      rawTrade.valueUsd ??
      (rawTrade.amount && rawTrade.price ? Number(rawTrade.amount) * Number(rawTrade.price) : undefined) ??
      (rawTrade.tokenAmount && rawTrade.priceUsd ? Number(rawTrade.tokenAmount) * Number(rawTrade.priceUsd) : undefined);

    const amountUsd = Number(rawAmountUsd || 0);

    // 5. Webhook Threshold Check (> $1,000 USD)
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

    // Format Trade Data for WHALE ALERT Payload
    const type = (
      derivedType ||
      rawTrade.operationType ||
      rawTrade.type ||
      rawTrade.side ||
      'SWAP'
    ).toUpperCase();

    const tokenSymbol = rawTrade.tokenSymbol || rawTrade.symbol || rawTrade.token || '$DEMP';
    const tokenAmount = derivedTokenAmount ?? rawTrade.tokenAmount ?? rawTrade.amount ?? 'N/A';
    const trader =
      rawTrade.feePayer ||
      rawTrade.traderWallet ||
      rawTrade.trader ||
      rawTrade.wallet ||
      rawTrade.account ||
      rawTrade.buyer ||
      rawTrade.seller ||
      'Unknown';

    const signature =
      rawTrade.signature ||
      rawTrade.txSignature ||
      rawTrade.txHash ||
      rawTrade.txId ||
      '';

    let timestamp: string;
    if (typeof rawTrade.timestamp === 'number') {
      const ms = rawTrade.timestamp < 1e11 ? rawTrade.timestamp * 1000 : rawTrade.timestamp;
      timestamp = new Date(ms).toISOString();
    } else if (rawTrade.timestamp) {
      timestamp = new Date(rawTrade.timestamp).toISOString();
    } else {
      timestamp = new Date().toISOString();
    }

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
    const telegramChatId = process.env.TELEGRAM_CHAT_ID || rawTrade.chat_id || body.chat_id || '@DarkEmpireGemeniBot';

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

    // 6. Broadcast Handlers (Discord & Telegram)
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

