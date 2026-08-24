import crypto from "crypto";

const ENCRYPTION_ALGORITHM = "aes-256-gcm";

function getMasterKey(): Buffer {
  const secret =
    process.env.ENCRYPTION_SECRET ||
    process.env.DATABASE_URL ||
    process.env.NEON_DATABASE_URL ||
    process.env.STRIPE_SECRET_KEY;

  if (!secret) {
    throw new Error(
      "SecureKeyVault Error: ENCRYPTION_SECRET or DATABASE_URL must be configured in environment."
    );
  }
  return crypto.createHash("sha256").update(secret).digest();
}

/**
 * Encrypts sensitive plaintext using AES-256-GCM.
 * Output format: enc:v1:<iv_hex>:<authTag_hex>:<ciphertext_hex>
 */
export function encryptVaultSecret(plaintext: string): string {
  if (!plaintext || typeof plaintext !== "string") return "";
  if (plaintext.startsWith("enc:v1:")) return plaintext; // Already encrypted

  const iv = crypto.randomBytes(12);
  const key = getMasterKey();
  const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");

  return `enc:v1:${iv.toString("hex")}:${authTag}:${encrypted}`;
}

/**
 * Decrypts an AES-256-GCM encrypted secret. Never expose output to browser clients.
 */
export function decryptVaultSecret(encryptedText: string): string {
  if (!encryptedText || typeof encryptedText !== "string") return "";
  if (!encryptedText.startsWith("enc:v1:")) return encryptedText; // Legacy plaintext fallback

  try {
    const parts = encryptedText.split(":");
    if (parts.length !== 5) return "";

    const iv = Buffer.from(parts[2], "hex");
    const authTag = Buffer.from(parts[3], "hex");
    const ciphertext = parts[4];
    const key = getMasterKey();

    const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(ciphertext, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (err: any) {
    console.error("[Vault Crypto] Decryption failed:", err.message);
    throw new Error("Failed to decrypt secure vault credentials");
  }
}

/**
 * Masks an API key for safe client display (e.g. "okx_...a1b2")
 */
export function maskIdentifier(identifier?: string, visibleChars = 4): string {
  if (!identifier || typeof identifier !== "string") return "";
  if (identifier.length <= visibleChars * 2) return "••••••••";
  return `${identifier.slice(0, visibleChars)}••••${identifier.slice(-visibleChars)}`;
}
