"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, TerminalSquare, Coins } from "lucide-react";
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

  return <span>{displayedContent}{isTyping && <span className="opacity-75 animate-pulse text-primary">▋</span>}</span>;
}

export default function OraclePage() {
  const { publicKey, connected, signMessage } = useWallet();
  const { tier } = useVipTier();
  const [profile, setProfile] = useState<any>(null);
  const [messages, setMessages] = useState<{ role: "user" | "oracle"; content: string }[]>([
    { role: "oracle", content: "Oracle online. Let's make some money and scale your digital empire. State your objective." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOracleSpeaking, setIsOracleSpeaking] = useState(false);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

      // 4. Send message securely to our new backend route
      const aiResponse = await fetch("/api/oracle/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          history: history.slice(0, -1) // Send all previous messages except the current one
        }),
      });

      if (!aiResponse.ok) {
        const errorData = await aiResponse.json();
        throw new Error(errorData.error || "Failed to communicate with the Oracle API.");
      }

      const { response: responseText } = await aiResponse.json();
      setMessages((prev) => [...prev, { role: "oracle", content: responseText || "Communication empty." }]);
      
    } catch (err: any) {
      setMessages((prev) => [...prev, { role: "oracle", content: err.message || "Communication disrupted." }]);
    } finally {
      setLoading(false);
    }
  };

  const isCoreActive = loading || isOracleSpeaking;

  return (
    <div className="min-h-screen py-16 bg-[#0a001a] relative overflow-hidden flex flex-col items-center justify-center">
      {/* Background Image & Effects */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070')] bg-cover bg-center bg-no-repeat opacity-20 mix-blend-screen pointer-events-none filter blur-[4px]" style={{ filter: 'hue-rotate(-45deg)' }} />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a001a] via-transparent to-[#0a001a] pointer-events-none opacity-80" />
      <div className="absolute bottom-0 left-0 right-0 h-[30vh] bg-gradient-to-t from-primary/20 to-transparent pointer-events-none mix-blend-screen" />

      {/* Title Area */}
      <div className="absolute top-24 z-20 flex flex-col items-center">
        <div className="flex items-center gap-3 mb-2">
          {connected && profile && (
            <Link href="/credits">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-2 rounded-full cursor-pointer hover:bg-primary/20 transition-all"
              >
                <Coins className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold font-orbitron">{profile.credits} CREDITS</span>
              </motion.div>
            </Link>
          )}
          <Link href="/vip">
            <VipBadge tier={tier} size="sm" showIcon />
          </Link>
        </div>
        <div className="mb-4 border-2 border-primary rounded-xl p-2.5 shadow-[0_0_20px_rgba(168,85,247,0.4)] backdrop-blur-sm bg-black/50">
           <TerminalSquare className="h-10 w-10 text-primary drop-shadow-[0_0_10px_rgba(168,85,247,1)]" />
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white uppercase tracking-[0.15em] sm:tracking-[0.2em] md:tracking-[0.3em] drop-shadow-[0_0_20px_rgba(168,85,247,1)]">
          The Oracle
        </h1>
      </div>

      {/* The Core / Sphere */}
      <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none mt-10">
        <OracleSphere isActive={isCoreActive} />
      </div>

      {/* Chat Interface */}
      <div className="container px-4 max-w-3xl mx-auto relative z-30 flex flex-col w-full h-[600px] mt-24">
        
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
                    ? "bg-primary/10 border border-primary/40 text-primary-foreground shadow-[0_0_15px_rgba(168,85,247,0.15)] backdrop-blur-xl"
                    : "bg-[#0f051e]/90 border border-primary/30 text-primary shadow-[0_0_20px_rgba(168,85,247,0.2)] backdrop-blur-2xl"
                }`}
              >
                {/* HUD scanline effect */}
                <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none opacity-20" />
                
                <div className="flex items-center gap-2 mb-3 relative z-10 border-b border-primary/20 pb-2">
                  <span className="text-[10px] text-primary/60 font-mono uppercase tracking-[0.3em]">
                    {msg.role === "user" ? "USER // DIRECTIVE" : "SYSTEM // ORACLE"}
                  </span>
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
              <div className="p-6 rounded-3xl w-full max-w-[90%] bg-[#0f051e]/80 border border-white/20 text-white/90 shadow-[0_0_25px_rgba(168,85,247,0.2)] backdrop-blur-2xl flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="ml-3 text-xs text-primary font-mono uppercase tracking-[0.2em] animate-pulse">
                  Processing...
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={sendMessage} className="flex gap-4 relative z-30 mb-8 max-w-[90%] mx-auto w-full">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="AWAITING DIRECTIVE..."
              className="flex-1 bg-[#0a001a]/60 backdrop-blur-xl border border-primary/30 text-primary focus:border-primary/80 h-14 text-base placeholder:text-primary/40 font-mono rounded-xl px-6 outline-none ring-0 shadow-[inset_0_0_15px_rgba(168,85,247,0.2)] transition-colors uppercase"
              disabled={loading || isOracleSpeaking}
              spellCheck={false}
              autoFocus
            />
          <Button
            type="submit"
            className="h-14 px-8 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#b026ff] via-primary to-[#5b148c] hover:from-[#c45eff] hover:via-[#a020f0] hover:to-[#4a0e7a] border border-primary/50 text-white font-bold uppercase tracking-[0.2em] rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.6),inset_0_0_15px_rgba(255,255,255,0.3)] transition-all active:scale-95 flex-shrink-0"
            disabled={loading || isOracleSpeaking}
          >
            Transmit
          </Button>
        </form>
      </div>
    </div>
  );
}
