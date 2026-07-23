'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { collection, query, where, onSnapshot, doc, setDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Activity, Play, Square, TerminalSquare, Cpu } from 'lucide-react';
import { Input } from '@/components/ui/input';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export function CommandCenter() {
  const { user, loading, signInWithGoogle } = useAuth();
  const { toast } = useToast();
  const [bots, setBots] = useState<any[]>([]);
  const [isLoadingBots, setIsLoadingBots] = useState(true);
  const [isCommanding, setIsCommanding] = useState(false);
  const [tradingEngineUrl, setTradingEngineUrl] = useState("");

  useEffect(() => {
    const origin = window.location.origin;
    if (origin !== tradingEngineUrl) {
      const timer = setTimeout(() => {
        setTradingEngineUrl(origin);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [tradingEngineUrl]);

  useEffect(() => {
    if (!user) {
      const timer = setTimeout(() => {
        setIsLoadingBots(false);
      }, 0);
      return () => clearTimeout(timer);
    }

    const q = query(collection(db, 'bot_states'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const botsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBots(botsData);
      setIsLoadingBots(false);
    }, (err) => {
      setIsLoadingBots(false);
      handleFirestoreError(err, OperationType.GET, 'bot_states');
    });

    return () => unsubscribe();
  }, [user]);

  const sendCommand = async (action: 'start' | 'stop', botId?: string) => {
    if (!user) return;
    setIsCommanding(true);
    try {
      if (action === 'start') {
        const newBotRef = doc(collection(db, 'bot_states'));
        await setDoc(newBotRef, {
          userId: user.uid,
          pair: ["SOL-USDC", "BTC-USDC", "ETH-USDC", "JUP-USDC"][Math.floor(Math.random() * 4)],
          status: 'active',
          pnl: 0,
          createdAt: new Date().toISOString()
        });
      } else if (action === 'stop' && botId) {
        await updateDoc(doc(db, 'bot_states', botId), {
          status: 'stopped'
        });
      }

      toast({
        title: '🔒 Transmitted',
        description: `Successfully executed ${action.toUpperCase()} command locally on this domain.`,
      });
    } catch (error: any) {
      console.error("Command failed", error);
      handleFirestoreError(error, action === 'start' ? OperationType.CREATE : OperationType.UPDATE, 'bot_states');
      toast({
        title: '⚠️ Execution Failed',
        description: error.message || 'Failed to update trading engine state.',
        variant: 'destructive'
      });
    } finally {
      setIsCommanding(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#0a0a0a]/80 backdrop-blur-md border border-[#b026ff]/30 p-12 text-center rounded-2xl">
        <Loader2 className="animate-spin h-10 w-10 mx-auto text-[#b026ff] mb-4" />
        <p className="text-sm text-zinc-400 font-mono uppercase tracking-[0.2em] animate-pulse">Establishing Secure Uplink...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <Card className="bg-[#0a0a0a]/90 backdrop-blur-md border border-[#b026ff]/40 shadow-[0_0_30px_rgba(176,38,255,0.15)] rounded-2xl overflow-hidden">
        <CardHeader className="p-8 pb-4 text-center">
          <div className="w-14 h-14 rounded-xl bg-destructive/10 border border-destructive/30 flex items-center justify-center mx-auto mb-4">
            <TerminalSquare className="h-7 w-7 text-destructive animate-pulse" />
          </div>
          <CardTitle className="font-display font-black text-2xl uppercase tracking-wider text-white">
            Uplink Severed
          </CardTitle>
          <CardDescription className="text-zinc-400 font-mono text-xs max-w-sm mx-auto mt-2 leading-relaxed">
            Biometric credentials required. Authenticate to route a secure tunnel node into the Trading Engine.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-2 flex justify-center">
          <Button 
            onClick={signInWithGoogle} 
            variant="obsidian"
            className="w-full max-w-sm mx-auto h-12 text-xs font-mono font-bold uppercase tracking-widest rounded-xl"
          >
            CONNECT TO TRADING ENGINE
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-[#0a0a0a]/70 backdrop-blur-md border border-zinc-900 rounded-2xl overflow-hidden shadow-2xl">
        
        <div className="bg-zinc-950/80 px-6 py-4 border-b border-zinc-900/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </div>
            <div>
              <CardTitle className="font-display font-black text-lg text-white uppercase tracking-wider flex items-center gap-2">
                Active Trading Automations
              </CardTitle>
              <CardDescription className="text-zinc-500 font-mono text-[11px] uppercase tracking-widest mt-0.5">
                Local Frame // Domain: {tradingEngineUrl.replace('https://', '').replace('http://', '')}
              </CardDescription>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="border-[#b026ff]/40 bg-[#b026ff]/5 text-white hover:bg-[#b026ff]/20 hover:text-white text-xs font-mono font-bold uppercase tracking-wider h-10 px-4 rounded-xl transition-all shrink-0"
            onClick={() => sendCommand('start')}
            disabled={isCommanding}
          >
            {isCommanding ? (
              <Loader2 className="h-3 w-3 animate-spin mr-2" />
            ) : (
              <Play className="h-3 w-3 mr-2 text-[#b026ff] fill-[#b026ff]/20" />
            )} 
            Force Deploy New Bot
          </Button>
        </div>

        <CardContent className="p-6 md:p-8">
          {isLoadingBots ? (
            <div className="py-12 text-center">
              <Loader2 className="animate-spin h-8 w-8 mx-auto text-[#b026ff]" />
              <p className="mt-4 text-xs text-zinc-500 font-mono uppercase tracking-[0.2em] animate-pulse">Syncing Telemetry Fields...</p>
            </div>
          ) : bots.length === 0 ? (
            <div className="py-12 px-4 text-center border border-dashed border-zinc-800 rounded-xl bg-black/40 max-w-xl mx-auto my-4">
              <Cpu className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
              <p className="text-zinc-400 font-mono text-sm uppercase tracking-wide">No active automated processors deployed.</p>
              <p className="text-zinc-600 font-mono text-xs mt-2 leading-relaxed">
                Ensure network protocols are aligned. Execute Upgrade 2 on the infrastructure frame to broadcast states to this vault.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {bots.map((bot) => (
                <div 
                  key={bot.id} 
                  className={`bg-[#050505] border rounded-xl overflow-hidden transition-all duration-300 flex flex-col ${
                    bot.status === 'active' 
                      ? 'border-[#b026ff]/20 shadow-[0_0_15px_rgba(176,38,255,0.03)]' 
                      : 'border-zinc-900 opacity-60'
                  }`}
                >
                  <div className="p-4 bg-zinc-950/40 border-b border-zinc-900/60 flex items-center justify-between">
                    <span className="text-sm font-display font-black tracking-wide text-white">
                      {bot.pair || 'Null Frame'}
                    </span>
                    <span className={`font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 rounded border ${
                      bot.status === 'active' 
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                    }`}>
                      {bot.status || 'unknown'}
                    </span>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between gap-4">
                    <div className="flex justify-between items-center bg-black/40 border border-zinc-900 px-3 py-2 rounded-lg font-mono text-xs">
                      <span className="text-zinc-500 uppercase tracking-wider">Net Yield PnL</span>
                      <span className={`font-bold ${bot.pnl >= 0 ? "text-emerald-400" : "text-rose-500"}`}>
                        {bot.pnl >= 0 ? '+' : ''}{bot.pnl || '0.00'}
                      </span>
                    </div>
                    
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      className="w-full text-xs font-mono font-bold tracking-wider uppercase h-9 bg-zinc-950 border border-rose-950/50 text-rose-500 hover:bg-rose-950/20 hover:text-rose-400 rounded-lg transition-colors"
                      onClick={() => sendCommand('stop', bot.id)}
                      disabled={isCommanding}
                    >
                      <Square className="h-3 w-3 mr-2 fill-current" /> Terminate Node
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
