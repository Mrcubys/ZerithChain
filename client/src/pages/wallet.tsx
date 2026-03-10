import { useState, useCallback, useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Transaction } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  generateSeedWords, generateAddress, formatZTH, formatCompact,
  timeAgo,
  deriveEvmAddress, deriveSolanaAddress,
  loadCustomTokens, saveCustomTokens,
  type CustomToken, SUPPORTED_NETWORKS,
} from "@/lib/chain-utils";
import { saveSeedPhrase } from "@/lib/pin-security";
import { PinLock } from "@/components/pin-lock";
import { AddTokenModal } from "@/components/add-token-modal";
import { SiEthereum, SiSolana } from "react-icons/si";
import {
  Copy, Eye, EyeOff, Send, ArrowDownLeft, Plus,
  Download, ChevronDown, Check, ExternalLink,
  TrendingUp, RefreshCw, Trash2,
} from "lucide-react";

const zerithLogoPath = "/zerith-logo.png";

const STORAGE_ADDRESS_KEY = "zerith-wallet-address";
const STORAGE_NETWORK_KEY = "zerith-network";
type Network = "mainnet" | "testnet";
type WalletMode = "none" | "create" | "import" | "pin-setup";
type ChainTab = "zerith" | "evm" | "solana";

function NetworkBadge({ network }: { network: string }) {
  const n = SUPPORTED_NETWORKS.find(x => x.id === network);
  const color = n?.color ?? "#888";
  const label = n?.label ?? network;
  return (
    <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full border" style={{ borderColor: color + "40", color, background: color + "12" }}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
      {label}
    </span>
  );
}

