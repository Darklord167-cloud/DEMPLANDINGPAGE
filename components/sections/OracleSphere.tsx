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
  // 12 perimeter tick mark angles for the outer cardinal ring
  const ticks = Array.from({ length: 12 }).map((_, i) => i * 30);

  return (
    <motion.div
      whileHover={{ scale: 1.04 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`relative flex items-center justify-center w-[340px] h-[340px] md:w-[480px] md:h-[480px] mx-auto select-none ${
        isActive ? "oracle-structure-active" : "oracle-structure-idle"
      } ${className}`}
      aria-label="Ultra-Detailed 3D Holographic Oracle Sphere"
    >
      <div className="oracle-structure w-full h-full relative flex items-center justify-center">
        
        {/* LAYER 1: Inner Glowing Pulsing Core with Wireframe Grid Density */}
        <motion.div
          animate={{
            scale: isActive ? [1.03, 1.12, 1.03] : [1, 1.05, 1],
            opacity: isActive ? [0.92, 1, 0.92] : [0.8, 0.95, 0.8],
            rotateZ: isActive ? [0, 180, 360] : [0, 90, 180],
          }}
          transition={{
            duration: isActive ? 2.5 : 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="oracle-inner-sphere backdrop-blur-xl relative flex items-center justify-center shadow-[inset_0_0_60px_rgba(168,85,247,0.9),0_0_80px_rgba(168,85,247,0.7)]"
        >
          {/* Dense Inner Wireframe Grid Overlay */}
          <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.5)_0%,rgba(10,5,25,0.98)_85%)] overflow-hidden">
            <div className="absolute inset-0 bg-grid-pattern opacity-50 animate-pulse" />
          </div>

          {/* Central Oracle Core Light Beacon */}
          <motion.div 
            animate={{
              scale: isActive ? [1, 1.3, 1] : [1, 1.15, 1],
              opacity: isActive ? [0.8, 1, 0.8] : [0.6, 0.85, 0.6],
            }}
            transition={{
              duration: isActive ? 0.8 : 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-r from-purple-400 via-amber-300 to-purple-500 shadow-[0_0_45px_rgba(255,255,255,0.95),0_0_75px_rgba(168,85,247,1)]" 
          />
        </motion.div>

        {/* LAYER 2: Outer Rotating Amber-Gold Ring with Tick Marks & Cardinal Axis Markers (N/S/E/W) */}
        <div className="oracle-ring oracle-ring-outer border-amber-400/80 shadow-[0_0_35px_rgba(245,158,11,0.55)]">
          {/* Cardinal Axis Markers */}
          <div className="oracle-ring-cardinal oracle-cardinal-n flex items-center justify-center">
            <span className="absolute -top-5 text-[10px] font-mono font-black text-amber-300 tracking-tighter shadow-sm">N</span>
          </div>
          <div className="oracle-ring-cardinal oracle-cardinal-s flex items-center justify-center">
            <span className="absolute -bottom-5 text-[10px] font-mono font-black text-amber-300 tracking-tighter shadow-sm">S</span>
          </div>
          <div className="oracle-ring-cardinal oracle-cardinal-e flex items-center justify-center">
            <span className="absolute -right-5 text-[10px] font-mono font-black text-amber-300 tracking-tighter shadow-sm">E</span>
          </div>
          <div className="oracle-ring-cardinal oracle-cardinal-w flex items-center justify-center">
            <span className="absolute -left-5 text-[10px] font-mono font-black text-amber-300 tracking-tighter shadow-sm">W</span>
          </div>

          {/* 12 Perimeter Tick Marks */}
          {ticks.map((deg) => (
            <div
              key={deg}
              className="absolute w-1 h-2 bg-amber-400/70 left-1/2 top-0 origin-[50%_170px] md:origin-[50%_240px]"
              style={{ transform: `rotate(${deg}deg)` }}
            />
          ))}
        </div>

        {/* LAYER 3: Middle Inclined Polar Ring with Orbiting Data Node Points */}
        <div className="oracle-ring oracle-ring-mid border-purple-400/70 shadow-[0_0_30px_rgba(168,85,247,0.45)]">
          <div className="oracle-latitude-line border-amber-300/50" />

          {/* Orbiting Illuminated Data Nodes */}
          <div className="oracle-node oracle-node-1 bg-amber-300 shadow-[0_0_15px_#fbbf24]" />
          <div className="oracle-node oracle-node-2 bg-purple-300 shadow-[0_0_15px_#c084fc]" />
          <div className="oracle-node oracle-node-3 bg-white shadow-[0_0_15px_#ffffff]" />
          <div className="oracle-node oracle-node-4 absolute top-1/3 left-10 w-2.5 h-2.5 rounded-full bg-cyan-300 shadow-[0_0_14px_#67e8f9]" />
        </div>

        {/* LAYER 4: Inner Dotted Polar Ring */}
        <div className="oracle-ring oracle-ring-inner border-amber-500/90 shadow-[0_0_25px_rgba(245,158,11,0.6)]">
          <div className="oracle-node oracle-node-1" />
          <div className="oracle-node oracle-node-2" />
          <div className="oracle-node oracle-node-3" />
        </div>

        {/* LAYER 5: Reverse-Spinning Dashed Holographic Data Ring */}
        <div className="oracle-ring oracle-ring-holographic border-purple-500/80 shadow-[0_0_40px_rgba(168,85,247,0.4)]" />

        {/* LAYER 6: Energetic Purple Particle Streams Aura */}
        <div className="oracle-particles opacity-80" />

        {/* Active Data Pulse Shockwave Overlay */}
        {isActive && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0.95 }}
            animate={{ scale: 1.65, opacity: 0 }}
            transition={{ duration: 1.1, repeat: Infinity, ease: "easeOut" }}
            className="oracle-pulse-wave border-2 border-amber-400 shadow-[0_0_50px_rgba(245,158,11,0.9)]"
          />
        )}
      </div>
    </motion.div>
  );
});

export default OracleSphere;
