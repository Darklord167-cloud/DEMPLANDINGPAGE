"use client";

import React from "react";
import { motion } from "motion/react";

interface OracleSphereProps {
  isActive?: boolean;
  className?: string;
}

export const OracleSphere = React.memo(function OracleSphere({
  isActive = false,
  className = "",
}: OracleSphereProps) {
  // 12 perimeter tick marks for cardinal target ring
  const ticks = Array.from({ length: 12 }).map((_, i) => i * 30);
  
  // Floating data stream metrics (Ultron HUD data lines)
  const telemetryData = [
    { text: "CORE_SYNC // 99.98%", top: "12%", left: "-18%" },
    { text: "0x7F4A_ULTRON_NODE", top: "75%", left: "-22%" },
    { text: "LATENCY: 0.42ms", top: "20%", right: "-20%" },
    { text: "NEURAL_LINK: ACTIVE", top: "80%", right: "-24%" },
  ];

  return (
    <motion.div
      whileHover={{ scale: 1.04 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`relative flex items-center justify-center w-[340px] h-[340px] md:w-[480px] md:h-[480px] mx-auto select-none ${
        isActive ? "oracle-structure-active" : "oracle-structure-idle"
      } ${className}`}
      aria-label="Ultron AI Holographic Core Terminal"
    >
      {/* Floating Holographic Telemetry Data Stream Overlay */}
      <div className="absolute inset-0 pointer-events-none z-30 font-mono text-[9px] md:text-[10px] font-bold text-[#ff7700] tracking-widest hidden sm:block">
        {telemetryData.map((data, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0.3, y: 0 }}
            animate={{ 
              opacity: [0.4, 0.95, 0.4], 
              y: [0, -8, 0],
              textShadow: [
                "0 0 8px rgba(255,102,0,0.8)",
                "0 0 16px rgba(0,210,255,0.9)",
                "0 0 8px rgba(255,102,0,0.8)"
              ]
            }}
            transition={{ duration: 3 + idx, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bg-[#030d24]/80 backdrop-blur-md px-2.5 py-1 rounded border border-[#ff6600]/40 shadow-[0_0_15px_rgba(255,102,0,0.3)] flex items-center gap-1.5"
            style={{ top: data.top, left: data.left, right: data.right }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#00d2ff] animate-ping" />
            <span>{data.text}</span>
          </motion.div>
        ))}
      </div>

      <div className="oracle-structure w-full h-full relative flex items-center justify-center">
        
        {/* LAYER 1: Deep Blue & Glowing Orange Inner Sphere Core */}
        <motion.div
          animate={{
            scale: isActive ? [1.03, 1.14, 1.03] : [1, 1.05, 1],
            opacity: isActive ? [0.95, 1, 0.95] : [0.85, 0.98, 0.85],
            rotateZ: isActive ? [0, 180, 360] : [0, 90, 180],
          }}
          transition={{
            duration: isActive ? 2.2 : 7.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="oracle-inner-sphere backdrop-blur-xl relative flex items-center justify-center shadow-[inset_0_0_60px_rgba(255,102,0,0.95),0_0_90px_rgba(0,180,255,0.85)] border border-[#ff6600]/40"
        >
          {/* Dense Blue/Orange Cybernetic Grid Lattice */}
          <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,102,0,0.65)_0%,rgba(3,12,32,0.98)_85%)] overflow-hidden">
            <div className="absolute inset-0 bg-grid-pattern opacity-60 animate-pulse" />
            {/* Horizontal Ultron Scanning Laser Line */}
            <div className="ultron-laser-scan" />
          </div>

          {/* Central AI Mind Core Beacon */}
          <motion.div 
            animate={{
              scale: isActive ? [1, 1.35, 1] : [1, 1.15, 1],
              boxShadow: isActive 
                ? ["0 0 60px #ffffff, 0 0 120px #ff5500", "0 0 90px #ffffff, 0 0 180px #00d2ff", "0 0 60px #ffffff, 0 0 120px #ff5500"]
                : ["0 0 45px #ffffff, 0 0 80px #ff6600", "0 0 60px #ffffff, 0 0 110px #00bfff", "0 0 45px #ffffff, 0 0 80px #ff6600"],
            }}
            transition={{
              duration: isActive ? 0.7 : 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-r from-[#ffffff] via-[#ff6600] to-[#00d2ff] relative flex items-center justify-center"
          >
            {/* Core Reticle Ring */}
            <div className="w-8 h-8 rounded-full border border-white/90 bg-white/30 backdrop-blur-sm animate-ping" />
          </motion.div>
        </motion.div>

        {/* LAYER 2: Outer Rotating Glowing Orange Ring with N/S/E/W Cardinal Targeting */}
        <div className="oracle-ring oracle-ring-outer border-[#ff6600] shadow-[0_0_40px_rgba(255,102,0,0.65)]">
          {/* Cardinal Axis Markers */}
          <div className="oracle-ring-cardinal oracle-cardinal-n flex items-center justify-center bg-[#ff6600] shadow-[0_0_15px_#ff6600]">
            <span className="absolute -top-5 text-[10px] font-mono font-black text-[#ff8800] tracking-tighter">N</span>
          </div>
          <div className="oracle-ring-cardinal oracle-cardinal-s flex items-center justify-center bg-[#ff6600] shadow-[0_0_15px_#ff6600]">
            <span className="absolute -bottom-5 text-[10px] font-mono font-black text-[#ff8800] tracking-tighter">S</span>
          </div>
          <div className="oracle-ring-cardinal oracle-cardinal-e flex items-center justify-center bg-[#00d2ff] shadow-[0_0_15px_#00d2ff]">
            <span className="absolute -right-5 text-[10px] font-mono font-black text-[#00d2ff] tracking-tighter">E</span>
          </div>
          <div className="oracle-ring-cardinal oracle-cardinal-w flex items-center justify-center bg-[#00d2ff] shadow-[0_0_15px_#00d2ff]">
            <span className="absolute -left-5 text-[10px] font-mono font-black text-[#00d2ff] tracking-tighter">W</span>
          </div>

          {/* 12 Perimeter Tick Marks */}
          {ticks.map((deg) => (
            <div
              key={deg}
              className="absolute w-1 h-2 bg-[#ff8800]/80 left-1/2 top-0 origin-[50%_170px] md:origin-[50%_240px]"
              style={{ transform: `rotate(${deg}deg)` }}
            />
          ))}
        </div>

        {/* LAYER 3: Mid Orbital Deep Blue Holographic Ring with Orbiting Nodes */}
        <div className="oracle-ring oracle-ring-mid border-[#00d2ff]/80 shadow-[0_0_35px_rgba(0,210,255,0.55)]">
          <div className="oracle-latitude-line border-[#ff6600]/60" />

          {/* Orbiting Illuminated Nodes */}
          <div className="oracle-node oracle-node-1 bg-[#ff6600] shadow-[0_0_18px_#ff6600]" />
          <div className="oracle-node oracle-node-2 bg-[#00d2ff] shadow-[0_0_18px_#00d2ff]" />
          <div className="oracle-node oracle-node-3 bg-white shadow-[0_0_18px_#ffffff]" />
          <div className="oracle-node oracle-node-4 absolute top-1/3 left-10 w-3 h-3 rounded-full bg-[#ffaa00] shadow-[0_0_16px_#ffaa00]" />
        </div>

        {/* LAYER 4: Inner Dotted Orange Polar Ring */}
        <div className="oracle-ring oracle-ring-inner border-[#ff8800] shadow-[0_0_30px_rgba(255,136,0,0.7)]">
          <div className="oracle-node oracle-node-1 bg-white" />
          <div className="oracle-node oracle-node-2 bg-[#00d2ff]" />
          <div className="oracle-node oracle-node-3 bg-[#ff5500]" />
        </div>

        {/* LAYER 5: Reverse-Spinning Blue/Orange Holographic Ring */}
        <div className="oracle-ring oracle-ring-holographic border-[#ff6600]/90 shadow-[0_0_45px_rgba(255,102,0,0.5)]" />

        {/* LAYER 6: Energetic Holographic Stream Particles */}
        <div className="oracle-particles opacity-90" />

        {/* Active Data Pulse Shockwave Overlay */}
        {isActive && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0.95 }}
            animate={{ scale: 1.75, opacity: 0 }}
            transition={{ duration: 1.1, repeat: Infinity, ease: "easeOut" }}
            className="oracle-pulse-wave border-2 border-[#ff6600] shadow-[0_0_60px_rgba(255,102,0,0.95)]"
          />
        )}
      </div>
    </motion.div>
  );
});

export default OracleSphere;
