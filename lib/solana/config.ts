/**
 * Solana Web3 & Network Configuration
 */

export const DEMP_TOKEN_MINT = "8yGrrj6d9p4WNPRkunVo1NwkRSX3VTo43ZS39xu7jupx";
export const DEMP_DEPLOYER_WALLET = "Gy37g7iDGQiom6wwVcyHKVuZPZzmVTgwa3wJZQTRqqTH";
export const DEMP_SUPPLY_ENDPOINT = "https://circulating-supply-endpoint.vercel.app/api/supply";
export const USDC_TOKEN_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
export const SOL_TOKEN_MINT = "So11111111111111111111111111111111111111112";

// Primary RPC Endpoints
export const SOLANA_RPC_ENDPOINTS = [
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com",
  "https://solana-mainnet.rpc.extrnode.com",
  "https://rpc.ankr.com/solana",
  "https://solana-api.projectserum.com",
];

// GeckoTerminal Pool Address for DEMP (Solana)
export const GECKOTERMINAL_POOL_ADDRESS = "6Higx2gdaqYaukrkNomp1pVJX8uQNHAhavLE7qFnHjYD";

export const JUPITER_SWAP_BASE_URL = "https://jup.ag/swap";
