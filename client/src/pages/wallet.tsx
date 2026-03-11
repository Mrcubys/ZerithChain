import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import {
  Wallet, Copy, CheckCheck, ChevronLeft, TrendingUp, TrendingDown,
  ArrowLeftRight, Send, RefreshCw, Globe, Coins, ExternalLink, AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { shortHash, timeAgo, formatZTH, formatNumber } from "@/lib/chain-utils";
import { Link } from "wouter";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import zerithLogo from "@assets/zerith-logo_1773200744409.png";

const EVM_CHAINS = [
  { id: "ethereum", label: "Ethereum", symbol: "ETH", color: "bg-blue-500/15 text-blue-400" },
  { id: "binance-smart-chain", label: "BNB Chain", symbol: "BNB", color: "bg-yellow-500/15 text-yellow-400" },
  { id: "polygon-pos", label: "Polygon", symbol: "MATIC", color: "bg-purple-500/15 text-purple-400" },
  { id: "arbitrum-one", label: "Arbitrum", symbol: "ETH", color: "bg-sky-500/15 text-sky-400" },
  { id: "base", label: "Base", symbol: "ETH", color: "bg-blue-600/15 text-blue-400" },
  { id: "optimistic-ethereum", label: "Optimism", symbol: "ETH", color: "bg-red-500/15 text-red-400" },
];

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded" data-testid="button-copy">
      {copied ? <CheckCheck className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

function AddressSearch() {
  const [addr, setAddr] = useState("");
  const [, setLocation] = useLocation();
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = addr.trim();
    if (q) setLocation(`/wallet/${q}`);
  };
  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        data-testid="input-wallet-address"
        value={addr}
        onChange={e => setAddr(e.target.value)}
        placeholder="Enter ZTH (zth1…), ETH (0x…), or Solana address"
        className="flex-1 h-10 px-4 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />
      <button type="submit" data-testid="button-wallet-lookup"
        className="h-10 px-5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shrink-0">
        View
      </button>
    </form>
  );
}

