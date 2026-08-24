import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { encryptVaultSecret, maskIdentifier } from "@/lib/vault-crypto";
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import { z } from "zod";

const vaultUpdateSchema = z.object({
  solanaPrivateKey: z.string().optional(),
  okxApiKey: z.string().optional(),
  okxSecret: z.string().optional(),
  okxPassphrase: z.string().optional(),
  telegramBotToken: z.string().optional(),
  telegramChatId: z.string().optional(),
});

interface SafeVaultStatus {
  solana: {
    configured: boolean;
    publicKey?: string;
    lastUpdated?: string | null;
  };
  okx: {
    configured: boolean;
    apiKeyMasked?: string;
    lastUpdated?: string | null;
  };
  telegram: {
    configured: boolean;
    chatIdMasked?: string;
    lastUpdated?: string | null;
  };
}

async function authenticateRequest(req: Request): Promise<{ uid: string } | null> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.slice(7).trim();
  if (!adminAuth) {
    console.warn("[Vault API] Firebase Admin Auth not initialized.");
    return null;
  }

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    return { uid: decoded.uid };
  } catch (err) {
    console.warn("[Vault API] Token verification failed:", err);
    return null;
  }
}

/**
 * GET /api/user/vault
 * Returns purely safe metadata regarding configured credentials.
 * NEVER returns raw private keys, API secrets, or passphrases to the browser.
 */
export async function GET(req: Request) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized access to vault status" }, { status: 401 });
    }

    if (!adminDb) {
      return NextResponse.json({ error: "Vault database storage unavailable" }, { status: 503 });
    }

    const doc = await adminDb.collection("users").doc(auth.uid).collection("private").doc("vault").get();
    
    if (!doc.exists) {
      const emptyStatus: SafeVaultStatus = {
        solana: { configured: false, lastUpdated: null },
        okx: { configured: false, lastUpdated: null },
        telegram: { configured: false, lastUpdated: null },
      };
      return NextResponse.json({ success: true, status: emptyStatus });
    }

    const data = doc.data() || {};
    const safeStatus: SafeVaultStatus = {
      solana: {
        configured: Boolean(data.solanaPrivateKeyEncrypted),
        publicKey: data.solanaPublicKey || undefined,
        lastUpdated: data.solanaUpdated || data.updatedAt || null,
      },
      okx: {
        configured: Boolean(data.okxApiKeyMasked && data.okxSecretEncrypted),
        apiKeyMasked: data.okxApiKeyMasked || undefined,
        lastUpdated: data.okxUpdated || data.updatedAt || null,
      },
      telegram: {
        configured: Boolean(data.telegramChatId),
        chatIdMasked: data.telegramChatId ? maskIdentifier(data.telegramChatId, 2) : undefined,
        lastUpdated: data.telegramUpdated || data.updatedAt || null,
      },
    };

    return NextResponse.json({ success: true, status: safeStatus });
  } catch (err: any) {
    console.error("[Vault API GET Error]:", err);
    return NextResponse.json({ error: "Failed to query vault status" }, { status: 500 });
  }
}

/**
 * POST /api/user/vault
 * Securely ingests credentials, validates formats, encrypts sensitive fields with AES-256-GCM,
 * and stores them in private encrypted storage.
 */
