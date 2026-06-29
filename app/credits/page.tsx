"use client";

import { useState, useEffect, Suspense } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useWallet } from "@solana/wallet-adapter-react";
import { Loader2, Coins, CreditCard, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const PRICING_PLANS = [
  {
    credits: 100,
    price: 10,
    description: "Perfect for testing the Oracle.",
    popular: false,
  },
  {
    credits: 500,
    price: 40,
    description: "Best value for expanding your empire.",
    popular: true,
  },
  {
    credits: 1000,
    price: 75,
    description: "Unlimited power for high-level operators.",
    popular: false,
  },
];

function CreditsContent() {
  const { publicKey, connected } = useWallet();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<number | null>(null);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: publicKey?.toBase58() }),
      });
      const data = await res.json();
      setProfile(data);
    } catch (err) {
      console.error("Failed to fetch profile", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchParams.get("success")) {
      toast.success("Payment successful! Credits applied to your account.");
      router.replace("/credits");
    } else if (searchParams.get("canceled")) {
      toast.error("Payment canceled.");
      router.replace("/credits");
    }
  }, [searchParams, router]);

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

  const handleBuy = async (amount: number, index: number) => {
    if (!connected || !publicKey) {
      toast.error("Please connect your wallet first.");
      return;
    }

    setCheckoutLoading(index);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          walletAddress: publicKey.toBase58(),
        }),
      });

      const { url, message } = await res.json();
      if (url) {
        window.location.assign(url);
      } else {
        toast.error(message || "Checkout failed.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred.");
    } finally {
      setCheckoutLoading(null);
    }
  };

  return (
    <div className="container max-w-6xl py-12">
      <div className="flex flex-col items-center mb-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 mb-4 rounded-full bg-primary/10"
        >
          <Coins className="w-8 h-8 text-primary" />
        </motion.div>
        <h1 className="text-4xl font-bold tracking-tight font-orbitron mb-4">Empire Credits</h1>
        <p className="text-muted-foreground max-w-2xl text-lg">
          Power your digital empire with Dark Empire Credits. Use them for Oracle queries, 
          AI operations, and restricted system access.
        </p>

        {connected && profile && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-8 p-6 rounded-2xl bg-muted/50 border flex flex-col md:flex-row items-center gap-6 justify-between w-full"
          >
            <div className="flex items-center gap-6">
              <div className="text-left">
                <p className="text-sm text-muted-foreground uppercase tracking-wider font-bold">Your Balance</p>
                <p className="text-3xl font-orbitron text-primary">{profile.credits} Credits</p>
              </div>
              <div className="w-px h-12 bg-border mx-2 hidden md:block" />
              <div className="text-left">
                <p className="text-sm text-muted-foreground uppercase tracking-wider font-bold">Connected Wallet</p>
                <p className="font-mono text-xs">{publicKey?.toBase58().slice(0, 12)}...</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={async () => {
                  setLoading(true);
                  try {
                    if (!publicKey) {
                      toast.error("Please connect wallet first.");
                      setLoading(false);
                      return;
                    }
                    const res = await fetch("/api/stripe/portal", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ walletAddress: publicKey.toBase58() }),
                    });
                    const data = await res.json();
                    if (data.url) {
                      window.location.assign(data.url);
                    } else {
                      toast.error(data.message || "Could not open billing portal.");
                    }
                  } catch (err) {
                     toast.error("An error occurred loading the portal.");
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
              >
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CreditCard className="w-4 h-4 mr-2" />}
                Billing History
              </Button>
            </div>
          </motion.div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {PRICING_PLANS.map((plan, index) => (
          <motion.div
            key={plan.credits}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`relative h-full flex flex-col ${plan.popular ? 'border-primary shadow-lg shadow-primary/10' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                  Best Value
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl font-orbitron">{plan.credits} Credits</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="text-4xl font-bold mb-6 font-orbitron">
                  ${plan.price}
                  <span className="text-base font-normal text-muted-foreground ml-1">USD</span>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span>Instant delivery to wallet</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span>Oracle Priority access</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span>Unlock automation systems</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full font-bold group" 
                  size="lg"
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => handleBuy(plan.price, index)}
                  disabled={checkoutLoading !== null}
                >
                  {checkoutLoading === index ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <CreditCard className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                  )}
                  Purchase via Stripe
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="mt-20 text-center p-12 border rounded-3xl bg-muted/20">
        <h2 className="text-2xl font-bold mb-4 font-orbitron">Secure Fiat Bridge</h2>
        <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
          We use Stripe for secure fiat transactions. Your payment information is encrypted and handled 
          entirely by Stripe. Credits are applied instantly to your account linked to your wallet.
        </p>
        <div className="flex justify-center items-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
           {/* Placeholder for payment logos */}
           <div className="font-bold flex items-center gap-2"><CreditCard /> Visa</div>
           <div className="font-bold flex items-center gap-2"><CreditCard /> Mastercard</div>
           <div className="font-bold flex items-center gap-2"><CreditCard /> Amex</div>
        </div>
      </div>
    </div>
  );
}

export default function CreditsPage() {
  return (
    <Suspense fallback={
      <div className="container flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <CreditsContent />
    </Suspense>
  );
}
