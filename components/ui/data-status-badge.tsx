"use client";

import React from "react";
import { Activity, Clock, AlertCircle, RefreshCw, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type DataStatusType = "live" | "delayed" | "syncing" | "unavailable" | "error";

interface DataStatusBadgeProps {
  status: DataStatusType;
  source?: string;
  className?: string;
  showText?: boolean;
}

export function DataStatusBadge({
  status,
  source,
  className,
  showText = true,
}: DataStatusBadgeProps) {
  switch (status) {
    case "live":
      return (
        <span
          title={source ? `Live Feed verified via ${source}` : "Live Data Feed Active"}
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 shadow-[0_0_10px_rgba(52,211,153,0.2)]",
            className
          )}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          {showText && (source ? `LIVE // ${source}` : "LIVE")}
        </span>
      );

    case "delayed":
      return (
        <span
          title={source ? `Delayed Cache via ${source}` : "Delayed Telemetry Data"}
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-950/80 text-amber-400 border border-amber-500/40",
            className
          )}
        >
          <Clock className="w-3 h-3" />
          {showText && (source ? `DELAYED // ${source}` : "DELAYED")}
        </span>
      );

    case "syncing":
      return (
        <span
          title="Connecting to decentralized data providers..."
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-purple-950/80 text-purple-300 border border-purple-500/40 animate-pulse",
            className
          )}
        >
          <RefreshCw className="w-3 h-3 animate-spin" />
          {showText && "AWAITING LIVE DATA"}
        </span>
      );

    case "unavailable":
      return (
        <span
          title="Data feed is currently offline or awaiting liquidity pair indexing"
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium uppercase tracking-wider bg-zinc-900/90 text-zinc-400 border border-zinc-800",
            className
          )}
        >
          <Activity className="w-3 h-3 text-zinc-500" />
          {showText && "DATA UNAVAILABLE"}
        </span>
      );

    case "error":
      return (
        <span
          title="Data provider query encountered an error"
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-red-950/80 text-red-400 border border-red-500/40",
            className
          )}
        >
          <AlertCircle className="w-3 h-3" />
          {showText && "SOURCE OFFLINE"}
        </span>
      );

    default:
      return null;
  }
}
