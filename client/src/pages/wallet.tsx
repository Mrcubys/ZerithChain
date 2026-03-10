import { useState, useCallback } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Transaction } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  generateSeedWords, generateAddress, formatZTH, formatCompact,
  DEVELOPER_WALLET_ADDRESS, timeAgo, statusBadgeClass, txTypeBadgeClass,
} from "@/lib/chain-utils";
import {
  Wallet, Copy, Eye, EyeOff, Send, ArrowDownLeft, Plus,
  Download, Gem, ChevronDown, Check, ExternalLink, ArrowRight,
  TrendingUp, RefreshCw,
} from "lucide-react";

const STORAGE_ADDRESS_KEY = "zerith-wallet-address";
const STORAGE_NETWORK_KEY = "zerith-network";
type Network = "mainnet" | "testnet";
type WalletMode = "none" | "create" | "import";

export default function WalletPage() {
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

  const { data: walletInfo, isLoading, refetch } = useQuery<{
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
    refetchInterval: 10000,
  });

  const openCreate = () => {
    setSeedWords(generateSeedWords());
    setSeedConfirmed(false);
    setMode("create");
  };

  const confirmCreate = () => {
    const addr = generateAddress(seedWords.join(" ") + Date.now());
    setAddress(addr);
    localStorage.setItem(STORAGE_ADDRESS_KEY, addr);
    setMode("none");
    toast({ title: "Wallet created", description: "Balance starts at 0 ZTH." });
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
    toast({ title: "Wallet imported" });
  };

  const loadDemo = () => {
    setAddress(DEVELOPER_WALLET_ADDRESS);
    localStorage.setItem(STORAGE_ADDRESS_KEY, DEVELOPER_WALLET_ADDRESS);
    toast({ title: "Demo wallet loaded", description: "Genesis developer wallet with 10,000,000 ZTH." });
  };

  const disconnect = () => {
    setAddress(null);
    localStorage.removeItem(STORAGE_ADDRESS_KEY);
  };

  const copyAddress = useCallback(() => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [address]);

  const switchNetwork = (n: Network) => {
    setNetwork(n);
    localStorage.setItem(STORAGE_NETWORK_KEY, n);
    setNetworkOpen(false);
  };

  if (!address) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="px-5 pt-8 pb-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
            <Wallet className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">Zerith Wallet</h1>
          <p className="text-muted-foreground text-sm mt-1.5">Your gateway to Zerith Chain</p>
        </div>

        <div className="px-5 space-y-3 max-w-sm mx-auto w-full">
          <Button className="w-full h-12 rounded-xl shadow-sm" onClick={openCreate} data-testid="button-create-wallet">
            <Plus className="w-4 h-4 mr-2" />
            Create New Wallet
          </Button>
          <Button variant="outline" className="w-full h-12 rounded-xl border-border" onClick={() => setMode("import")} data-testid="button-import-wallet">
            <Download className="w-4 h-4 mr-2" />
            Import with Seed Phrase
          </Button>
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>
          <button onClick={loadDemo} className="w-full flex items-center gap-3 p-4 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 transition-colors" data-testid="button-demo-wallet">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Gem className="w-5 h-5 text-amber-500" />
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold text-amber-900">Genesis Dev Wallet</div>
              <div className="text-xs text-amber-600">10,000,000 ZTH preloaded</div>
            </div>
            <ArrowRight className="w-4 h-4 text-amber-500 ml-auto" />
          </button>
        </div>

        <Dialog open={mode === "create"} onOpenChange={(o) => !o && setMode("none")}>
          <DialogContent className="max-w-sm rounded-2xl">
            <DialogHeader>
              <DialogTitle>Your Seed Phrase</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                <p className="text-xs text-amber-700 font-medium">Store this safely — it cannot be recovered.</p>
              </div>
              <div className="grid grid-cols-3 gap-1.5" data-testid="seed-phrase-grid">
                {seedWords.map((word, i) => (
                  <div key={i} className="flex items-center gap-1.5 bg-secondary rounded-lg px-2.5 py-1.5">
                    <span className="text-[10px] text-muted-foreground w-4 text-right flex-shrink-0">{i + 1}</span>
                    <span className="text-xs font-mono font-medium">{word}</span>
                  </div>
                ))}
              </div>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={seedConfirmed} onChange={e => setSeedConfirmed(e.target.checked)} className="rounded" data-testid="checkbox-seed-confirmed" />
                <span className="text-sm text-muted-foreground">I've saved my seed phrase</span>
              </label>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setMode("none")} className="flex-1 rounded-xl">Cancel</Button>
                <Button onClick={confirmCreate} disabled={!seedConfirmed} className="flex-1 rounded-xl" data-testid="button-confirm-create">
                  Create Wallet
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={mode === "import"} onOpenChange={(o) => !o && setMode("none")}>
          <DialogContent className="max-w-sm rounded-2xl">
            <DialogHeader>
              <DialogTitle>Import Wallet</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Seed Phrase (12 or 24 words)</Label>
                <textarea
                  className="w-full mt-2 px-3 py-2.5 rounded-xl border border-border bg-secondary/40 text-sm font-mono resize-none h-24 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="Enter words separated by spaces..."
                  value={importPhrase}
                  onChange={e => setImportPhrase(e.target.value)}
                  data-testid="input-seed-phrase"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setMode("none")} className="flex-1 rounded-xl">Cancel</Button>
                <Button onClick={confirmImport} className="flex-1 rounded-xl" data-testid="button-confirm-import">Import</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  const balance = walletInfo?.balance ?? "0";
  const recentTxs = walletInfo?.transactions?.slice(0, 5) ?? [];

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="bg-primary px-5 pt-10 pb-16">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            {isDemoWallet && (
              <Badge className="bg-white/20 text-white border-0 text-xs backdrop-blur-sm">
                <Gem className="w-3 h-3 mr-1" />Genesis
              </Badge>
            )}
            <div className="relative">
              <button onClick={() => setNetworkOpen(!networkOpen)} className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1 text-white text-xs" data-testid="button-network-switch">
                <div className="w-1.5 h-1.5 rounded-full bg-green-300" />
                <span className="capitalize">{network}</span>
                <ChevronDown className="w-3 h-3" />
              </button>
              {networkOpen && (
                <div className="absolute left-0 top-full mt-1 w-32 bg-white border border-border rounded-xl shadow-lg z-50 overflow-hidden">
                  {(["mainnet", "testnet"] as Network[]).map(n => (
                    <button key={n} onClick={() => switchNetwork(n)} className="flex items-center justify-between w-full px-3 py-2.5 text-sm text-foreground hover:bg-muted transition-colors" data-testid={`option-network-${n}`}>
                      <span className="capitalize">{n}</span>
                      {network === n && <Check className="w-3.5 h-3.5 text-primary" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <button onClick={() => refetch()} className="bg-white/15 backdrop-blur-sm rounded-full p-1.5 text-white" data-testid="button-refresh">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <p className="text-white/70 text-sm">Total Balance</p>
            <button onClick={() => setShowBalance(!showBalance)} className="text-white/70" data-testid="button-toggle-balance">
              {showBalance ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
          {isLoading ? (
            <Skeleton className="h-10 w-48 mx-auto bg-white/20" />
          ) : (
            <div className="text-4xl font-bold text-white font-mono" data-testid="wallet-balance">
              {showBalance ? formatZTH(balance, 2) : "••••••"}
            </div>
          )}
          {walletInfo?.stakedBalance && parseFloat(walletInfo.stakedBalance) > 0 && (
            <p className="text-white/60 text-sm mt-1.5 flex items-center justify-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              {formatZTH(walletInfo.stakedBalance, 2)} staked
            </p>
          )}
        </div>
      </div>

      <div className="-mt-10 px-4 space-y-4 pb-6">
        <div className="flex gap-3">
          <Button asChild className="flex-1 h-12 rounded-xl shadow-md bg-white text-primary hover:bg-white/90 border border-primary/10" data-testid="button-send">
            <Link href="/wallet/send">
              <Send className="w-4 h-4 mr-2" />Send
            </Link>
          </Button>
          <Button asChild className="flex-1 h-12 rounded-xl shadow-md bg-white text-primary hover:bg-white/90 border border-primary/10" data-testid="button-receive">
            <Link href="/wallet/receive">
              <ArrowDownLeft className="w-4 h-4 mr-2" />Receive
            </Link>
          </Button>
        </div>

        <Card className="rounded-2xl shadow-sm border-card-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Address</p>
              <div className="flex items-center gap-1.5">
                <button onClick={copyAddress} className="p-1 rounded-md hover:bg-muted transition-colors" data-testid="button-copy-address">
                  {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                </button>
                <Link href={`/explorer/address/${address}`} className="p-1 rounded-md hover:bg-muted transition-colors" data-testid="link-view-on-explorer">
                  <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                </Link>
              </div>
            </div>
            <code className="text-xs font-mono text-muted-foreground break-all" data-testid="wallet-address">{address}</code>
          </CardContent>
        </Card>

        {recentTxs.length > 0 && (
          <Card className="rounded-2xl shadow-sm border-card-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-foreground">Recent Activity</p>
                <Link href="/history" className="text-xs text-primary font-medium" data-testid="link-view-all-history">View all</Link>
              </div>
              <div className="space-y-3">
                {recentTxs.map((tx: Transaction) => (
                  <Link key={tx.hash} href={`/explorer/tx/${tx.hash}`} className="flex items-center gap-3 hover:bg-muted/50 rounded-xl p-2 -mx-2 transition-colors">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${tx.from === address ? "bg-red-50" : "bg-green-50"}`}>
                      {tx.from === address
                        ? <ArrowRight className="w-4 h-4 text-red-500" />
                        : <ArrowDownLeft className="w-4 h-4 text-green-500" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium capitalize">{tx.type}</span>
                        <span className={`text-sm font-semibold font-mono ${tx.from === address ? "text-red-500" : "text-green-600"}`}>
                          {tx.from === address ? "-" : "+"}{parseFloat(tx.amount).toFixed(2)} ZTH
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-muted-foreground">{timeAgo(tx.timestamp)}</span>
                        <span className={`text-xs capitalize ${tx.status === "success" ? "text-green-600" : "text-red-500"}`}>{tx.status}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <button onClick={disconnect} className="w-full py-3 text-sm text-muted-foreground hover:text-destructive transition-colors" data-testid="button-disconnect">
          Disconnect Wallet
        </button>
      </div>
    </div>
  );
}
