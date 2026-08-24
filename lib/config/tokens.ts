/**
 * CANONICAL TOKEN & CONTRACT CONFIGURATION
 * Single source of truth for all multi-chain mints, contracts, and verified wallet addresses.
 */

// --- SOLANA NETWORK ($DEMP) ---
/** The authoritative SPL Token Mint Address for $DEMP on Solana Mainnet-Beta */
export const DEMP_TOKEN_MINT = "8yGrrj6d9p4WNPRkunVo1NwkRSX3VTo43ZS39xu7jupx" as const;

/** The official Deployer / Creator authority wallet for $DEMP */
export const DEMP_DEPLOYER_WALLET = "Gy37g7iDGQiom6wwVcyHKVuZPZzmVTgwa3wJZQTRqqTH" as const;

/** The verified primary DEX Liquidity Pool address on Solana (GeckoTerminal / Raydium) */
export const DEMP_LIQUIDITY_POOL = "6Higx2gdaqYaukrkNomp1pVJX8uQNHAhavLE7qFnHjYD" as const;
export const GECKOTERMINAL_POOL_ADDRESS = DEMP_LIQUIDITY_POOL;

/** Operational Treasury Wallet (derived from env if set, otherwise undefined - never fabricate) */
export const DEMP_TREASURY_WALLET = process.env.NEXT_PUBLIC_TREASURY_WALLET || undefined;

/** Cold Storage Multi-Sig Vault (derived from env if set, otherwise undefined - never fabricate) */
export const DEMP_COLD_STORAGE_WALLET = process.env.NEXT_PUBLIC_COLD_STORAGE_WALLET || undefined;

/** Total Fixed / Circulating Supply metrics */
export const DEMP_TOTAL_SUPPLY = 1_000_000_000;
export const DEMP_DECIMALS = 6;

/** Standard Ecosystem Token Mints */
export const USDC_TOKEN_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" as const;
export const SOL_TOKEN_MINT = "So11111111111111111111111111111111111111112" as const;
export const BONK_TOKEN_MINT = "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263" as const;
export const WEN_TOKEN_MINT = "WENWENvqqNya429ubCdR81ZmD69brwQaaBYY6p3LCdR" as const;
export const JUP_TOKEN_MINT = "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbAbdE2kPJQ51" as const;
export const RAY_TOKEN_MINT = "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R" as const;
export const PYTH_TOKEN_MINT = "HZ1JovNiDcBaatKvikEiB1igbNcnQKzkqqbeevFaoBpE" as const;


// --- ETHEREUM SEPOLIA (DARKCOIN $DARK & DAO COUNCIL) ---
export const EVM_DARKCOIN_CONFIG = {
  chainId: 11155111,
  networkName: "Ethereum Sepolia Testnet",
  tokenName: "DarkCoin",
  symbol: "DARK",
  totalSupply: "666,666,666 DARK",
  explorerBaseUrl: "https://sepolia.etherscan.io",
  tokentraceDappUrl: "https://token-trace-lemon.vercel.app",
  tradingTerminalUrl: "https://darkempiretradingterminal-dark-empire-lords.vercel.app",
  contracts: {
    darkToken: "0x13DF2f0D3fFc61461389bc7652F15B65f3B85E40",
    darkCouncil: "0x1e3a8aa50d81541aD12FB1827050425474Da47fC",
    timelock: "0x0eC332E331113defC8f85eCE3F18Aa0219d879Bc",
    darkVotesWrapper: "0xfC7df0e4e2386Af4cA9c7354A74433e6760d6112",
    darkVotes: "0x72B22F304114b437D1a931D698903B83b39Cba6c",
    darkStaking: "0x0958d2096be456133E218bdd7770578625e8fDe0",
  },
} as const;
