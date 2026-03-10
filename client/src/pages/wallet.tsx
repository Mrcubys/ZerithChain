import { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Transaction } from "@shared/schema";
import { TxRow } from "@/components/tx-row";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  generateSeedWords, generateAddress, formatZTH,
  DEVELOPER_WALLET_ADDRESS,
} from "@/lib/chain-utils";
import {
  Wallet, Copy, Eye, EyeOff, Send, ArrowDownLeft, RefreshCw,
  Plus, Download, Gem, ExternalLink, ChevronDown, Check,
} from "lucide-react";

const STORAGE_ADDRESS_KEY = "zerith-wallet-address";
const STORAGE_NETWORK_KEY = "zerith-network";

type WalletMode = "none" | "create" | "import" | "demo";
type Network = "mainnet" | "testnet";

export default function WalletPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [address, setAddress] = useState<string | null>(() => localStorage.getItem(STORAGE_ADDRESS_KEY));
  const [network, setNetwork] = useState<Network>(() => (localStorage.getItem(STORAGE_NETWORK_KEY) as Network) ?? "mainnet");
  const [mode, setMode] = useState<WalletMode>("none");
  const [showBalance, setShowBalance] = useState(true);
  const [seedWords, setSeedWords] = useState<string[]>([]);
  const [importPhrase, setImportPhrase] = useState("");
  const [seedConfirmed, setSeedConfirmed] = useState(false);
  const [networkOpen, setNetworkOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const isDemoWallet = address === DEVELOPER_WALLET_ADDRESS;

  const { data: walletInfo, isLoading: walletLoading, refetch } = useQuery<{
    balance: string; stakedBalance: string; nonce: number;
    transactions: Transaction[]; isDeveloper: boolean; walletName: string | null;
  }>({
    queryKey: ["/api/wallet", address, network],
    queryFn: async () => {
      if (!address) throw new Error("No address");
      const res = await fetch(`/api/wallet?address=${address}&network=${network}`);
      return res.json();
    },
    enabled: !!address,
    refetchInterval: 8000,
  });

  const switchNetwork = (n: Network) => {
    setNetwork(n);
    localStorage.setItem(STORAGE_NETWORK_KEY, n);
    setNetworkOpen(false);
  };

  const openCreate = () => {
    const words = generateSeedWords();
    setSeedWords(words);
    setSeedConfirmed(false);
    setMode("create");
  };

  const openImport = () => {
    setImportPhrase("");
    setMode("import");
  };

  const confirmCreate = () => {
    const addr = generateAddress(seedWords.join(" ") + Date.now());
    setAddress(addr);
    localStorage.setItem(STORAGE_ADDRESS_KEY, addr);
    setMode("none");
    toast({ title: "Wallet created", description: "Your new wallet has been set up. Balance starts at 0 ZTH." });
  };

  const confirmImport = () => {
    const words = importPhrase.trim().split(/\s+/);
    if (words.length !== 12 && words.length !== 24) {
      toast({ title: "Invalid phrase", description: "Please enter a 12 or 24-word seed phrase.", variant: "destructive" });
      return;
    }
    const addr = generateAddress(importPhrase.trim());
    setAddress(addr);
    localStorage.setItem(STORAGE_ADDRESS_KEY, addr);
    setMode("none");
    toast({ title: "Wallet imported", description: "Wallet restored from seed phrase." });
  };

  const loadDemo = () => {
    setAddress(DEVELOPER_WALLET_ADDRESS);
    localStorage.setItem(STORAGE_ADDRESS_KEY, DEVELOPER_WALLET_ADDRESS);
    setMode("none");
    toast({ title: "Demo wallet loaded", description: "Genesis developer wallet with preloaded ZTH balance." });
  };

  const disconnect = () => {
    setAddress(null);
    localStorage.removeItem(STORAGE_ADDRESS_KEY);
    toast({ title: "Wallet disconnected" });
  };

  const copyAddress = useCallback(() => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [address]);

  if (!address) {
    return (
      <div className="flex flex-col min-h-full">
        <div className="border-b border-border px-6 py-6">
          <h1 className="text-xl font-semibold">Zerith Wallet</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your ZTH on Zerith Chain</p>
        </div>

        <div className="flex-1 flex items-start justify-center p-6">
          <div className="w-full max-w-sm space-y-3">
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-md bg-secondary flex items-center justify-center mx-auto mb-4">
                <Wallet className="w-7 h-7 text-muted-foreground" />
              </div>
              <h2 className="text-lg font-semibold">Connect Wallet</h2>
              <p className="text-sm text-muted-foreground mt-1">Create a new wallet or import an existing one</p>
            </div>

            <Button className="w-full" onClick={openCreate} data-testid="button-create-wallet">
              <Plus className="w-4 h-4 mr-2" />
              Create New Wallet
            </Button>
            <Button variant="outline" className="w-full" onClick={openImport} data-testid="button-import-wallet">
              <Download className="w-4 h-4 mr-2" />
              Import Seed Phrase
            </Button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>
            <Button variant="ghost" className="w-full border border-border/50" onClick={loadDemo} data-testid="button-demo-wallet">
              <Gem className="w-4 h-4 mr-2 text-amber-400" />
              Open Demo Wallet
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Demo wallet is a genesis developer wallet with preloaded ZTH
            </p>
          </div>
        </div>

        <Dialog open={mode === "create"} onOpenChange={(o) => !o && setMode("none")}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Wallet</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-3 rounded-sm bg-amber-500/10 border border-amber-500/20">
                <p className="text-xs text-amber-400">Write down your seed phrase and store it securely. It cannot be recovered if lost.</p>
              </div>
              <div className="grid grid-cols-3 gap-1.5" data-testid="seed-phrase-grid">
                {seedWords.map((word, i) => (
                  <div key={i} className="flex items-center gap-1.5 bg-secondary rounded-sm px-2.5 py-1.5">
                    <span className="text-xs text-muted-foreground w-4 text-right flex-shrink-0">{i + 1}.</span>
                    <span className="text-xs font-mono">{word}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="seed-confirm" checked={seedConfirmed} onChange={e => setSeedConfirmed(e.target.checked)} className="rounded border-border" data-testid="checkbox-seed-confirmed" />
                <label htmlFor="seed-confirm" className="text-sm text-muted-foreground cursor-pointer">I have saved my seed phrase securely</label>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setMode("none")} className="flex-1">Cancel</Button>
                <Button onClick={confirmCreate} disabled={!seedConfirmed} className="flex-1" data-testid="button-confirm-create">
                  Create Wallet
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={mode === "import"} onOpenChange={(o) => !o && setMode("none")}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Import Wallet</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="seed-input">Seed Phrase (12 or 24 words)</Label>
                <textarea
                  id="seed-input"
                  className="w-full mt-1.5 px-3 py-2.5 rounded-sm border border-border bg-secondary text-sm font-mono resize-none h-24 focus:outline-none focus:ring-1 focus:ring-ring"
                  placeholder="Enter your seed phrase separated by spaces..."
                  value={importPhrase}
                  onChange={e => setImportPhrase(e.target.value)}
                  data-testid="input-seed-phrase"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setMode("none")} className="flex-1">Cancel</Button>
                <Button onClick={confirmImport} className="flex-1" data-testid="button-confirm-import">Import</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      <div className="border-b border-border px-6 py-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2.5">
            <h1 className="font-semibold">Zerith Wallet</h1>
            {isDemoWallet && (
              <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 border text-xs">
                <Gem className="w-3 h-3 mr-1" />Genesis
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Button variant="outline" size="sm" onClick={() => setNetworkOpen(!networkOpen)} data-testid="button-network-switch">
                <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${network === "mainnet" ? "bg-green-400" : "bg-yellow-400"}`} />
                <span className="capitalize text-xs">{network}</span>
                <ChevronDown className="w-3.5 h-3.5 ml-1" />
              </Button>
              {networkOpen && (
                <div className="absolute right-0 top-full mt-1 w-36 bg-popover border border-border rounded-sm shadow-lg z-50">
                  {(["mainnet", "testnet"] as Network[]).map(n => (
                    <button key={n} onClick={() => switchNetwork(n)} className="flex items-center justify-between w-full px-3 py-2 text-sm hover:bg-accent transition-colors" data-testid={`option-network-${n}`}>
                      <span className="capitalize">{n}</span>
                      {network === n && <Check className="w-3.5 h-3.5 text-green-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={() => refetch()} data-testid="button-refresh">
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={disconnect} data-testid="button-disconnect" className="text-xs text-muted-foreground">
              Disconnect
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-5 max-w-2xl">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Balance</span>
                  <button onClick={() => setShowBalance(!showBalance)} className="text-muted-foreground hover:text-foreground" data-testid="button-toggle-balance">
                    {showBalance ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {walletLoading ? (
                  <Skeleton className="h-9 w-48" />
                ) : (
                  <div className="text-3xl font-bold font-mono" data-testid="wallet-balance">
                    {showBalance ? formatZTH(walletInfo?.balance ?? "0") : "••••••••"}
                  </div>
                )}
                {walletInfo?.stakedBalance && parseFloat(walletInfo.stakedBalance) > 0 && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Staked: {formatZTH(walletInfo.stakedBalance)}
                  </div>
                )}
              </div>
              <div className="flex-shrink-0 w-12 h-12 rounded-sm bg-secondary flex items-center justify-center">
                <Wallet className="w-6 h-6 text-muted-foreground" />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <code className="flex-1 text-xs font-mono text-muted-foreground truncate bg-secondary/60 px-2.5 py-1.5 rounded-sm" data-testid="wallet-address">{address}</code>
              <button onClick={copyAddress} className="flex-shrink-0 p-1.5 text-muted-foreground hover:text-foreground rounded-sm bg-secondary/60" data-testid="button-copy-address">
                {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <Link href={`/explorer/address/${address}`} data-testid="link-view-on-explorer">
                <button className="flex-shrink-0 p-1.5 text-muted-foreground hover:text-foreground rounded-sm bg-secondary/60">
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </Link>
            </div>

            <div className="mt-4 flex gap-2">
              <Button asChild className="flex-1" data-testid="button-send">
                <Link href="/wallet/send">
                  <Send className="w-4 h-4 mr-2" />Send
                </Link>
              </Button>
              <Button asChild variant="outline" className="flex-1" data-testid="button-receive">
                <Link href="/wallet/receive">
                  <ArrowDownLeft className="w-4 h-4 mr-2" />Receive
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {walletLoading ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 mb-1" />)
            ) : !walletInfo?.transactions?.length ? (
              <div className="py-8 text-center">
                <div className="text-sm text-muted-foreground">No transactions yet</div>
                <div className="text-xs text-muted-foreground mt-1">Your transaction history will appear here</div>
              </div>
            ) : (
              walletInfo.transactions.slice(0, 8).map((tx: Transaction) => <TxRow key={tx.hash} tx={tx} />)
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
