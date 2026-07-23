'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { auth } from '@/lib/firebase';

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

export function SecureKeyVault() {
  const { user, loading, signInWithGoogle, logout } = useAuth();
  const { toast } = useToast();
  
  const [solanaKey, setSolanaKey] = useState('');
  const [okxApiKey, setOkxApiKey] = useState('');
  const [okxSecret, setOkxSecret] = useState('');
  const [okxPassphrase, setOkxPassphrase] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingKeys, setIsLoadingKeys] = useState(false);

  const loadKeys = async () => {
    setIsLoadingKeys(true);
    try {
      if (!user) return;
      const keysDoc = await getDoc(doc(db, `users/${user.uid}/private`, 'keys'));
      if (keysDoc.exists()) {
        const data = keysDoc.data();
        if (data.solanaPrivateKey) setSolanaKey(data.solanaPrivateKey);
        if (data.okxApiKey) setOkxApiKey(data.okxApiKey);
        if (data.okxApiSecret) setOkxSecret(data.okxApiSecret);
        if (data.okxPassphrase) setOkxPassphrase(data.okxPassphrase);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `users/${user?.uid}/private/keys`);
    } finally {
      setIsLoadingKeys(false);
    }
  };

  useEffect(() => {
    if (user) {
      const timer = setTimeout(() => {
        loadKeys();
      }, 0);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const saveKeys = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await setDoc(doc(db, `users/${user.uid}/private`, 'keys'), {
        solanaPrivateKey: solanaKey,
        okxApiKey: okxApiKey,
        okxApiSecret: okxSecret,
        okxPassphrase: okxPassphrase,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      toast({
        title: 'Vault Encrypted',
        description: 'Your execution keys have been securely stored in the engine.',
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user?.uid}/private/keys`);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-black/40 border-white/10 cyber-panel p-8 text-center border-primary/20">
        <Loader2 className="animate-spin h-8 w-8 mx-auto text-primary" />
        <p className="mt-4 text-muted-foreground font-mono">Initializing Neural Connection...</p>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card className="bg-black/40 border-white/10 cyber-panel">
        <CardHeader>
          <CardTitle className="font-orbitron text-2xl text-primary">Secure Key Vault</CardTitle>
          <CardDescription className="text-white/70 font-mono">
            Authentication Required: Ensure identity sync with the Trading Engine.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 flex justify-center">
          <Button onClick={signInWithGoogle} variant="obsidian" className="w-full max-w-md h-12 text-xs font-mono font-bold tracking-widest rounded-xl">
            CONNECT WITH GOOGLE (SYNC TRADING ENGINE)
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-black/40 border-white/10 cyber-panel max-w-2xl">
      <CardHeader>
        <CardTitle className="font-orbitron text-2xl text-primary flex justify-between items-center">
          <span>Secure Key Vault</span>
          <Button variant="ghost" onClick={logout} className="text-xs font-mono h-6 px-2 hover:bg-destructive/20 hover:text-destructive text-muted-foreground">
            DISCONNECT
          </Button>
        </CardTitle>
        <CardDescription className="text-white/70 font-mono">
          Inject credentials into the encrypted vault overlay. These are mapped directly to `users/{user.uid}/private/keys` 
          and consumed securely by the remote trading engine for autonomous execution.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {isLoadingKeys ? (
          <div className="py-12 text-center">
             <Loader2 className="animate-spin h-8 w-8 mx-auto text-primary" />
             <p className="mt-4 text-muted-foreground font-mono text-sm">Decrypting Vault...</p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <Label className="text-primary font-mono text-xs tracking-wider">SOLANA PRIVATE KEY</Label>
              <Input 
                type="password" 
                placeholder="Enter Base58 encoded private key" 
                value={solanaKey} 
                onChange={e => setSolanaKey(e.target.value)}
                className="font-mono bg-black/50 border-white/20 focus:border-primary text-xs"
              />
              <p className="text-[10px] text-muted-foreground font-mono">Required for on-chain swaps (Jupiter/Pump.fun).</p>
            </div>

            <div className="pt-4 border-t border-white/10"></div>

            <div className="space-y-4">
              <h4 className="font-rajdhani font-semibold tracking-widest text-lg">OKX API CREDENTIALS</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-primary/80 font-mono text-xs tracking-wider">API KEY</Label>
                  <Input 
                    placeholder="Enter OKX API Key" 
                    value={okxApiKey} 
                    onChange={e => setOkxApiKey(e.target.value)}
                    className="font-mono bg-black/50 border-white/20 focus:border-primary/80 text-xs text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-primary/80 font-mono text-xs tracking-wider">SECRET KEY</Label>
                  <Input 
                    type="password"
                    placeholder="Enter OKX Secret Key" 
                    value={okxSecret} 
                    onChange={e => setOkxSecret(e.target.value)}
                    className="font-mono bg-black/50 border-white/20 focus:border-primary/80 text-xs"
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-primary/80 font-mono text-xs tracking-wider">PASSPHRASE</Label>
                  <Input 
                    type="password"
                    placeholder="Enter OKX Passphrase" 
                    value={okxPassphrase} 
                    onChange={e => setOkxPassphrase(e.target.value)}
                    className="font-mono bg-black/50 border-white/20 focus:border-primary/80 text-xs"
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>

      <CardFooter className="bg-black/60 border-t border-white/5 p-4 flex justify-end">
        <Button 
          disabled={isSaving || isLoadingKeys} 
          onClick={saveKeys}
          variant="obsidian"
          className="w-full sm:w-auto px-6 h-11 text-xs font-mono font-bold tracking-widest rounded-xl"
        >
          {isSaving ? (
             <><Loader2 className="animate-spin mr-2 h-4 w-4" /> ENCRYPTING...</>
          ) : 'SECURE INJECT CREDENTIALS'}
        </Button>
      </CardFooter>
    </Card>
  );
}
