"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

declare global {
  interface Window {
    paypal?: any;
  }
}

interface PayPalButtonProps {
  amount: number;
  credits: number;
  walletAddress: string;
  onSuccess?: (details: any) => void;
  onError?: (err: any) => void;
  className?: string;
}

export function PayPalButton({
  amount,
  credits,
  walletAddress,
  onSuccess,
  onError,
  className = "",
}: PayPalButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let buttonsInstance: any = null;

    const initPayPal = () => {
      if (!window.paypal || !containerRef.current) {
        return;
      }

      // Clear container before rendering
      containerRef.current.innerHTML = "";
      setErrorMessage(null);

      try {
        buttonsInstance = window.paypal.Buttons({
          style: {
            layout: "vertical",
            color: "gold",
            shape: "rect",
            label: "paypal",
            height: 44,
          },
          createOrder: (data: any, actions: any) => {
            if (!walletAddress) {
              toast.error("Please connect your wallet first");
              throw new Error("Wallet not connected");
            }
            return actions.order.create({
              purchase_units: [
                {
                  description: `Dark Empire ${credits} Credits (${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)})`,
                  custom_id: walletAddress,
                  amount: {
                    currency_code: "USD",
                    value: amount.toFixed(2),
                  },
                },
              ],
            });
          },
          onApprove: async (data: any, actions: any) => {
            setIsPending(true);
            try {
              const order = await actions.order.capture();
              
              // Call backend to fulfill credits idempotently
              const res = await fetch("/api/paypal/capture", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  orderId: data.orderID,
                  walletAddress,
                  creditsAmount: credits,
                  amountTotal: amount,
                  orderDetails: order,
                }),
              });

              const result = await res.json();
              if (!res.ok || !result.success) {
                throw new Error(result.message || "Failed to finalize credit fulfillment.");
              }

              setIsSuccess(true);
              toast.success(`Payment verified! ${credits} credits added to your account.`);
              if (onSuccess) onSuccess(order);
            } catch (err: any) {
              console.error("[PayPal Capture Error]:", err);
              toast.error(err.message || "Failed to verify PayPal transaction.");
              if (onError) onError(err);
            } finally {
              setIsPending(false);
            }
          },
          onError: (err: any) => {
            console.error("[PayPal SDK Error]:", err);
            setErrorMessage("PayPal checkout encounter an issue. Please try again.");
            if (onError) onError(err);
          },
          onCancel: () => {
            toast.info("PayPal payment canceled");
          },
        });

        if (buttonsInstance.isEligible()) {
          buttonsInstance.render(containerRef.current);
          if (isMounted) setIsLoaded(true);
        } else {
          setErrorMessage("PayPal buttons are not eligible for this configuration");
        }
      } catch (err: any) {
        console.error("[PayPal Init Error]:", err);
        setErrorMessage("Unable to initialize PayPal. Please refresh.");
      }
    };

    // Poll for window.paypal if script is still loading
    if (window.paypal) {
      initPayPal();
    } else {
      const interval = setInterval(() => {
        if (window.paypal) {
          clearInterval(interval);
          if (isMounted) initPayPal();
        }
      }, 300);

      const timeout = setTimeout(() => {
        clearInterval(interval);
        if (isMounted && !window.paypal) {
          setErrorMessage("PayPal SDK timed out loading. Check your internet connection.");
        }
      }, 10000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
        isMounted = false;
        if (buttonsInstance && buttonsInstance.close) {
          buttonsInstance.close();
        }
      };
    }

    return () => {
      isMounted = false;
      if (buttonsInstance && buttonsInstance.close) {
        buttonsInstance.close();
      }
    };
  }, [amount, credits, walletAddress, onSuccess, onError]);

  if (isSuccess) {
    return (
      <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-center space-y-2 font-mono text-xs">
        <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
        <p className="font-bold">Payment Verified</p>
        <p className="text-muted-foreground">{credits} Credits added to {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</p>
      </div>
    );
  }

  return (
    <div className={`w-full relative ${className}`}>
      {isPending && (
        <div className="absolute inset-0 z-20 bg-black/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center space-y-2 font-mono text-xs text-amber-300">
          <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
          <span>Fulfilling Credits On-Chain...</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 mb-2 rounded-lg bg-red-950/40 border border-red-500/30 text-red-300 text-xs font-mono flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {!isLoaded && !errorMessage && (
        <div className="h-11 w-full bg-zinc-900 border border-primary/20 rounded-lg flex items-center justify-center space-x-2 text-xs font-mono text-muted-foreground animate-pulse">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span>Loading PayPal & Venmo...</span>
        </div>
      )}

      <div ref={containerRef} className="w-full relative z-10" />
    </div>
  );
}
