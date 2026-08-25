"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";

interface PayPalHostedButtonProps {
  hostedButtonId?: string;
  className?: string;
}

export function PayPalHostedButton({
  hostedButtonId = "UE7APKRZ2AC4Q",
  className = "",
}: PayPalHostedButtonProps) {
  const containerId = `paypal-container-${hostedButtonId}`;
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRendered, setIsRendered] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const renderHostedButton = () => {
      if (!window.paypal || !window.paypal.HostedButtons) {
        return false;
      }

      if (!containerRef.current) {
        return false;
      }

      try {
        // Clear previous instances if any
        containerRef.current.innerHTML = "";
        
        window.paypal
          .HostedButtons({
            hostedButtonId,
          })
          .render(`#${containerId}`)
          .then(() => {
            if (isMounted) setIsRendered(true);
          })
          .catch((err: any) => {
            console.error("[PayPal HostedButton Error]:", err);
            if (isMounted) setError("Failed to render PayPal hosted button.");
          });

        return true;
      } catch (err: any) {
        console.error("[PayPal HostedButtons Init Error]:", err);
        if (isMounted) setError("Unable to load PayPal checkout button.");
        return false;
      }
    };

    if (renderHostedButton()) {
      return () => {
        isMounted = false;
      };
    }

    // Poll until window.paypal.HostedButtons is available
    const interval = setInterval(() => {
      if (renderHostedButton()) {
        clearInterval(interval);
      }
    }, 250);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      if (isMounted && !isRendered) {
        setError("PayPal service timed out. Please refresh the page.");
      }
    }, 12000);

    return () => {
      isMounted = false;
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [hostedButtonId, containerId, isRendered]);

  return (
    <div className={`w-full flex flex-col items-center justify-center ${className}`}>
      {error && (
        <div className="p-3 my-2 rounded-lg bg-red-950/40 border border-red-500/30 text-red-300 text-xs font-mono flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!isRendered && !error && (
        <div className="h-12 w-full max-w-sm bg-zinc-900/60 border border-primary/20 rounded-xl flex items-center justify-center space-x-2 text-xs font-mono text-muted-foreground animate-pulse my-2">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span>Loading Secure PayPal Checkout...</span>
        </div>
      )}

      <div
        id={containerId}
        ref={containerRef}
        className={`w-full flex justify-center ${!isRendered ? "hidden" : "block"}`}
      />
    </div>
  );
}