function TokenRow({ token, onRemove }: { token: CustomToken; onRemove: (id: string) => void }) {
  const [showRemove, setShowRemove] = useState(false);
  return (
    <div
      className="flex items-center gap-3 hover:bg-muted/40 rounded-xl px-2 py-2.5 -mx-2 transition-colors cursor-pointer"
      onClick={() => setShowRemove(v => !v)}
      data-testid={`token-row-${token.symbol.toLowerCase()}`}
    >
      {token.logoUrl ? (
        <img src={token.logoUrl} alt={token.symbol} className="w-9 h-9 rounded-full object-cover border border-border flex-shrink-0" />
      ) : (
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
          style={{ background: (SUPPORTED_NETWORKS.find(n => n.id === token.network)?.color ?? "#888") + "20", color: SUPPORTED_NETWORKS.find(n => n.id === token.network)?.color ?? "#888" }}
        >
          {token.symbol.slice(0, 2)}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium">{token.name}</span>
          <NetworkBadge network={token.network} />
        </div>
        <p className="text-xs text-muted-foreground font-mono truncate">
          {token.symbol}
          {token.price != null && ` · $${token.price.toFixed(token.price < 0.01 ? 6 : 4)}`}
        </p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-semibold font-mono">{token.balanceFormatted || "0"}</p>
        <p className="text-xs text-muted-foreground">{token.symbol}</p>
      </div>
      {showRemove && (
        <button
          onClick={e => { e.stopPropagation(); onRemove(token.id); }}
          className="ml-1 p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors flex-shrink-0"
          data-testid={`button-remove-token-${token.symbol.toLowerCase()}`}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

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
  const [chainTab, setChainTab] = useState<ChainTab>("zerith");
  const [addTokenOpen, setAddTokenOpen] = useState(false);
  const [tokens, setTokens] = useState<CustomToken[]>([]);
  const [pendingAddress, setPendingAddress] = useState<string | null>(null);
  const [pendingSeed, setPendingSeed] = useState<string | null>(null);
  const evmAddress = address ? deriveEvmAddress(address) : "";
  const solanaAddress = address ? deriveSolanaAddress(address) : "";

  useEffect(() => {
    if (address) setTokens(loadCustomTokens(address));
  }, [address]);

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

  const openCreate = () => { setSeedWords(generateSeedWords()); setSeedConfirmed(false); setMode("create"); };

  const confirmCreate = () => {
    const seed = seedWords.join(" ");
    const addr = generateAddress(seed + Date.now());
    setPendingAddress(addr);
    setPendingSeed(seed);
    setMode("pin-setup");
  };

  const confirmImport = () => {
    const words = importPhrase.trim().split(/\s+/);
    if (words.length !== 12 && words.length !== 24) {
      toast({ title: "Invalid phrase", description: "Please enter a 12 or 24-word seed phrase.", variant: "destructive" });
      return;
    }
    const seed = importPhrase.trim();
    const addr = generateAddress(seed);
    setPendingAddress(addr);
    setPendingSeed(seed);
    setMode("pin-setup");
  };

  const finishWalletSetup = () => {
    if (!pendingAddress) return;
    if (pendingSeed) saveSeedPhrase(pendingAddress, pendingSeed);
    setAddress(pendingAddress);
    localStorage.setItem(STORAGE_ADDRESS_KEY, pendingAddress);
    setMode("none");
    setPendingAddress(null);
    setPendingSeed(null);
    toast({ title: "Wallet ready", description: "Secured with your passkey." });
  };

  const disconnect = () => { setAddress(null); localStorage.removeItem(STORAGE_ADDRESS_KEY); };

  const activeAddress = chainTab === "evm" ? evmAddress : chainTab === "solana" ? solanaAddress : (address ?? "");

  const copyAddress = useCallback(() => {
    if (!activeAddress) return;
    navigator.clipboard.writeText(activeAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [activeAddress]);

  const switchNetwork = (n: Network) => {
    setNetwork(n);
    localStorage.setItem(STORAGE_NETWORK_KEY, n);
    setNetworkOpen(false);
  };

  const handleAddToken = (token: CustomToken) => {
    if (!address) return;
    setTokens(prev => {
      const filtered = prev.filter(t => t.id !== token.id);
      const updated = [...filtered, token];
      saveCustomTokens(address, updated);
      return updated;
    });
  };

  const handleRemoveToken = (id: string) => {
    if (!address) return;
    setTokens(prev => {
      const updated = prev.filter(t => t.id !== id);
      saveCustomTokens(address, updated);
      return updated;
    });
    toast({ title: "Token removed" });
  };

  if (!address) {
    if (mode === "pin-setup" && pendingAddress) {
      return (
        <PinLock
          mode="setup"
          setupTitle="Secure Your Wallet"
          onSuccess={finishWalletSetup}
          onCancel={() => { setPendingAddress(null); setPendingSeed(null); setMode("none"); }}
        />
      );
    }

    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="px-5 pt-8 pb-6 text-center">
          <div className="w-20 h-20 rounded-2xl overflow-hidden mx-auto mb-5 border border-border/40 shadow-sm">
            <img src={zerithLogoPath} alt="Zerith" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">Zerith Wallet</h1>
          <p className="text-muted-foreground text-sm mt-1.5">Your multi-chain gateway</p>
        </div>

        <div className="px-5 space-y-3 max-w-sm mx-auto w-full">
          <Button className="w-full h-12 rounded-xl shadow-sm" onClick={openCreate} data-testid="button-create-wallet">
            <Plus className="w-4 h-4 mr-2" />Create New Wallet
          </Button>
          <Button variant="outline" className="w-full h-12 rounded-xl border-border" onClick={() => setMode("import")} data-testid="button-import-wallet">
            <Download className="w-4 h-4 mr-2" />Import with Seed Phrase
          </Button>
        </div>

        <Dialog open={mode === "create"} onOpenChange={(o) => !o && setMode("none")}>
          <DialogContent className="max-w-sm rounded-2xl">
            <DialogHeader><DialogTitle>Your Seed Phrase</DialogTitle></DialogHeader>
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
                <Button onClick={confirmCreate} disabled={!seedConfirmed} className="flex-1 rounded-xl" data-testid="button-confirm-create">Create Wallet</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={mode === "import"} onOpenChange={(o) => !o && setMode("none")}>
          <DialogContent className="max-w-sm rounded-2xl">
            <DialogHeader><DialogTitle>Import Wallet</DialogTitle></DialogHeader>
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
              <TrendingUp className="w-3.5 h-3.5" />{formatZTH(walletInfo.stakedBalance, 2)} staked
            </p>
          )}
        </div>
      </div>

      <div className="-mt-10 px-4 space-y-4 pb-6">
        <div className="flex gap-3">
          <Button asChild className="flex-1 h-12 rounded-xl shadow-md bg-white text-primary hover:bg-white/90 border border-primary/10" data-testid="button-send">
            <Link href="/wallet/send"><Send className="w-4 h-4 mr-2" />Send</Link>
          </Button>
          <Button asChild className="flex-1 h-12 rounded-xl shadow-md bg-white text-primary hover:bg-white/90 border border-primary/10" data-testid="button-receive">
            <Link href="/wallet/receive"><ArrowDownLeft className="w-4 h-4 mr-2" />Receive</Link>
          </Button>
        </div>

        <Card className="rounded-2xl shadow-sm border-card-border">
          <CardContent className="p-0">
            <div className="flex border-b border-border/60">
              <button
                onClick={() => setChainTab("zerith")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors border-b-2 ${chainTab === "zerith" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                data-testid="tab-chain-zerith"
              >
                <img src={zerithLogoPath} alt="ZTH" className="w-3.5 h-3.5 rounded-sm object-cover" />
                Zerith
              </button>
              <button
                onClick={() => setChainTab("evm")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors border-b-2 ${chainTab === "evm" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                data-testid="tab-chain-evm"
              >
                <SiEthereum className="w-3.5 h-3.5 text-[#627EEA]" />
                EVM
              </button>
              <button
                onClick={() => setChainTab("solana")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors border-b-2 ${chainTab === "solana" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                data-testid="tab-chain-solana"
              >
                <SiSolana className="w-3.5 h-3.5 text-[#9945FF]" />
                Solana
              </button>
            </div>
            <div className="p-4">
              {chainTab === "zerith" && (
                <div>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Zerith Chain Address</p>
                  <div className="flex items-start gap-2">
                    <code className="text-xs font-mono text-foreground/80 break-all flex-1" data-testid="wallet-address">{address}</code>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={copyAddress} className="p-1 rounded-md hover:bg-muted transition-colors" data-testid="button-copy-address">
                        {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                      </button>
                      <Link href={`/explorer/address/${address}`} className="p-1 rounded-md hover:bg-muted transition-colors">
                        <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}
              {chainTab === "evm" && (
                <div>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">EVM Address (Ethereum, BNB, Polygon…)</p>
                  <div className="flex items-start gap-2">
                    <code className="text-xs font-mono text-foreground/80 break-all flex-1" data-testid="wallet-evm-address">{evmAddress}</code>
                    <button onClick={copyAddress} className="p-1 rounded-md hover:bg-muted transition-colors flex-shrink-0" data-testid="button-copy-evm">
                      {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {["Ethereum", "BNB Chain", "Polygon", "Arbitrum", "Optimism", "Base", "Avalanche"].map(l => (
                      <span key={l} className="text-[9px] bg-muted rounded-full px-2 py-0.5 text-muted-foreground">{l}</span>
                    ))}
                  </div>
                </div>
              )}
              {chainTab === "solana" && (
                <div>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Solana Address</p>
                  <div className="flex items-start gap-2">
                    <code className="text-xs font-mono text-foreground/80 break-all flex-1" data-testid="wallet-solana-address">{solanaAddress}</code>
                    <button onClick={copyAddress} className="p-1 rounded-md hover:bg-muted transition-colors flex-shrink-0" data-testid="button-copy-solana">
                      {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm border-card-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-foreground">Assets</p>
              <button
                onClick={() => setAddTokenOpen(true)}
                className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                data-testid="button-add-token"
              >
                <Plus className="w-3.5 h-3.5" />Add token
              </button>
            </div>

            <div className="flex items-center gap-3 py-2.5 border-b border-border/40 last:border-0">
              <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 border border-border/40">
                <img src={zerithLogoPath} alt="ZTH" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Zerith</p>
                <p className="text-xs text-muted-foreground">Zerith Chain · ZTH</p>
              </div>
              <div className="text-right flex-shrink-0">
                {isLoading ? (
                  <Skeleton className="h-4 w-20" />
                ) : (
                  <>
                    <p className="text-sm font-semibold font-mono" data-testid="asset-zth-balance">
                      {showBalance ? formatCompact(balance) : "••••"}
                    </p>
                    <p className="text-xs text-muted-foreground">ZTH</p>
                  </>
                )}
              </div>
            </div>

            {tokens.length === 0 && (
              <div className="py-6 text-center">
                <p className="text-xs text-muted-foreground">No custom tokens added yet</p>
                <button onClick={() => setAddTokenOpen(true)} className="mt-2 text-xs text-primary hover:underline" data-testid="button-add-first-token">
                  + Add your first token
                </button>
              </div>
            )}

            {tokens.map(token => (
              <TokenRow key={token.id} token={token} onRemove={handleRemoveToken} />
            ))}
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
                        : <ArrowDownLeft className="w-4 h-4 text-green-500" />}
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

      <AddTokenModal
        open={addTokenOpen}
        onClose={() => setAddTokenOpen(false)}
        walletAddress={address}
        evmAddress={evmAddress}
        solanaAddress={solanaAddress}
        onAdd={handleAddToken}
      />
    </div>
  );
}
