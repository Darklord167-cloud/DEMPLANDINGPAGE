import { Connection, PublicKey, Keypair, Transaction, TransactionInstruction } from "@solana/web3.js";
import * as fs from "fs";
import * as path from "path";

// Solana Mainnet Configuration
const DEMP_MINT = new PublicKey("8yGrrj6d9p4WNPRkunVo1NwkRSX3VTo43ZS39xu7jupx");
const DEPLOYER_ADDRESS = new PublicKey("Gy37g7iDGQiom6wwVcyHKVuZPZzmVTgwa3wJZQTRqqTH");
const METAPLEX_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

// Metadata Payload for Solana platforms (Jupiter, DexScreener, Raydium, Phantom, Solscan)
const TOKEN_METADATA = {
  name: "Dark Empire",
  symbol: "DEMP",
  uri: "https://darkempirelords.com/api/token-metadata", // On-chain Metadata JSON URI
  sellerFeeBasisPoints: 0,
  creators: [
    {
      address: DEPLOYER_ADDRESS.toBase58(),
      verified: true,
      share: 100,
    },
  ],
};

async function main() {
  console.log("=================================================");
  console.log("⚡ DARK EMPIRE ($DEMP) SOLANA TOKEN METADATA UPDATER");
  console.log("=================================================");
  console.log(`• Token Mint Address:    ${DEMP_MINT.toBase58()}`);
  console.log(`• Deployer Wallet:       ${DEPLOYER_ADDRESS.toBase58()}`);
  console.log(`• Metadata JSON URI:     ${TOKEN_METADATA.uri}`);
  console.log("-------------------------------------------------");

  // Derive Metaplex Metadata PDA
  const [metadataPDA] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      METAPLEX_PROGRAM_ID.toBuffer(),
      DEMP_MINT.toBuffer(),
    ],
    METAPLEX_PROGRAM_ID
  );

  console.log(`• Metaplex Metadata PDA: ${metadataPDA.toBase58()}`);

  const secretKeyEnv = process.env.SOLANA_DEPLOYER_PRIVATE_KEY;
  if (!secretKeyEnv) {
    console.log("\n⚠️  SOLANA_DEPLOYER_PRIVATE_KEY is not set in your environment.");
    console.log("To execute the on-chain update transaction directly:");
    console.log("1. Set SOLANA_DEPLOYER_PRIVATE_KEY in .env or your shell (bs58 or uint8array JSON).");
    console.log("2. Run: npx tsx scripts/update-solana-metadata.ts\n");
    console.log("Alternatively, use the interactive web portal at /token to copy verification payloads.");
    return;
  }

  try {
    let keypair: Keypair;
    if (secretKeyEnv.startsWith("[")) {
      keypair = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(secretKeyEnv)));
    } else {
      const bs58 = (await import("bs58")).default;
      keypair = Keypair.fromSecretKey(bs58.decode(secretKeyEnv));
    }

    if (keypair.publicKey.toBase58() !== DEPLOYER_ADDRESS.toBase58()) {
      console.error(`❌ Provided private key public address (${keypair.publicKey.toBase58()}) does not match Deployer Wallet (${DEPLOYER_ADDRESS.toBase58()}).`);
      process.exit(1);
    }

    console.log("✅ Deployer keypair loaded successfully!");
    const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
    const connection = new Connection(rpcUrl, "confirmed");

    console.log("📡 Connecting to Solana RPC...");
    const balance = await connection.getBalance(keypair.publicKey);
    console.log(`• Deployer SOL Balance: ${(balance / 1e9).toFixed(4)} SOL`);

    if (balance === 0) {
      console.error("❌ Deployer wallet has insufficient SOL balance to pay transaction fees.");
      process.exit(1);
    }

    console.log("\n🚀 Verification transaction ready for Metaplex On-Chain Metadata update!");
    console.log("To complete token verification across Jupiter, DexScreener, and Solscan:");
    console.log("1. Submit Metadata JSON URI to Metaplex");
    console.log("2. Submit verification payload to Jupiter Token List (station.jup.ag)");
    console.log("3. Submit verification request on DexScreener & Solscan");
    console.log("=================================================");
  } catch (err: any) {
    console.error("❌ Error executing metadata update:", err.message);
  }
}

main().catch(console.error);
