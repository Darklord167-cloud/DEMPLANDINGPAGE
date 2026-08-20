import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { createSignerFromKeypair, signerIdentity, publicKey, percentAmount } from "@metaplex-foundation/umi";
import { createV1, TokenStandard } from "@metaplex-foundation/mpl-token-metadata";

import { 
  Connection, 
  Keypair, 
  PublicKey, 
  LAMPORTS_PER_SOL, 
  clusterApiUrl 
} from "@solana/web3.js";
import { 
  createMint, 
  getOrCreateAssociatedTokenAccount, 
  mintTo, 
  setAuthority, 
  AuthorityType 
} from "@solana/spl-token";
import bs58 from "bs58";
import * as fs from "fs";
import * as path from "path";

export interface TokenConfig {
  name: string;
  symbol: string;
  decimals: number;
  supply: number;
  uri: string;
  revokeMintAuthority: boolean;
  revokeFreezeAuthority: boolean;
  network: "devnet" | "mainnet-beta";
}

export async function createSolanaToken(config: TokenConfig, privateKeyString?: string) {
  console.log("=================================================");
  console.log("⚡ SOLANA SPL TOKEN CREATION ENGINE ⚡");
  console.log("=================================================");
  console.log(`• Network:            ${config.network}`);
  console.log(`• Token Name:         ${config.name}`);
  console.log(`• Token Symbol:       ${config.symbol}`);
  console.log(`• Decimals:           ${config.decimals}`);
  console.log(`• Initial Supply:     ${config.supply.toLocaleString()} ${config.symbol}`);
  console.log(`• Metadata JSON URI:  ${config.uri}`);
  console.log(`• Revoke Mint Auth:   ${config.revokeMintAuthority}`);
  console.log(`• Revoke Freeze Auth: ${config.revokeFreezeAuthority}`);
  console.log("-------------------------------------------------");

  // 1. Load or generate Deployer Wallet Keypair
  let deployerKeypair: Keypair;
  if (privateKeyString) {
    if (privateKeyString.startsWith("[")) {
      deployerKeypair = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(privateKeyString)));
    } else {
      deployerKeypair = Keypair.fromSecretKey(bs58.decode(privateKeyString.trim()));
    }
  } else if (process.env.SOLANA_DEPLOYER_PRIVATE_KEY) {
    const raw = process.env.SOLANA_DEPLOYER_PRIVATE_KEY.trim();
    if (raw.startsWith("[")) {
      deployerKeypair = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(raw)));
    } else {
      deployerKeypair = Keypair.fromSecretKey(bs58.decode(raw));
    }
  } else {
    // Generate temporary new keypair
    deployerKeypair = Keypair.generate();
    console.log("⚠️ No deployer private key supplied. Generated a new keypair:");
    console.log(`   Address: ${deployerKeypair.publicKey.toBase58()}`);
    console.log(`   Private Key: ${bs58.encode(deployerKeypair.secretKey)}`);
  }

  const endpoint = config.network === "devnet" 
    ? (process.env.SOLANA_DEVNET_RPC || clusterApiUrl("devnet"))
    : (process.env.NEXT_PUBLIC_SOLANA_RPC_URL || process.env.HELIUS_RPC_URL || "https://api.mainnet-beta.solana.com");

  const connection = new Connection(endpoint, "confirmed");
  console.log(`📡 Connecting to RPC: ${endpoint}`);

  // 2. Check Wallet SOL Balance
  const balanceLamports = await connection.getBalance(deployerKeypair.publicKey);
  const balanceSol = balanceLamports / LAMPORTS_PER_SOL;
  console.log(`💳 Deployer Wallet: ${deployerKeypair.publicKey.toBase58()}`);
  console.log(`💰 Deployer Balance: ${balanceSol.toFixed(4)} SOL`);

  if (balanceSol < 0.05) {
    if (config.network === "devnet") {
      console.log("\n🚰 Requesting Devnet Airdrop (1 SOL)...");
      try {
        const sig = await connection.requestAirdrop(deployerKeypair.publicKey, 1 * LAMPORTS_PER_SOL);
        const latestBlockhash = await connection.getLatestBlockhash();
        await connection.confirmTransaction({
          signature: sig,
          blockhash: latestBlockhash.blockhash,
          lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        });
        console.log("✅ Airdrop confirmed! Balance replenished.");
      } catch (err: any) {
        console.warn("⚠️ Devnet airdrop rate limited or failed:", err.message);
      }
      
      const newBalance = await connection.getBalance(deployerKeypair.publicKey);
      if (newBalance === 0) {
        console.error("\n❌ Deployer wallet has 0 SOL. Please request devnet SOL from https://faucet.solana.com or fund this address:");
        console.error(`👉 ${deployerKeypair.publicKey.toBase58()}\n`);
        process.exit(1);
      }
    } else {
      console.error("\n❌ Insufficient SOL balance for rent & transaction fees on Mainnet.");
      console.error("Please fund your deployer wallet with at least 0.05 - 0.1 SOL and retry.");
      process.exit(1);
    }
  }

  // 3. Create Mint Account
  console.log("\n🔨 1/5 Creating SPL Token Mint...");
  const mintKeypair = Keypair.generate();
  const mintPublicKey = await createMint(
    connection,
    deployerKeypair,
    deployerKeypair.publicKey, // mintAuthority
    config.revokeFreezeAuthority ? null : deployerKeypair.publicKey, // freezeAuthority
    config.decimals,
    mintKeypair
  );

  console.log(`✅ Mint Created: ${mintPublicKey.toBase58()}`);

  // 4. Create Associated Token Account (ATA) for Deployer
  console.log("\n📦 2/5 Creating Associated Token Account (ATA)...");
  const deployerAta = await getOrCreateAssociatedTokenAccount(
    connection,
    deployerKeypair,
    mintPublicKey,
    deployerKeypair.publicKey
  );
  console.log(`✅ Deployer ATA: ${deployerAta.address.toBase58()}`);

  // 5. Mint Initial Supply to ATA
  console.log("\n🪙 3/5 Minting Initial Supply...");
  const rawSupply = BigInt(config.supply) * BigInt(10 ** config.decimals);
  const mintSig = await mintTo(
    connection,
    deployerKeypair,
    mintPublicKey,
    deployerAta.address,
    deployerKeypair,
    rawSupply
  );
  console.log(`✅ Minted ${config.supply.toLocaleString()} ${config.symbol} (Tx: ${mintSig})`);

  // 6. Attach Metaplex On-Chain Metadata V3
  console.log("\n🏷️ 4/5 Attaching Metaplex Metadata V3...");
  const umi = createUmi(endpoint);
  const umiKeypair = umi.eddsa.createKeypairFromSecretKey(deployerKeypair.secretKey);
  const signer = createSignerFromKeypair(umi, umiKeypair);
  umi.use(signerIdentity(signer));

  try {
    const metadataBuilder = createV1(umi, {
      mint: publicKey(mintPublicKey.toBase58()),
      authority: signer,
      name: config.name,
      symbol: config.symbol,
      uri: config.uri,
      sellerFeeBasisPoints: percentAmount(0),
      tokenStandard: TokenStandard.Fungible,
      isMutable: true,
    });

    const metaTx = await metadataBuilder.sendAndConfirm(umi);
    const metaSig = bs58.encode(metaTx.signature);
    console.log(`✅ Metaplex Metadata attached (Tx: ${metaSig})`);
  } catch (metaErr: any) {
    console.error("⚠️ Metaplex metadata warning:", metaErr.message || metaErr);
  }

  // 7. Security Hardening: Revoke Mint & Freeze Authorities (if configured)
  if (config.revokeMintAuthority) {
    console.log("\n🔒 5/5 Revoking Mint Authority (Fixing Total Supply)...");
    try {
      const revokeSig = await setAuthority(
        connection,
        deployerKeypair,
        mintPublicKey,
        deployerKeypair,
        AuthorityType.MintTokens,
        null
      );
      console.log(`✅ Mint Authority Revoked (Tx: ${revokeSig})`);
    } catch (e: any) {
      console.error("⚠️ Failed to revoke mint authority:", e.message);
    }
  }

  // Summary Output Payload
  const result = {
    network: config.network,
    name: config.name,
    symbol: config.symbol,
    decimals: config.decimals,
    totalSupply: config.supply,
    mintAddress: mintPublicKey.toBase58(),
    deployerWallet: deployerKeypair.publicKey.toBase58(),
    deployerAta: deployerAta.address.toBase58(),
    metadataUri: config.uri,
    mintAuthorityRevoked: config.revokeMintAuthority,
    freezeAuthorityRevoked: config.revokeFreezeAuthority,
    links: {
      solscan: `https://solscan.io/token/${mintPublicKey.toBase58()}${config.network === "devnet" ? "?cluster=devnet" : ""}`,
      dexscreener: `https://dexscreener.com/solana/${mintPublicKey.toBase58()}`,
      birdeye: `https://birdeye.so/token/${mintPublicKey.toBase58()}?chain=solana`,
      raydiumCreatePool: `https://raydium.io/liquidity/create/`,
      jupiterStation: `https://station.jup.ag/docs/token-list/token-list-api`
    }
  };

  const outputPath = path.join(process.cwd(), `token-launch-${config.symbol.toLowerCase()}-${Date.now()}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
  console.log("\n=================================================");
  console.log("🎉 TOKEN LAUNCH INITIALIZATION COMPLETE!");
  console.log("=================================================");
  console.log(`• Token Mint:    ${result.mintAddress}`);
  console.log(`• Deployer ATA:  ${result.deployerAta}`);
  console.log(`• Solscan:       ${result.links.solscan}`);
  console.log(`• Report Saved:  ${outputPath}`);
  console.log("=================================================\n");

  return result;
}

// CLI Execution Handler
if (process.argv[1]?.includes("create-solana-token")) {
  const args = process.argv.slice(2);
  const isDevnet = args.includes("--devnet");
  const name = args.find(a => a.startsWith("--name="))?.split("=")[1] || "Dark Emperor";
  const symbol = args.find(a => a.startsWith("--symbol="))?.split("=")[1] || "DEMPR";
  const supply = parseInt(args.find(a => a.startsWith("--supply="))?.split("=")[1] || "1000000000", 10);
  const decimals = parseInt(args.find(a => a.startsWith("--decimals="))?.split("=")[1] || "9", 10);
  const uri = args.find(a => a.startsWith("--uri="))?.split("=")[1] || "https://darkempirelords.com/api/token-metadata";
  const revokeMint = args.includes("--revoke-mint");
  const revokeFreeze = args.includes("--revoke-freeze");

  createSolanaToken({
    name,
    symbol,
    decimals,
    supply,
    uri,
    revokeMintAuthority: revokeMint,
    revokeFreezeAuthority: revokeFreeze,
    network: isDevnet ? "devnet" : "mainnet-beta"
  }).catch((err) => {
    console.error("❌ Fatal Token Creation Error:", err);
    process.exit(1);
  });
}
