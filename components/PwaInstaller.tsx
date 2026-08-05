"use client";

import { useState, useEffect } from "react";
import { Download, Sparkles, X, ShieldCheck } from "lucide-react";
import { useAudioHUD } from "@/hooks/useAudioHUD";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaInstaller() {
  const { playConnectSound } = useAudioHUD();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("[PWA] Service Worker registered:", reg.scope);
        })
        .catch((err) => {
          console.warn("[PWA] Service Worker registration failed:", err);
        });
    }

    // 2. Handle beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    // 3. Handle appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowBanner(false);
      setDeferredPrompt(null);
      // Play audio chime when PWA installation completes
      playConnectSound();
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [playConnectSound]);

  const handleInstallClick = async () => {
    // Play power-up chime when user clicks Install prompt
    playConnectSound();

    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        console.log("[PWA] User accepted the install prompt");
      } else {
        console.log("[PWA] User dismissed the install prompt");
      }
      setDeferredPrompt(null);
      setShowBanner(false);
    } catch (err) {
      console.error("[PWA] Error triggering install prompt:", err);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
  };

  if (!showBanner || isInstalled) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-[calc(100vw-3rem)] p-4 rounded-2xl border border-purple-500/40 bg-zinc-950/90 backdrop-blur-xl shadow-2xl shadow-purple-950/50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0 shadow-inner">
            <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-display font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              Dark Empire App
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                PWA READY
              </span>
            </h4>
            <p className="text-xs font-mono text-zinc-400 mt-0.5">
              Install standalone Command Center to desktop or mobile home screen.
            </p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button
          onClick={handleInstallClick}
          className="flex-1 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-600/30 hover:scale-[1.02] active:scale-95 border border-purple-400/40"
        >
          <Download className="w-4 h-4 text-purple-200" />
          <span>Install Command App</span>
        </button>
        <button
          onClick={handleDismiss}
          className="py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-mono text-xs transition-colors border border-purple-500/20"
        >
          Later
        </button>
      </div>

      <div className="mt-2.5 flex items-center gap-1.5 text-[10px] font-mono text-zinc-500 justify-center">
        <ShieldCheck className="w-3 h-3 text-emerald-400" />
        <span>Standalone App • Offline Shell • Encrypted Link</span>
      </div>
    </div>
  );
}
