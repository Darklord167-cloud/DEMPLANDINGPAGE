"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, TerminalSquare, Coins, Cpu, Activity, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useWallet } from "@solana/wallet-adapter-react";
import { toast } from "sonner";
import Link from "next/link";
import bs58 from "bs58";

import { useVipTier } from "@/lib/vip-context";
import { VipBadge } from "@/components/vip/VipBadge";
import { OracleSphere } from "@/components/sections/OracleSphere";

function TypewriterText({ 
  content, 
  isOracle,
  onActiveStateChange,
  disableAudio = false
}: { 
  content: string; 
  isOracle: boolean;
  onActiveStateChange?: (isActive: boolean) => void;
  disableAudio?: boolean;
}) {
  const [displayedContent, setDisplayedContent] = useState("");
  const [isTyping, setIsTyping] = useState(isOracle);

  useEffect(() => {
    if (!isOracle) {
      const t = setTimeout(() => setDisplayedContent(content), 0);
      return () => clearTimeout(t);
    }

    const t = setTimeout(() => {
      setIsTyping(true);
      setDisplayedContent("");
      onActiveStateChange?.(true);
    }, 0);

    const synth = window.speechSynthesis;
    let intervalId: NodeJS.Timeout;

    if (!disableAudio) {
      const utterance = new SpeechSynthesisUtterance(content);
      
      const voices = synth.getVoices();
      const selectedVoice = voices.find(v => 
        v.name.includes("Google UK English Female") || 
        v.name.includes("Samantha") || 
        v.name.includes("Microsoft Zira") ||
        (v.lang.startsWith('en') && v.name.includes('Female'))
      ) || voices[0];
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.pitch = 1.1;
      utterance.rate = 1.0;
      
      synth.speak(utterance);
    }

    let i = 0;
    intervalId = setInterval(() => {
      if (i < content.length) {
        setDisplayedContent((prev) => prev + content.charAt(i));
        i++;
      } else {
        clearInterval(intervalId);
        setIsTyping(false);
        onActiveStateChange?.(false);
      }
    }, 45);

    return () => {
      clearInterval(intervalId);
      if (!disableAudio) {
        synth.cancel();
      }
    };
  }, [content, isOracle, disableAudio, onActiveStateChange]);

  return <span>{displayedContent}{isTyping && <span className="opacity-80 animate-pulse text-[#ff6600]">▋</span>}</span>;
}

import { 
  fetchTokenTelemetry, 
  getJupiterSwapUrl, 
  calculateHoldingValueUsd,
  formatUsdValue, 
  DEFAULT_TELEMETRY,
  type TokenTelemetry 
} from "@/lib/solana";
import { ArrowLeftRight, TrendingUp } from "lucide-react";