export async function POST(req: Request) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized: Please sign in first" }, { status: 401 });
    }

    if (!adminDb) {
      return NextResponse.json({ error: "Vault database storage unavailable" }, { status: 503 });
    }

    const body = await req.json().catch(() => null);
    const parsed = vaultUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid vault payload", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { solanaPrivateKey, okxApiKey, okxSecret, okxPassphrase, telegramBotToken, telegramChatId } = parsed.data;
    const nowIso = new Date().toISOString();
    const updateDoc: Record<string, any> = {
      updatedAt: nowIso,
    };

    // 1. Process Solana Private Key
    if (solanaPrivateKey && solanaPrivateKey.trim() !== "") {
      const trimmedKey = solanaPrivateKey.trim();
      try {
        let pubKeyString = "";
        if (trimmedKey.startsWith("[")) {
          const secretBytes = Uint8Array.from(JSON.parse(trimmedKey));
          const kp = Keypair.fromSecretKey(secretBytes);
          pubKeyString = kp.publicKey.toBase58();
        } else {
          const secretBytes = bs58.decode(trimmedKey);
          const kp = Keypair.fromSecretKey(secretBytes);
          pubKeyString = kp.publicKey.toBase58();
        }

        updateDoc.solanaPrivateKeyEncrypted = encryptVaultSecret(trimmedKey);
        updateDoc.solanaPublicKey = pubKeyString;
        updateDoc.solanaUpdated = nowIso;
      } catch (err: any) {
        return NextResponse.json(
          { error: "Invalid Solana private key. Must be valid base58 or byte array." },
          { status: 400 }
        );
      }
    }

    // 2. Process OKX API Credentials
    if (okxApiKey && okxApiKey.trim() !== "") {
      updateDoc.okxApiKeyMasked = maskIdentifier(okxApiKey.trim(), 4);
      updateDoc.okxApiKeyEncrypted = encryptVaultSecret(okxApiKey.trim());
      updateDoc.okxUpdated = nowIso;
    }
    if (okxSecret && okxSecret.trim() !== "") {
      updateDoc.okxSecretEncrypted = encryptVaultSecret(okxSecret.trim());
      updateDoc.okxUpdated = nowIso;
    }
    if (okxPassphrase && okxPassphrase.trim() !== "") {
      updateDoc.okxPassphraseEncrypted = encryptVaultSecret(okxPassphrase.trim());
      updateDoc.okxUpdated = nowIso;
    }

    // 3. Process Telegram Relays
    if (telegramBotToken && telegramBotToken.trim() !== "") {
      updateDoc.telegramBotTokenEncrypted = encryptVaultSecret(telegramBotToken.trim());
      updateDoc.telegramUpdated = nowIso;
    }
    if (telegramChatId && telegramChatId.trim() !== "") {
      updateDoc.telegramChatId = telegramChatId.trim();
      updateDoc.telegramUpdated = nowIso;
    }

    // Persist encrypted payload to private vault document
    const vaultRef = adminDb.collection("users").doc(auth.uid).collection("private").doc("vault");
    await vaultRef.set(updateDoc, { merge: true });

    // Also mirror to legacy keys doc with encryption for trading terminal worker compatibility
    const keysRef = adminDb.collection("users").doc(auth.uid).collection("private").doc("keys");
    const mirrorKeys: Record<string, any> = { updatedAt: nowIso };
    if (updateDoc.solanaPrivateKeyEncrypted) mirrorKeys.solanaPrivateKey = updateDoc.solanaPrivateKeyEncrypted;
    if (updateDoc.okxApiKeyEncrypted) mirrorKeys.okxApiKey = updateDoc.okxApiKeyEncrypted;
    if (updateDoc.okxSecretEncrypted) {
      mirrorKeys.okxSecret = updateDoc.okxSecretEncrypted;
      mirrorKeys.okxApiSecret = updateDoc.okxSecretEncrypted;
    }
    if (updateDoc.okxPassphraseEncrypted) {
      mirrorKeys.okxPassphrase = updateDoc.okxPassphraseEncrypted;
      mirrorKeys.okxApiPassphrase = updateDoc.okxPassphraseEncrypted;
    }
    if (updateDoc.telegramBotTokenEncrypted) mirrorKeys.telegramBotToken = updateDoc.telegramBotTokenEncrypted;
    if (updateDoc.telegramChatId) mirrorKeys.telegramChatId = updateDoc.telegramChatId;

    await keysRef.set(mirrorKeys, { merge: true });

    return NextResponse.json({
      success: true,
      message: "Credentials encrypted and securely saved to vault.",
      timestamp: nowIso,
    });
  } catch (err: any) {
    console.error("[Vault API POST Error]:", err);
    return NextResponse.json(
      { error: "Failed to store encrypted credentials in vault" },
      { status: 500 }
    );
  }
}
