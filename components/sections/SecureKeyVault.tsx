"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Loader2, ShieldCheck, Lock, Key, CheckCircle2, AlertCircle, RefreshCw, EyeOff, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

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

export function SecureKeyVault() {
  const { user, loading, signInWithGoogle, logout } = useAuth();

  const [vaultStatus, setVaultStatus] = useState<SafeVaultStatus | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Write-only input fields (never prefilled with private secrets from server)
  const [solanaKeyInput, setSolanaKeyInput] = useState<string>("");
  const [okxApiKeyInput, setOkxApiKeyInput] = useState<string>("");
  const [okxSecretInput, setOkxSecretInput] = useState<string>("");
  const [okxPassphraseInput, setOkxPassphraseInput] = useState<string>("");
  const [telegramChatIdInput, setTelegramChatIdInput] = useState<string>("");

  const fetchVaultStatus = useCallback(async () => {
    if (!user) return;
    setIsLoadingStatus(true);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/user/vault", {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.status) {
          setVaultStatus(data.status);
        }
      } else {
        console.warn("[Vault] Status fetch non-OK:", res.status);
      }
    } catch (err: any) {
      console.warn("[Vault] Failed to fetch safe vault status:", err.message);
    } finally {
      setIsLoadingStatus(false);
    }
  }, [user]);

  useEffect(() => {
    let isCancelled = false;
    if (user) {
      user.getIdToken()
        .then((idToken) =>
          fetch("/api/user/vault", {
            headers: { Authorization: `Bearer ${idToken}` },
          })
        )
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (!isCancelled && data?.status) {
            setVaultStatus(data.status);
          }
        })
        .catch((err) => {
          console.warn("[Vault] Failed to fetch safe vault status:", err.message);
        });
    }
    return () => {
      isCancelled = true;
    };
  }, [user]);

  const handleSaveCredentials = async () => {
    if (!user) return;

    const hasAnyInput =
      solanaKeyInput.trim() ||
      okxApiKeyInput.trim() ||
      okxSecretInput.trim() ||
      okxPassphraseInput.trim() ||
      telegramChatIdInput.trim();

    if (!hasAnyInput) {
      toast.error("No Credentials Entered", {
        description: "Please enter at least one credential to encrypt and inject into the vault.",
      });
      return;
    }

    setIsSaving(true);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/user/vault", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          solanaPrivateKey: solanaKeyInput.trim() || undefined,
          okxApiKey: okxApiKeyInput.trim() || undefined,
          okxSecret: okxSecretInput.trim() || undefined,
          okxPassphrase: okxPassphraseInput.trim() || undefined,
          telegramChatId: telegramChatIdInput.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to encrypt and store credentials");
      }

      toast.success("Vault Encrypted & Synced", {
        description: "Credentials securely encrypted via AES-256-GCM and stored server-side.",
      });

      // Clear input fields immediately for security
      setSolanaKeyInput("");
      setOkxApiKeyInput("");
      setOkxSecretInput("");
      setOkxPassphraseInput("");
      setTelegramChatIdInput("");

      // Refresh safe metadata status
      await fetchVaultStatus();
    } catch (err: any) {
      console.error("[Vault Save Error]:", err);
      toast.error("Encryption Failed", {
        description: err.message || "Failed to securely save credentials.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-zinc-950/80 border-purple-900/40 p-8 text-center rounded-3xl backdrop-blur-xl">
        <Loader2 className="animate-spin h-8 w-8 mx-auto text-purple-400" />
        <p className="mt-4 text-zinc-400 font-mono text-xs tracking-widest uppercase">
          INITIALIZING SECURE PROTOCOL GATEWAY...
        </p>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card className="bg-zinc-950/90 border-purple-900/40 p-8 rounded-3xl backdrop-blur-xl shadow-[0_0_50px_rgba(0,0,0,0.9)] max-w-2xl mx-auto">
        <CardHeader className="text-center pb-6">
          <div className="w-14 h-14 rounded-2xl bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-purple-400 mx-auto mb-4 shadow-[0_0_25px_rgba(168,85,247,0.3)]">
            <Lock className="w-7 h-7 text-purple-300 animate-pulse" />
          </div>
          <CardTitle className="font-display text-2xl font-black text-white uppercase tracking-wider">
            ENCRYPTED EXECUTION VAULT
          </CardTitle>
          <CardDescription className="text-zinc-400 font-mono text-xs mt-2 leading-relaxed">
            Zero-Knowledge Credential Ingestion. Trading keys are encrypted with AES-256-GCM server-side and never exposed to the client.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center pt-2">
          <Button
            onClick={signInWithGoogle}
            className="w-full max-w-md h-12 bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold tracking-widest rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.4)] uppercase"
          >
            AUTHENTICATE & UNLOCK VAULT
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-zinc-950/90 border-purple-900/50 rounded-3xl backdrop-blur-2xl shadow-[0_0_60px_rgba(0,0,0,0.9)] max-w-3xl mx-auto overflow-hidden">
      <CardHeader className="border-b border-purple-950/60 pb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-950/90 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
              <ShieldCheck className="w-5 h-5 text-purple-300" />
            </div>
            <div>
              <CardTitle className="font-display text-xl font-bold text-white uppercase tracking-wider">
                SECURE CREDENTIAL VAULT
              </CardTitle>
              <p className="text-[11px] font-mono text-zinc-400">
                Connected: <span className="text-purple-300">{user.email || user.uid}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchVaultStatus}
              disabled={isLoadingStatus}
              className="border-purple-900/60 hover:bg-purple-950/50 text-zinc-300 text-xs font-mono rounded-xl h-8 px-3 gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingStatus ? "animate-spin" : ""}`} />
              SYNC
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-zinc-400 hover:text-red-400 hover:bg-red-950/30 text-xs font-mono rounded-xl h-8 px-3"
            >
              DISCONNECT
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        {/* Safe Provider Status Indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Solana Provider Status */}
          <div className="p-4 rounded-2xl bg-black/60 border border-purple-900/40 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-zinc-300">SOLANA KEYPAIR</span>
              {vaultStatus?.solana.configured ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3" /> ACTIVE
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-800">
                  EMPTY
                </span>
              )}
            </div>
            {vaultStatus?.solana.publicKey && (
              <p className="text-[10px] font-mono text-purple-300 truncate">
                Pub: {vaultStatus.solana.publicKey.slice(0, 4)}...{vaultStatus.solana.publicKey.slice(-4)}
              </p>
            )}
            <p className="text-[9px] font-mono text-zinc-500">
              {vaultStatus?.solana.lastUpdated
                ? `Updated ${new Date(vaultStatus.solana.lastUpdated).toLocaleDateString()}`
                : "Not configured yet"}
            </p>
          </div>

          {/* OKX Provider Status */}
          <div className="p-4 rounded-2xl bg-black/60 border border-purple-900/40 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-zinc-300">OKX API</span>
              {vaultStatus?.okx.configured ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3" /> ACTIVE
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-800">
                  EMPTY
                </span>
              )}
            </div>
            {vaultStatus?.okx.apiKeyMasked && (
              <p className="text-[10px] font-mono text-amber-300 truncate">
                Key: {vaultStatus.okx.apiKeyMasked}
              </p>
            )}
            <p className="text-[9px] font-mono text-zinc-500">
              {vaultStatus?.okx.lastUpdated
                ? `Updated ${new Date(vaultStatus.okx.lastUpdated).toLocaleDateString()}`
                : "Not configured yet"}
            </p>
          </div>

          {/* Telegram Relay Status */}
          <div className="p-4 rounded-2xl bg-black/60 border border-purple-900/40 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-zinc-300">TELEGRAM CHAT</span>
              {vaultStatus?.telegram.configured ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3" /> ACTIVE
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-800">
                  EMPTY
                </span>
              )}
            </div>
            {vaultStatus?.telegram.chatIdMasked && (
              <p className="text-[10px] font-mono text-purple-300 truncate">
                Chat: {vaultStatus.telegram.chatIdMasked}
              </p>
            )}
            <p className="text-[9px] font-mono text-zinc-500">
              {vaultStatus?.telegram.lastUpdated
                ? `Updated ${new Date(vaultStatus.telegram.lastUpdated).toLocaleDateString()}`
                : "Not configured yet"}
            </p>
          </div>
        </div>

        {/* Security Notice Banner */}
        <div className="p-3.5 rounded-2xl bg-purple-950/30 border border-purple-500/30 flex items-start gap-3">
          <EyeOff className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
          <p className="text-[11px] font-mono text-zinc-300 leading-relaxed">
            <strong className="text-purple-300 font-bold">Write-Only Secret Storage:</strong> Credentials entered below are encrypted instantly upon submission using AES-256-GCM. The browser never receives or caches your unencrypted private keys.
          </p>
        </div>

        {/* Ingestion Inputs */}
        <div className="space-y-4 pt-2">
          {/* Solana Private Key */}
          <div className="space-y-1.5">
            <Label className="text-xs font-mono text-purple-300 uppercase tracking-wider flex items-center justify-between">
              <span>Solana Private Execution Key (Base58)</span>
              <span className="text-[10px] text-zinc-500 font-normal">Write-Only</span>
            </Label>
            <Input
              type="password"
              placeholder={vaultStatus?.solana.configured ? "•••••••••••••••••••••••• (Leave blank to keep current key)" : "Enter base58 private key"}
              value={solanaKeyInput}
              onChange={(e) => setSolanaKeyInput(e.target.value)}
              className="bg-black/60 border-purple-900/50 text-white font-mono text-xs h-11 rounded-xl focus:border-purple-500"
            />
          </div>

          {/* OKX API Suite */}
          <div className="pt-3 border-t border-purple-950/60 space-y-3">
            <h4 className="text-xs font-mono text-amber-400 uppercase tracking-widest font-bold">
              OKX Exchange API Credentials
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">API Key</Label>
                <Input
                  type="text"
                  placeholder={vaultStatus?.okx.apiKeyMasked || "Enter OKX API Key"}
                  value={okxApiKeyInput}
                  onChange={(e) => setOkxApiKeyInput(e.target.value)}
                  className="bg-black/60 border-purple-900/50 text-white font-mono text-xs h-10 rounded-xl focus:border-purple-500"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">Secret Key</Label>
                <Input
                  type="password"
                  placeholder={vaultStatus?.okx.configured ? "••••••••••••••••" : "Enter OKX Secret Key"}
                  value={okxSecretInput}
                  onChange={(e) => setOkxSecretInput(e.target.value)}
                  className="bg-black/60 border-purple-900/50 text-white font-mono text-xs h-10 rounded-xl focus:border-purple-500"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">API Passphrase</Label>
                <Input
                  type="password"
                  placeholder={vaultStatus?.okx.configured ? "••••••••••••••••" : "Enter OKX Passphrase"}
                  value={okxPassphraseInput}
                  onChange={(e) => setOkxPassphraseInput(e.target.value)}
                  className="bg-black/60 border-purple-900/50 text-white font-mono text-xs h-10 rounded-xl focus:border-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Telegram Relay Chat ID */}
          <div className="pt-3 border-t border-purple-950/60 space-y-1.5">
            <Label className="text-xs font-mono text-purple-300 uppercase tracking-wider flex items-center justify-between">
              <span>Personal Telegram Chat ID for Bot Alerts</span>
              <span className="text-[10px] text-zinc-500 font-normal">Optional</span>
            </Label>
            <Input
              type="text"
              placeholder={vaultStatus?.telegram.chatIdMasked || "e.g. 123456789"}
              value={telegramChatIdInput}
              onChange={(e) => setTelegramChatIdInput(e.target.value)}
              className="bg-black/60 border-purple-900/50 text-white font-mono text-xs h-10 rounded-xl focus:border-purple-500"
            />
          </div>
        </div>
      </CardContent>

      <CardFooter className="bg-black/70 border-t border-purple-950/60 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-[10px] font-mono text-zinc-500 text-center sm:text-left">
          🔐 AES-256-GCM Server Vault Protocol Active
        </p>

        <Button
          onClick={handleSaveCredentials}
          disabled={isSaving}
          className="w-full sm:w-auto h-11 px-8 bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold tracking-wider rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.4)] uppercase flex items-center justify-center gap-2"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              ENCRYPTING & STORING...
            </>
          ) : (
            <>
              <Lock className="w-4 h-4" />
              ENCRYPT & INJECT CREDENTIALS
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
