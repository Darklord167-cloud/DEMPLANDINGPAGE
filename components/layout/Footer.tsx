"use client";

import { Shield, Send, Mail, Globe, ExternalLink, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

function XIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.005 4.15H5.059z"/>
    </svg>
  );
}

function DiscordIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 127.14 96.36" fill="currentColor">
      <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a67.58,67.58,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.31,60,73.31,53s5-12.74,11.43-12.74S96.2,46,96.12,53,91.08,65.69,84.69,65.69Z"/>
    </svg>
  );
}

export function Footer() {
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const subscribeMutation = useMutation({
    mutationFn: async (email: string) => {
      const res = await apiRequest("POST", "/api/subscribe", { email });
      return res.json();
    },
    onSuccess: (data) => {
      toast({ title: "Subscribed!", description: data.message });
      setEmail("");
    },
    onError: async (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to subscribe", variant: "destructive" });
    },
  });

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    subscribeMutation.mutate(email);
  };

  return (
    <footer className="bg-black border-t border-primary/20 pt-20 pb-8 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
      
      <div className="container px-6 relative z-10">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <Shield className="h-8 w-8 text-primary drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
              <span className="font-display text-2xl font-bold tracking-widest text-white text-glow">
                DARK EMPIRE
              </span>
            </div>
            <p className="text-muted-foreground max-w-sm mb-8 text-lg">
              The central command for next-generation digital sovereignty, powering the ecosystem with $DEMP.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild className="bg-primary hover:bg-primary/80 text-white font-bold tracking-wider shadow-[0_0_20px_-5px_var(--color-primary)] border border-primary/50">
                <a href="https://darkempirelords.com" target="_blank" rel="noreferrer">
                  <Globe className="mr-2 h-4 w-4" /> OFFICIAL WEBSITE
                </a>
              </Button>
              <Button asChild variant="outline" className="border-primary/50 text-primary hover:bg-primary/20 hover:text-white font-bold tracking-wider">
                <a href="/whitepaper">
                  WHITEPAPER
                </a>
              </Button>
            </div>
          </div>

          <div>
            <h4 className="font-heading font-bold text-white mb-6 uppercase tracking-wider text-glow">Join The Ranks</h4>
            <div className="space-y-4">
              <a href="https://x.com/darkhacker167" target="_blank" rel="noreferrer" className="flex items-center gap-3 text-muted-foreground hover:text-white transition-colors group" data-testid="link-twitter">
                <div className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-primary/50 group-hover:shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all">
                  <XIcon className="h-4 w-4" />
                </div>
                <span className="font-heading font-semibold text-lg">Follow on X</span>
                <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
              </a>
              <a href="https://t.me/DarkEmpireHQ" target="_blank" rel="noreferrer" className="flex items-center gap-3 text-muted-foreground hover:text-white transition-colors group" data-testid="link-telegram">
                <div className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-[#0088cc]/50 group-hover:shadow-[0_0_15px_rgba(0,136,204,0.3)] transition-all">
                  <Send className="h-4 w-4" />
                </div>
                <span className="font-heading font-semibold text-lg">Join Telegram</span>
                <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-[#0088cc]" />
              </a>
              <a href="https://discord.gg/VzhBv7YmM" target="_blank" rel="noreferrer" className="flex items-center gap-3 text-muted-foreground hover:text-white transition-colors group" data-testid="link-discord">
                <div className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-[#5865F2]/50 group-hover:shadow-[0_0_15px_rgba(88,101,242,0.3)] transition-all">
                  <DiscordIcon className="h-4 w-4" />
                </div>
                <span className="font-heading font-semibold text-lg">Join Discord</span>
                <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-[#5865F2]" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-heading font-bold text-white mb-6 uppercase tracking-wider">Newsletter</h4>
            <p className="text-sm text-muted-foreground mb-4">Subscribe for ecosystem updates.</p>
            <form onSubmit={handleSubscribe} className="flex gap-2" suppressHydrationWarning>
              <Input
                placeholder="Enter email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/5 border-white/10 text-white"
                disabled={subscribeMutation.isPending}
                data-testid="input-subscribe-email"
                suppressHydrationWarning
              />
              <Button
                type="submit"
                size="icon"
                className="bg-primary text-white hover:bg-primary/80"
                disabled={subscribeMutation.isPending}
                data-testid="button-subscribe"
              >
                {subscribeMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : subscribeMutation.isSuccess ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <Mail className="h-4 w-4" />
                )}
              </Button>
            </form>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 mt-8 flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
          <p className="font-mono text-xs text-white/50">&copy; {new Date().getFullYear()} Dark Empire Lords LLC. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0 font-mono text-xs items-center" suppressHydrationWarning>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-green-400 font-bold tracking-widest">SYSTEM_STATUS: ONLINE</span>
            </div>
            <span className="text-primary/70 tracking-widest">LATENCY: 12ms</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
