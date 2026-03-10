import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Transaction } from "@shared/schema";
import { TxRow } from "@/components/tx-row";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Wallet, Send, ArrowDownLeft, Copy, RefreshCw,
  Plus, Import, Shield, Eye, EyeOff, Zap,
} from "lucide-react";
import { formatZTH, formatCompact, shortAddress, generateSeedWords, generateAddress, DEMO_WALLET_ADDRESS } from "@/lib/chain-utils";
import { useToast } from "@/hooks/use-toast";

type Network = "mainnet" | "testnet";

interface WalletData {
  address: string;
  balance: string;
  stakedBalance: string;
  nonce: number;
  transactions: Transaction[];
}

export default function WalletPage() {
  const [address, setAddress] = useState<string | null>(() => localStorage.getItem("zerith-wallet-address"));
  const [network, setNetwork] = useState<Network>(() => (localStorage.getItem("zerith-network") as Network) || "mainnet");
  const [showBalance, setShowBalance] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [seedWords, setSeedWords] = useState<string[]>([]);
  const [seedConfirmed, setSeedConfirmed] = useState(false);
  const [importSeed, setImportSeed] = useState("");
  const { toast } = useToast();

  const { data: wallet, isLoading, refetch } = useQuery<WalletData>({
    queryKey: ["/api/wallet", address, network],
    queryFn: async () => {
      if (!address) throw new Error("No wallet");
      const res = await fetch(`/api/wallet/${address}?network=${network}`);
      return res.json();
    },
    enabled: !!address,
    refetchInterval: 8000,
  });

  const switchNetwork = (n: Network) => {
    setNetwork(n);
    localStorage.setItem("zerith-network", n);
    toast({ title: `Switched to ${n}`, description: `RPC: ${n === "mainnet" ? "rpc.zerith.replit.com" : "testnet-rpc.zerith.replit.com"}` });
  };

  const createWallet = () => {
    const words = generateSeedWords();
    setSeedWords(words);
    setSeedConfirmed(false);
    setShowCreateDialog(true);
  };

  const confirmCreateWallet = () => {
    if (!seedConfirmed) {
      toast({ title: "Please confirm", description: "You must confirm you've saved your seed phrase.", variant: "destructive" });
      return;
    }
    const newAddress = generateAddress(seedWords.join(" "));
    setAddress(newAddress);
    localStorage.setItem("zerith-wallet-address", newAddress);
    setShowCreateDialog(false);
    toast({ title: "Wallet Created", description: `Address: ${shortAddress(newAddress)}` });
  };

  const importWallet = () => {
    const words = importSeed.trim().split(/\s+/);
    if (words.length < 12) {
      toast({ title: "Invalid seed phrase", description: "Please enter a valid 12 or 24-word seed phrase.", variant: "destructive" });
      return;
    }
    const newAddress = generateAddress(importSeed.trim());
    setAddress(newAddress);
    localStorage.setItem("zerith-wallet-address", newAddress);
    setShowImportDialog(false);
    setImportSeed("");
    toast({ title: "Wallet Imported", description: `Address: ${shortAddress(newAddress)}` });
  };

  const useDemoWallet = () => {
    setAddress(DEMO_WALLET_ADDRESS);
    localStorage.setItem("zerith-wallet-address", DEMO_WALLET_ADDRESS);
    toast({ title: "Demo wallet loaded", description: "Using demo wallet address." });
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: "Address copied to clipboard." });
  };

  if (!address) {
    return (
      <div className="flex flex-col h-full overflow-auto">
        <div className="border-b border-border/50 px-6 py-6">
          <div className="flex items-center gap-3">
            <Wallet className="w-6 h-6 text-primary" />
            <h1 className="font-display text-2xl font-bold">Zerith Wallet</h1>
          </div>
          <p className="text-muted-foreground text-sm mt-1">Your gateway to the Zerith Chain ecosystem</p>
        </div>

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full space-y-4">
            <div className="text-center mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4 animate-glow">
                <Wallet className="w-10 h-10 text-white" />
              </div>
              <h2 className="font-display text-2xl font-bold">Get Started</h2>
              <p className="text-muted-foreground text-sm mt-2">Create a new wallet or import an existing one</p>
            </div>

            <Button className="w-full" size="lg" onClick={createWallet} data-testid="button-create-wallet">
              <Plus className="w-5 h-5 mr-2" />
              Create New Wallet
            </Button>
            <Button variant="secondary" className="w-full" size="lg" onClick={() => setShowImportDialog(true)} data-testid="button-import-wallet">
              <Import className="w-5 h-5 mr-2" />
              Import Existing Wallet
            </Button>
            <div className="relative">
              <Separator />
              <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">or</span>
            </div>
            <Button variant="outline" className="w-full" onClick={useDemoWallet} data-testid="button-demo-wallet">
              <Zap className="w-4 h-4 mr-2" />
              Use Demo Wallet
            </Button>
          </div>
        </div>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display">Save Your Seed Phrase</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Write down these 24 words in order. Never share them with anyone.</p>
              <div className="grid grid-cols-3 gap-2 p-3 bg-card rounded-md border border-border/50">
                {seedWords.map((word, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground w-5 text-right">{i + 1}.</span>
                    <span className="text-xs font-mono font-semibold text-foreground" data-testid={`seed-word-${i}`}>{word}</span>
                  </div>
                ))}
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={seedConfirmed}
                  onChange={e => setSeedConfirmed(e.target.checked)}
                  data-testid="checkbox-seed-confirmed"
                  className="rounded"
                />
                <span className="text-sm">I have securely saved my seed phrase</span>
              </label>
              <Button className="w-full" onClick={confirmCreateWallet} data-testid="button-confirm-create">
                Create Wallet
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display">Import Wallet</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Enter your 12 or 24-word seed phrase separated by spaces.</p>
              <textarea
                value={importSeed}
                onChange={e => setImportSeed(e.target.value)}
                placeholder="word1 word2 word3 ..."
                className="w-full h-24 rounded-md border border-input bg-card px-3 py-2 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                data-testid="textarea-import-seed"
              />
              <Button className="w-full" onClick={importWallet} data-testid="button-confirm-import">
                Import Wallet
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-auto">
      <div className="border-b border-border/50 px-6 py-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Wallet className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm text-muted-foreground" data-testid="wallet-address">{shortAddress(address)}</span>
                <button onClick={() => copy(address)} data-testid="button-copy-address" className="p-0.5 rounded text-muted-foreground">
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                <span className="text-xs text-muted-foreground capitalize">{network}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={network === "mainnet" ? "default" : "outline"}
              size="sm"
              onClick={() => switchNetwork("mainnet")}
              data-testid="button-mainnet"
            >
              Mainnet
            </Button>
            <Button
              variant={network === "testnet" ? "default" : "outline"}
              size="sm"
              onClick={() => switchNetwork("testnet")}
              data-testid="button-testnet"
            >
              Testnet
            </Button>
            <Button variant="ghost" size="icon" onClick={() => refetch()} data-testid="button-refresh">
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setAddress(null); localStorage.removeItem("zerith-wallet-address"); }}
              data-testid="button-disconnect"
            >
              Disconnect
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6 flex-1 overflow-auto">
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-transparent pointer-events-none" />
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">ZTH Balance</div>
                {isLoading ? (
                  <Skeleton className="h-10 w-48" />
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="font-display text-4xl font-bold text-foreground" data-testid="wallet-balance">
                      {showBalance ? formatZTH(wallet?.balance ?? "0") : "••••• ZTH"}
                    </span>
                    <button onClick={() => setShowBalance(v => !v)} className="p-1 text-muted-foreground" data-testid="button-toggle-balance">
                      {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                )}
                {wallet && (
                  <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5 text-purple-400" />
                      Staked: <span className="text-purple-400 font-medium ml-1">{formatZTH(wallet.stakedBalance)}</span>
                    </span>
                  </div>
                )}
              </div>
              <Badge variant="secondary" className="text-xs capitalize">{network}</Badge>
            </div>

            <div className="flex gap-3 mt-5">
              <Button asChild className="flex-1" data-testid="button-send">
                <Link href="/wallet/send">
                  <Send className="w-4 h-4 mr-1.5" />
                  Send
                </Link>
              </Button>
              <Button asChild variant="secondary" className="flex-1" data-testid="button-receive">
                <Link href="/wallet/receive">
                  <ArrowDownLeft className="w-4 h-4 mr-1.5" />
                  Receive
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-display flex items-center gap-2">
              Recent Transactions
              {isLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin text-muted-foreground" />}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 mb-2" />)
            ) : wallet?.transactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">No transactions yet</div>
            ) : (
              wallet?.transactions.slice(0, 10).map(tx => <TxRow key={tx.hash} tx={tx} />)
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