function ZthBalance({ address, network }: { address: string; network: "mainnet" | "testnet" }) {
  const { data, isLoading } = useQuery<any>({
    queryKey: [`/api/${network}/wallet/${address}`],
    enabled: address.startsWith("zth1"),
  });
  const isTestnet = network === "testnet";
  const symbol = isTestnet ? "tZTH" : "ZTH";
  const balance = data?.balance ?? "0";
  const staked = data?.stakedBalance ?? "0";
  const txCount = data?.transactions?.length ?? 0;

  return (
    <Card className={isTestnet ? "border-amber-500/20" : "border-primary/20"}>
      <CardContent className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <img src={zerithLogo} alt="ZTH" className="w-8 h-8 rounded-full" />
          <div>
            <p className="text-sm font-semibold text-foreground">{isTestnet ? "Zerith Testnet" : "Zerith Mainnet"}</p>
            <Badge variant="outline" className={`text-xs ${isTestnet ? "border-amber-500/30 text-amber-400" : "border-primary/30 text-primary"}`}>
              {symbol}
            </Badge>
          </div>
        </div>
        {!address.startsWith("zth1") ? (
          <p className="text-xs text-muted-foreground">ZTH balance only available for zth1… addresses</p>
        ) : isLoading ? (
          <Skeleton className="h-8 w-36 mb-2" />
        ) : (
          <>
            <p className="text-2xl font-bold text-foreground">{parseFloat(balance).toLocaleString("en", { maximumFractionDigits: 4 })} <span className="text-base font-normal text-muted-foreground">{symbol}</span></p>
            {parseFloat(staked) > 0 && (
              <p className="text-xs text-muted-foreground mt-1">Staked: {parseFloat(staked).toLocaleString("en", { maximumFractionDigits: 4 })} {symbol}</p>
            )}
            {txCount > 0 && <p className="text-xs text-muted-foreground mt-1">{txCount} transactions</p>}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function EvmBalance({ address, chain }: { address: string; chain: typeof EVM_CHAINS[0] }) {
  const isEvm = address.startsWith("0x") && address.length === 42;
  const { data, isLoading } = useQuery<any>({
    queryKey: [`/api/eth/balance/${address}?chain=${chain.id}`],
    queryFn: async () => {
      const r = await fetch(`/api/eth/balance/${address}?chain=${chain.id}`);
      if (!r.ok) throw new Error("Failed");
      return r.json();
    },
    enabled: isEvm,
  });

  if (!isEvm) return null;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${chain.color}`}>
              {chain.symbol.slice(0, 1)}
            </div>
            <div>
              <p className="text-xs font-medium text-foreground">{chain.label}</p>
              <p className="text-xs text-muted-foreground">{chain.symbol}</p>
            </div>
          </div>
          {isLoading ? (
            <Skeleton className="h-5 w-20" />
          ) : data?.balance ? (
            <p className="text-sm font-semibold text-foreground">{parseFloat(data.balance).toFixed(4)} {chain.symbol}</p>
          ) : (
            <p className="text-xs text-muted-foreground">—</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function SolBalance({ address }: { address: string }) {
  const isSol = !address.startsWith("0x") && !address.startsWith("zth") && address.length >= 32 && address.length <= 44;
  const { data, isLoading } = useQuery<any>({
    queryKey: [`/api/sol/balance/${address}`],
    queryFn: async () => {
      const r = await fetch(`/api/sol/balance/${address}`);
      if (!r.ok) throw new Error("Failed");
      return r.json();
    },
    enabled: isSol,
  });

  if (!isSol) return null;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">S</div>
            <div>
              <p className="text-xs font-medium text-foreground">Solana</p>
              <p className="text-xs text-muted-foreground">SOL</p>
            </div>
          </div>
          {isLoading ? (
            <Skeleton className="h-5 w-20" />
          ) : data?.balance ? (
            <p className="text-sm font-semibold text-foreground">{parseFloat(data.balance).toFixed(4)} SOL</p>
          ) : (
            <p className="text-xs text-muted-foreground">—</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function SendModal({ address, network, onClose }: { address: string; network: "mainnet" | "testnet"; onClose: () => void }) {
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const { toast } = useToast();
  const symbol = network === "testnet" ? "tZTH" : "ZTH";

  const mutation = useMutation({
    mutationFn: async () => {
      const r = await apiRequest("POST", `/api/${network}/wallet/send`, { from: address, to, amount, network });
      return r.json();
    },
    onSuccess: (data) => {
      toast({ title: "Transaction submitted", description: `Hash: ${shortHash(data.hash, 8)}` });
      queryClient.invalidateQueries({ queryKey: [`/api/${network}/wallet/${address}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/${network}/transactions`] });
      queryClient.invalidateQueries({ queryKey: [`/api/${network}/blocks`] });
      onClose();
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Send className="w-4 h-4 text-primary" />
            Send {symbol}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">From</label>
            <p className="text-xs font-mono text-foreground bg-secondary/50 rounded px-3 py-2 break-all">{address}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">To Address</label>
            <input
              data-testid="input-send-to"
              value={to}
              onChange={e => setTo(e.target.value)}
              placeholder="zth1…"
              className="w-full h-9 px-3 rounded border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Amount ({symbol})</label>
            <input
              data-testid="input-send-amount"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.0000"
              type="number"
              min="0"
              step="0.0001"
              className="w-full h-9 px-3 rounded border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={onClose} className="flex-1 h-9 rounded border border-border text-sm font-medium hover:bg-secondary/50 transition-colors">
              Cancel
            </button>
            <button
              data-testid="button-send-submit"
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending || !to || !amount}
              className="flex-1 h-9 rounded bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {mutation.isPending ? "Sending…" : "Send"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function WalletPage() {
  const params = useParams<{ addr: string }>();
  const addr = params.addr ?? "";
  const [network, setNetwork] = useState<"mainnet" | "testnet">("mainnet");
  const [showSend, setShowSend] = useState(false);

  const { data: walletData, isLoading: walletLoading } = useQuery<any>({
    queryKey: [`/api/${network}/wallet/${addr}`],
    enabled: !!addr && addr.startsWith("zth1"),
  });

  const txs: any[] = Array.isArray(walletData?.transactions) ? walletData.transactions : [];
  const symbol = network === "testnet" ? "tZTH" : "ZTH";

  const isZth = addr.startsWith("zth1");
  const isEvm = addr.startsWith("0x") && addr.length === 42;
  const isSol = !addr.startsWith("0x") && !addr.startsWith("zth") && addr.length >= 32 && addr.length <= 44;

  if (!addr) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground">Wallet Lookup</h1>
        <p className="text-muted-foreground text-sm">Enter any wallet address to view balances across ZTH, Ethereum, and Solana networks.</p>
        <AddressSearch />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showSend && isZth && (
        <SendModal address={addr} network={network} onClose={() => setShowSend(false)} />
      )}

      <div className="flex items-center gap-3">
        <Link href="/">
          <span className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground cursor-pointer">
            <ChevronLeft className="w-4 h-4" />
            Home
          </span>
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm font-mono text-foreground truncate">{shortHash(addr, 10)}</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            Wallet
          </h1>
          <div className="flex items-center gap-1 mt-1">
            <p className="text-xs font-mono text-muted-foreground break-all">{addr}</p>
            <CopyBtn text={addr} />
          </div>
          {walletData?.walletName && (
            <Badge variant="outline" className="mt-2 text-xs">{walletData.walletName}</Badge>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {isZth && (
            <>
              <div className="flex items-center rounded-lg border border-border overflow-hidden text-xs">
                <button
                  data-testid="button-network-mainnet"
                  onClick={() => setNetwork("mainnet")}
                  className={`px-3 py-1.5 font-medium transition-colors ${network === "mainnet" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary/60"}`}
                >
                  Mainnet
                </button>
                <button
                  data-testid="button-network-testnet"
                  onClick={() => setNetwork("testnet")}
                  className={`px-3 py-1.5 font-medium transition-colors ${network === "testnet" ? "bg-amber-500 text-white" : "text-muted-foreground hover:bg-secondary/60"}`}
                >
                  Testnet
                </button>
              </div>
              <button
                data-testid="button-send-zth"
                onClick={() => setShowSend(true)}
                className="flex items-center gap-1.5 h-8 px-4 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                Send {symbol}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Balance cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isZth && (
          <>
            <ZthBalance address={addr} network="mainnet" />
            <ZthBalance address={addr} network="testnet" />
          </>
        )}
        {isEvm && EVM_CHAINS.map(chain => (
          <EvmBalance key={chain.id} address={addr} chain={chain} />
        ))}
        {isSol && <SolBalance address={addr} />}
        {!isZth && !isEvm && !isSol && (
          <Card>
            <CardContent className="p-5 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
              <p className="text-sm text-muted-foreground">Unknown address format. ZTH addresses start with zth1, EVM addresses start with 0x (42 chars), Solana addresses are 32–44 chars.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ZTH Transaction History */}
      {isZth && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <ArrowLeftRight className="w-4 h-4 text-primary" />
              Transaction History
              <Badge variant="outline" className="text-xs ml-1">{network === "testnet" ? "Testnet" : "Mainnet"}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {walletLoading ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 mb-2" />)
            ) : txs.length === 0 ? (
              <div className="text-center py-10">
                <ArrowLeftRight className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground text-sm">No transactions on {network}</p>
              </div>
            ) : (
              <div className="divide-y divide-border/40">
                {txs.map((tx: any, i: number) => {
                  const hash = tx.hash ?? "";
                  const from = tx.from ?? "";
                  const to = tx.to ?? "";
                  const isIncoming = to.toLowerCase() === addr.toLowerCase();
                  const ts = tx.timestamp;
                  const status = tx.status ?? "pending";
                  const type = tx.type ?? "transfer";
                  const amount = parseFloat(tx.amount ?? "0");
                  return (
                    <div key={hash || i} className="grid grid-cols-[auto_1fr_auto_auto] gap-3 items-center py-3 hover:bg-secondary/30 rounded-lg px-3 -mx-3 transition-colors">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isIncoming ? "bg-green-500/15" : "bg-red-500/15"}`}>
                        {isIncoming ? <TrendingDown className="w-4 h-4 text-green-400" /> : <TrendingUp className="w-4 h-4 text-red-400" />}
                      </div>
                      <div className="min-w-0">
                        <Link href={`/tx/${hash}`}>
                          <span className="text-sm font-mono text-primary hover:underline cursor-pointer truncate block">{shortHash(hash, 10)}</span>
                        </Link>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <span>{isIncoming ? "from" : "to"}</span>
                          <Link href={`/address/${isIncoming ? from : to}`}>
                            <span className="font-mono hover:text-primary cursor-pointer">{shortHash(isIncoming ? from : to, 6)}</span>
                          </Link>
                          <Badge variant="outline" className="text-xs capitalize">{type}</Badge>
                        </div>
                      </div>
                      <p className={`text-sm font-medium ${isIncoming ? "text-green-400" : "text-red-400"}`}>
                        {isIncoming ? "+" : "-"}{parseFloat(tx.amount).toFixed(4)} {symbol}
                      </p>
                      <div className="text-right">
                        <Badge variant={status === "success" ? "success" : "destructive"} className="text-xs">{status}</Badge>
                        <p className="text-xs text-muted-foreground mt-0.5">{ts ? timeAgo(ts) : "—"}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