export default function OraclePage() {
  const { publicKey, connected, signMessage } = useWallet();
  const { tier, dempBalance } = useVipTier();
  const [profile, setProfile] = useState<any>(null);
  const [telemetry, setTelemetry] = useState<TokenTelemetry>(DEFAULT_TELEMETRY);
  const [messages, setMessages] = useState<{ role: "user" | "oracle"; content: string }[]>([
    { role: "oracle", content: "ULTRON MIND CORE ONLINE. Quantum neural links calibrated. State your command, Lord." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOracleSpeaking, setIsOracleSpeaking] = useState(false);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadTelemetry() {
      try {
        const stats = await fetchTokenTelemetry();
        setTelemetry(stats);
      } catch (e) {
        console.error("Oracle telemetry load error", e);
      }
    }
    loadTelemetry();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOracleSpeaking]);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/user/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: publicKey?.toBase58() }),
      });
      
      if (!res.ok) {
        throw new Error(`Profile fetch failed: ${res.status}`);
      }

      const text = await res.text();
      if (text.includes("<!doctype html>") || text.includes("<html")) {
        return;
      }

      try {
        const data = JSON.parse(text);
        setProfile(data);
      } catch (e) {
        console.error("Failed to parse profile JSON", e);
      }
    } catch (err) {
      console.error("Failed to fetch profile", err);
    }
  };

  useEffect(() => {
    const load = async () => {
      if (connected && publicKey) {
        await fetchProfile();
      } else {
        setProfile(null);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, publicKey]);

  const unlockAudio = () => {
    if (!audioUnlocked && typeof window !== "undefined") {
      const synth = window.speechSynthesis;
      const utterance = new SpeechSynthesisUtterance("");
      synth.speak(utterance);
      setAudioUnlocked(true);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    unlockAudio();
    
    if (!input.trim() || loading || isOracleSpeaking) return;

    if (!connected || !publicKey) {
      toast.error("You must connect your wallet to interact with the Oracle.");
      return;
    }

    if (!profile || profile.credits <= 0) {
      toast.error("Insufficient credits. Purchase more in the Credits section.");
      return;
    }
    
    if (!signMessage) {
      toast.error("Wallet does not support message signing. Cannot authenticate credit deduction.");
      return;
    }

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setInput("");
    setLoading(true);

    try {
      // 1. Authenticate the deduction via wallet signature
      const messageObj = { timestamp: Date.now(), action: "deduct_credits" };
      const messageStr = JSON.stringify(messageObj);
      const msgBytes = new TextEncoder().encode(messageStr);
      const signatureBytes = await signMessage(msgBytes);
      const signature = bs58.encode(signatureBytes);

      // 2. Deduct credit first
      const deductRes = await fetch("/api/user/credits/deduct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          walletAddress: publicKey.toBase58(),
          signature,
          message: messageStr
        }),
      });
      
      const deductText = await deductRes.text();
      if (deductText.includes("<!doctype html>") || deductText.includes("<html")) {
        throw new Error("Server is currently initiating environment. Please wait 10 seconds.");
      }

      let deductData: any;
      try {
        deductData = JSON.parse(deductText);
      } catch (e) {
        throw new Error("Unexpected server response format.");
      }

      if (!deductRes.ok) {
        throw new Error(deductData.message || "Failed to deduct credits");
      }
      
      // Update local profile state with new credit count
      setProfile((prev: any) => ({ ...prev, credits: deductData.credits }));

      // 3. Format history for the backend API
      const history = messages.map(msg => ({
        role: msg.role === "oracle" ? "model" : "user",
        parts: [{ text: msg.content }]
      }));

      // 4. Send message securely to our backend route
      const aiResponse = await fetch("/api/oracle/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          history: history.slice(0, -1)
        }),
      });

      if (!aiResponse.ok) {
        const errorData = await aiResponse.json();
        throw new Error(errorData.error || "Failed to communicate with the Oracle API.");
      }

      const { response: responseText } = await aiResponse.json();
      setMessages((prev) => [...prev, { role: "oracle", content: responseText || "Neural matrix returned empty response." }]);
      
    } catch (err: any) {
      setMessages((prev) => [...prev, { role: "oracle", content: err.message || "Communication link disrupted." }]);
    } finally {
      setLoading(false);
    }
  };

  const isCoreActive = loading || isOracleSpeaking;

  return (
    <div className="min-h-screen py-16 bg-[#020b18] relative overflow-hidden flex flex-col items-center justify-center">
      {/* Background Image & Deep Blue Ultron Ambient Glows */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070')] bg-cover bg-center bg-no-repeat opacity-15 mix-blend-screen pointer-events-none filter blur-[3px]" style={{ filter: 'hue-rotate(-120deg)' }} />
      <div className="absolute inset-0 bg-gradient-to-b from-[#020b18] via-[#041126]/90 to-[#020b18] pointer-events-none" />
      
      {/* Age of Ultron Glowing Orange Radial Ambient Flares */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-r from-[#ff5500]/15 via-[#00d2ff]/10 to-[#ff6600]/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-[25vh] bg-gradient-to-t from-[#ff5500]/15 via-transparent to-transparent pointer-events-none mix-blend-screen" />

      {/* Cybernetic Grid Scanline Overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />

      {/* Title Area */}
      <div className="absolute top-24 z-20 flex flex-col items-center">
        <div className="flex items-center gap-3 mb-2 flex-wrap justify-center">
          {connected && profile && (
            <Link href="/credits">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 bg-[#041635]/90 border border-[#ff6600]/40 px-4 py-2 rounded-full cursor-pointer hover:bg-[#ff6600]/20 transition-all shadow-[0_0_15px_rgba(255,102,0,0.3)]"
              >
                <Coins className="w-4 h-4 text-[#ff8800]" />
                <span className="text-xs font-bold font-mono text-white">{profile.credits} CREDITS</span>
              </motion.div>
            </Link>
          )}

          {/* Live DEX Telemetry HUD Pill */}
          <div className="flex items-center gap-2 bg-[#041635]/90 border border-[#00d2ff]/40 px-3.5 py-1.5 rounded-full font-mono text-xs text-white backdrop-blur-md shadow-[0_0_15px_rgba(0,210,255,0.2)]">
            <TrendingUp className="w-3.5 h-3.5 text-[#00d2ff]" />
            <span>$DEMP ${telemetry.priceUsd.toFixed(4)}</span>
            <span className="text-[#00d2ff] font-bold">MCAP {formatUsdValue(telemetry.marketCapUsd)}</span>
          </div>

          <a
            href={getJupiterSwapUrl()}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 bg-[#ff5500]/20 border border-[#ff6600]/60 hover:bg-[#ff5500]/40 px-3.5 py-1.5 rounded-full font-mono text-xs font-bold text-amber-300 transition-all shadow-[0_0_15px_rgba(255,102,0,0.3)]"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-[#ff6600]" />
            <span>SWAP $DEMP</span>
          </a>

          <Link href="/vip">
            <VipBadge tier={tier} size="sm" showIcon />
          </Link>
        </div>

        {/* High-Tech HUD Icon Badge */}
        <div className="mb-3 border-2 border-[#ff6600] rounded-xl p-2.5 shadow-[0_0_25px_rgba(255,102,0,0.6)] backdrop-blur-md bg-[#04122b]/80 relative group">
          <TerminalSquare className="h-9 w-9 text-[#00d2ff] drop-shadow-[0_0_12px_rgba(0,210,255,1)]" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#ff5500] animate-ping" />
        </div>

        {/* Glitch Title */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-black text-white uppercase tracking-[0.15em] sm:tracking-[0.2em] md:tracking-[0.3em] drop-shadow-[0_0_25px_rgba(255,102,0,0.8)] ultron-text-glitch">
          THE ORACLE
        </h1>
        <p className="text-[10px] md:text-xs font-mono text-[#00d2ff] uppercase tracking-[0.3em] mt-1 flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-[#ff6600] animate-pulse" />
          <span>ULTRON AI MIND CORE // QUANTUM SYNC</span>
        </p>
      </div>

      {/* The Core Hologram / Sphere */}
      <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none mt-10">
        <OracleSphere isActive={isCoreActive} />
      </div>

      {/* Chat Interface Container */}
      <div className="container px-4 max-w-3xl mx-auto relative z-30 flex flex-col w-full h-[600px] mt-24">
        
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto mb-6 p-4 flex flex-col custom-scrollbar relative z-30">
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className={`flex flex-col mb-6 ${msg.role === "user" ? "items-end" : "items-center"}`}
            >
              <div
                className={`w-full max-w-[90%] p-6 rounded-2xl font-mono whitespace-pre-wrap text-[15px] md:text-[16px] leading-relaxed relative overflow-hidden ${
                  msg.role === "user"
                    ? "bg-[#051a3d]/90 border border-[#00d2ff]/50 text-white shadow-[0_0_20px_rgba(0,210,255,0.25)] backdrop-blur-xl"
                    : "bg-[#04122b]/95 border border-[#ff6600]/50 text-orange-100 shadow-[0_0_25px_rgba(255,102,0,0.3)] backdrop-blur-2xl"
                }`}
              >
                {/* Age of Ultron Scanning Line */}
                <div className="ultron-laser-scan" />
                <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.15)_50%)] bg-[length:100%_4px] pointer-events-none opacity-30" />
                
                {/* Header Tag inside bubble */}
                <div className="flex items-center justify-between mb-3 relative z-10 border-b border-[#ff6600]/30 pb-2">
                  <span className="text-[10px] text-[#00d2ff] font-mono uppercase tracking-[0.3em] font-bold flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-[#ff6600]" />
                    {msg.role === "user" ? "USER // IMPERIAL DIRECTIVE" : "ULTRON // MIND ORACLE RESPONSE"}
                  </span>
                  <span className="text-[9px] font-mono text-[#ff8800] tracking-widest">[ONLINE]</span>
                </div>

                <div className="relative z-10">
                  {msg.role === "oracle" && idx === messages.length - 1 ? (
                    <TypewriterText 
                      content={msg.content} 
                      isOracle={true} 
                      onActiveStateChange={setIsOracleSpeaking}
                      disableAudio={idx === 0}
                    />
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          {loading && (
            <div className="flex flex-col items-center mt-auto pt-4">
              <div className="p-6 rounded-3xl w-full max-w-[90%] bg-[#04122b]/95 border border-[#ff6600]/60 text-white shadow-[0_0_30px_rgba(255,102,0,0.4)] backdrop-blur-2xl flex items-center justify-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-[#ff6600]" />
                <span className="text-xs text-[#00d2ff] font-mono uppercase tracking-[0.25em] animate-pulse font-bold">
                  CALCULATING NEURAL MATRIX...
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Directive Transmit Input Form */}
        <form onSubmit={sendMessage} className="flex gap-4 relative z-30 mb-8 max-w-[95%] sm:max-w-[90%] mx-auto w-full">
          <div className="relative flex-1">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="TRANSMIT DIRECTIVE TO ULTRON CORE..."
              className="w-full bg-[#030d21]/90 backdrop-blur-2xl border border-[#ff6600]/50 focus:border-[#ff6600] text-white h-14 text-sm md:text-base placeholder:text-zinc-500 font-mono rounded-xl px-6 outline-none ring-0 shadow-[inset_0_0_20px_rgba(255,102,0,0.2),0_0_15px_rgba(0,0,0,0.8)] transition-all uppercase"
              disabled={loading || isOracleSpeaking}
              spellCheck={false}
              autoFocus
            />
          </div>

          <Button
            type="submit"
            className="h-14 px-8 bg-gradient-to-r from-[#ff5500] via-[#ff7700] to-[#ffaa00] hover:from-[#ff6600] hover:to-[#ffcc00] border border-white/40 text-white font-bold uppercase tracking-[0.2em] rounded-xl shadow-[0_0_25px_rgba(255,102,0,0.7),inset_0_0_15px_rgba(255,255,255,0.4)] transition-all active:scale-95 shrink-0 flex items-center gap-2"
            disabled={loading || isOracleSpeaking}
          >
            <Zap className="w-4 h-4 text-white animate-pulse" />
            <span>TRANSMIT</span>
          </Button>
        </form>

      </div>
    </div>
  );
}

