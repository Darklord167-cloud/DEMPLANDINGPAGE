"use client";

import { useState, useEffect, useCallback } from "react";

// Shared module state so all component subscribers stay in sync
let globalMuted = true; // DEFAULT: MUTED to respect browser autoplay policies
const listeners = new Set<(muted: boolean) => void>();

function notifyListeners() {
  listeners.forEach((listener) => listener(globalMuted));
}

// Lazy-initialized Web Audio API Context
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;

  try {
    if (!audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        audioCtx = new AudioCtxClass();
      }
    }

    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }
  } catch (err) {
    console.warn("AudioContext initialization error:", err);
  }

  return audioCtx;
}

export interface AudioHUDControls {
  isMuted: boolean;
  toggleMute: () => void;
  playConnectSound: () => void;
  playTradeClick: () => void;
  playWhaleAlert: () => void;
}

export function useAudioHUD(): AudioHUDControls {
  const [isMuted, setIsMuted] = useState<boolean>(globalMuted);

  useEffect(() => {
    // Read initial preference from localStorage if available
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("dark_empire_audio_muted");
      if (saved !== null) {
        globalMuted = saved === "true";
        setIsMuted(globalMuted);
      }
    }

    const handler = (muted: boolean) => setIsMuted(muted);
    listeners.add(handler);
    return () => {
      listeners.delete(handler);
    };
  }, []);

  const toggleMute = useCallback(() => {
    globalMuted = !globalMuted;
    if (typeof window !== "undefined") {
      localStorage.setItem("dark_empire_audio_muted", String(globalMuted));
    }
    notifyListeners();

    // If unmuting, resume AudioContext and play confirmation chime
    if (!globalMuted) {
      const ctx = getAudioContext();
      if (ctx) {
        // Synthesize quick power-up chime confirmation
        playConnectSoundInternal();
      }
    }
  }, []);

  // 1. playConnectSound: Ascending sine wave sweep (400Hz to 850Hz) "power up" chime
  const playConnectSoundInternal = () => {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    
    // Main chime oscillator
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(400, now);
    osc1.frequency.exponentialRampToValueAtTime(850, now + 0.2);

    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.linearRampToValueAtTime(0.18, now + 0.03);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    // Harmonic sub-oscillator
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(600, now);
    osc2.frequency.exponentialRampToValueAtTime(1200, now + 0.2);

    gain2.gain.setValueAtTime(0.001, now);
    gain2.gain.linearRampToValueAtTime(0.08, now + 0.03);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.26);
    osc2.stop(now + 0.26);
  };

  const playConnectSound = useCallback(() => {
    if (globalMuted) return;
    playConnectSoundInternal();
  }, []);

  // 2. playTradeClick: Very short, crisp oscillator click with fast decay
  const playTradeClick = useCallback(() => {
    if (globalMuted) return;

    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.04);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  }, []);

  // 3. playWhaleAlert: Deep low-frequency bass pulse (50Hz triangle) + harsh sawtooth blip warning klaxon
  const playWhaleAlert = useCallback(() => {
    if (globalMuted) return;

    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Sub-bass triangle pulse (50Hz)
    const bassOsc = ctx.createOscillator();
    const bassGain = ctx.createGain();

    bassOsc.type = "triangle";
    bassOsc.frequency.setValueAtTime(50, now);
    bassOsc.frequency.linearRampToValueAtTime(35, now + 0.45);

    bassGain.gain.setValueAtTime(0.001, now);
    bassGain.gain.linearRampToValueAtTime(0.35, now + 0.05);
    bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    // Harsh warning sawtooth klaxon blip
    const klaxonOsc = ctx.createOscillator();
    const klaxonGain = ctx.createGain();

    klaxonOsc.type = "sawtooth";
    klaxonOsc.frequency.setValueAtTime(320, now);
    klaxonOsc.frequency.exponentialRampToValueAtTime(160, now + 0.3);

    klaxonGain.gain.setValueAtTime(0.001, now);
    klaxonGain.gain.linearRampToValueAtTime(0.15, now + 0.03);
    klaxonGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    bassOsc.connect(bassGain);
    bassGain.connect(ctx.destination);

    klaxonOsc.connect(klaxonGain);
    klaxonGain.connect(ctx.destination);

    bassOsc.start(now);
    klaxonOsc.start(now);

    bassOsc.stop(now + 0.46);
    klaxonOsc.stop(now + 0.36);
  }, []);

  return {
    isMuted,
    toggleMute,
    playConnectSound,
    playTradeClick,
    playWhaleAlert,
  };
}
