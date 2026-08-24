/**
 * CLIENT-SAFE & PUBLIC CONFIGURATION
 * Safe to import in both Client Components and Server Components.
 */

export * from "./tokens";
export * from "./urls";

export const SUPPORTED_NETWORKS = [
  {
    id: "solana-mainnet",
    name: "Solana Mainnet-Beta",
    currency: "SOL",
    explorer: "https://solscan.io",
    isPrimary: true,
  },
  {
    id: "ethereum-sepolia",
    name: "Ethereum Sepolia",
    currency: "ETH",
    explorer: "https://sepolia.etherscan.io",
    isPrimary: false,
  },
] as const;

/** Verified reliable Solana Mainnet RPC Failover Endpoints */
export const SOLANA_RPC_ENDPOINTS = [
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com",
  "https://solana-mainnet.rpc.extrnode.com",
  "https://rpc.ankr.com/solana",
] as const;
