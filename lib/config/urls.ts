import { DEMP_TOKEN_MINT, DEMP_LIQUIDITY_POOL, USDC_TOKEN_MINT } from "./tokens";

/**
 * CANONICAL EXTERNAL & INTERNAL URL DEFINITIONS
 */
export const CANONICAL_SITE_URL = "https://darkempirelords.com" as const;

export const DEMP_SUPPLY_ENDPOINT =
  "https://circulating-supply-endpoint.vercel.app/api/supply" as const;

// --- DEX & EXPLORER ROUTING ---
export const JUPITER_SWAP_BASE_URL = "https://jup.ag/swap" as const;
export const JUPITER_SWAP_SOL_DEMP_URL = `https://jup.ag/swap/SOL-${DEMP_TOKEN_MINT}` as const;
export const JUPITER_SWAP_USDC_DEMP_URL = `https://jup.ag/swap/${USDC_TOKEN_MINT}-${DEMP_TOKEN_MINT}` as const;

export const DEXSCREENER_TOKEN_URL = `https://dexscreener.com/solana/${DEMP_TOKEN_MINT}` as const;
export const DEXSCREENER_POOL_URL = `https://dexscreener.com/solana/${DEMP_LIQUIDITY_POOL}` as const;

export const BIRDEYE_TOKEN_URL = `https://birdeye.so/token/${DEMP_TOKEN_MINT}?chain=solana` as const;

export const SOLSCAN_TOKEN_URL = `https://solscan.io/token/${DEMP_TOKEN_MINT}` as const;
export const SOLSCAN_TX_BASE_URL = "https://solscan.io/tx" as const;
export const SOLSCAN_ACCOUNT_BASE_URL = "https://solscan.io/account" as const;

export const GECKOTERMINAL_POOL_URL = `https://www.geckoterminal.com/solana/pools/${DEMP_LIQUIDITY_POOL}` as const;
export const GECKOTERMINAL_EMBED_URL = `https://www.geckoterminal.com/solana/pools/${DEMP_LIQUIDITY_POOL}?embed=1&info=1&swaps=1&grayscale=0&light_chart=0&chart_type=price&resolution=15m` as const;
export const DEXSCREENER_EMBED_URL = `https://dexscreener.com/solana/${DEMP_LIQUIDITY_POOL}?embed=1&theme=dark` as const;

// --- COMMUNITY & ECOSYSTEM ---
export const DISCORD_INVITE_URL = "https://discord.gg/cyWVcvyZ" as const;
export const TELEGRAM_COMMUNITY_BOT = "@DarkEmpireRelayBot" as const;
