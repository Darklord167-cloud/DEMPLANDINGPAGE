/**
 * Ethereum & EVM Multi-Chain Contract Configuration
 */

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
  }
} as const;
