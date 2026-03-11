import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Blocks, ArrowLeftRight, Users, Activity, ChevronRight, Zap, Globe, Cpu, Wallet, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { shortHash, timeAgo, formatNumber, formatZTH } from "@/lib/chain-utils";
import { useState } from "react";
import zerithLogo from "@assets/zerith-logo_1773195626329.png";

function StatCard({ label, value, icon: Icon, sub, loading }: {
  label: string; value?: string; icon: React.ElementType; sub?: string; loading?: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5 min-w-0">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{label}</p>
            {loading ? <Skeleton className="h-7 w-28" /> : (
              <p className="text-2xl font-bold text-foreground truncate">{value ?? "—"}</p>
            )}
            {sub && !loading && <p className="text-xs text-muted-foreground">{sub}</p>}
          </div>
          <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center shrink-0 ml-3">
            <Icon style={{ width: 18, height: 18 }} className="text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function BlockRow({ block }: { block: any }) {
  const height = block.height ?? 0;
  const hash = block.hash ?? "";
  const txCount = block.transactionCount ?? block.txCount ?? 0;
  const ts = block.timestamp;
  const validatorName = block.validatorName ?? shortHash(block.validator ?? "", 6);
  return (
    <div className="flex items-center justify-between py-3 hover:bg-secondary/30 rounded-lg px-3 -mx-3 transition-colors group">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Blocks className="w-4 h-4 text-primary" />
        </div>
        <div className="min-w-0">
          <Link href={`/block/${height}`}>
            <span className="text-sm font-semibold text-primary hover:underline cursor-pointer" data-testid={`link-block-${height}`}>
              #{formatNumber(height)}
            </span>
          </Link>
          <p className="text-xs text-muted-foreground">{validatorName}</p>
        </div>
      </div>
      <div className="text-right shrink-0">
        <Badge variant="outline" className="text-xs">{txCount} txs</Badge>
        <p className="text-xs text-muted-foreground mt-1">{ts ? timeAgo(ts) : "—"}</p>
      </div>
    </div>
  );
}

function TxRow({ tx }: { tx: any }) {
  const hash = tx.hash ?? "";
  const from = tx.from ?? "";
  const to = tx.to ?? "";
  const ts = tx.timestamp;
  const status = tx.status ?? "pending";
  const amount = parseFloat(tx.amount ?? "0");
  return (
    <div className="flex items-center justify-between py-3 hover:bg-secondary/30 rounded-lg px-3 -mx-3 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
          <ArrowLeftRight className="w-4 h-4 text-purple-500" />
        </div>
        <div className="min-w-0">
          <Link href={`/tx/${hash}`}>
            <span className="text-sm font-mono text-primary hover:underline cursor-pointer truncate block">{shortHash(hash, 10)}</span>
          </Link>
          <p className="text-xs text-muted-foreground truncate">
            <Link href={`/address/${from}`}><span className="hover:text-primary cursor-pointer">{shortHash(from, 6)}</span></Link>
            <span className="mx-1">→</span>
            <Link href={`/address/${to}`}><span className="hover:text-primary cursor-pointer">{shortHash(to, 6)}</span></Link>
          </p>
        </div>
      </div>
      <div className="text-right shrink-0 space-y-1">
        <p className="text-sm font-medium text-foreground">{formatZTH(amount)}</p>
        <Badge variant={status === "success" ? "success" : "destructive"} className="text-xs">{status}</Badge>
      </div>
    </div>
  );
}

function AddressSearch() {
  const [addr, setAddr] = useState("");
  const [, setLocation] = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = addr.trim();
    if (!q) return;
    setLocation(`/wallet/${q}`);
  };

  return (
    <form onSubmit={handleSearch} className="flex gap-2">
      <div className="relative flex-1">
        <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          data-testid="input-wallet-search"
          value={addr}
          onChange={e => setAddr(e.target.value)}
          placeholder="Enter ZTH address (zth1…), ETH (0x…) or Solana address"
          className="w-full pl-10 pr-4 h-11 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
        />
      </div>
      <button
        data-testid="button-wallet-lookup"
        type="submit"
        className="h-11 px-6 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors shrink-0"
      >
        View Wallet
      </button>
    </form>
  );
}

export default function ScanHome() {
  const { data: status, isLoading: statusLoading } = useQuery<any>({ queryKey: ["/api/network/status"] });
  const { data: blocks, isLoading: blocksLoading } = useQuery<any[]>({ queryKey: ["/api/blocks"] });
  const { data: txs, isLoading: txsLoading } = useQuery<any[]>({ queryKey: ["/api/transactions"] });

  const blockHeight = status?.blockHeight ?? 0;
  const validators = status?.activeValidators ?? 0;
  const totalTx = status?.totalTransactions ?? 0;
  const supply = status?.totalSupply ?? "0";

  const blockList: any[] = Array.isArray(blocks) ? blocks : [];
  const txList: any[] = Array.isArray(txs) ? txs : [];

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-background border border-primary/20 p-8">
        <div className="flex items-center gap-4 mb-6">
          <img src={zerithLogo} alt="ZerithChain" className="h-12 w-auto" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">ZerithWallet</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Multi-chain wallet — ZTH Mainnet · ZTH Testnet · Ethereum · Solana
            </p>
          </div>
        </div>
        <AddressSearch />
        <div className="flex flex-wrap gap-3 mt-4">
          <Badge variant="outline" className="text-xs border-green-400/40 text-green-400 bg-green-400/10">● Mainnet Live</Badge>
          <Badge variant="outline" className="text-xs border-amber-400/40 text-amber-400 bg-amber-400/10">● Testnet Active</Badge>
          <Badge variant="outline" className="text-xs border-blue-400/40 text-blue-400 bg-blue-400/10">ETH & SOL Support</Badge>
        </div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Block Height" value={`#${formatNumber(blockHeight)}`} icon={Blocks} loading={statusLoading} />
        <StatCard label="Active Validators" value={`${validators}`} icon={Users} loading={statusLoading} />
        <StatCard label="Total Transactions" value={formatNumber(totalTx)} icon={Activity} loading={statusLoading} sub="on Zerith Mainnet" />
        <StatCard label="Total Supply" value={`1B ZTH`} icon={Zap} loading={statusLoading} sub="Zerith Mainnet" />
      </div>

      {/* Blocks + Transactions */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Blocks className="w-4 h-4 text-primary" />
              Latest Blocks
            </CardTitle>
            <Link href="/blocks">
              <span className="text-xs text-primary hover:underline cursor-pointer flex items-center gap-1">
                View All <ChevronRight className="w-3 h-3" />
              </span>
            </Link>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {blocksLoading ? (
              Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 mb-2" />)
            ) : blockList.length === 0 ? (
              <div className="py-12 text-center">
                <Blocks className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-sm text-muted-foreground">No blocks yet on Mainnet</p>
                <p className="text-xs text-muted-foreground mt-1">Genesis block will appear after the first transaction</p>
              </div>
            ) : (
              blockList.slice(0, 8).map((b: any) => <BlockRow key={b.height} block={b} />)
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <ArrowLeftRight className="w-4 h-4 text-primary" />
              Latest Transactions
            </CardTitle>
            <Link href="/txs">
              <span className="text-xs text-primary hover:underline cursor-pointer flex items-center gap-1">
                View All <ChevronRight className="w-3 h-3" />
              </span>
            </Link>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {txsLoading ? (
              Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 mb-2" />)
            ) : txList.length === 0 ? (
              <div className="py-12 text-center">
                <ArrowLeftRight className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-sm text-muted-foreground">No transactions yet on Mainnet</p>
                <p className="text-xs text-muted-foreground mt-1">This is a fresh mainnet — submit the first transaction!</p>
              </div>
            ) : (
              txList.slice(0, 8).map((tx: any) => <TxRow key={tx.hash} tx={tx} />)
            )}
          </CardContent>
        </Card>
      </div>

      {/* Network info cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="border-primary/20">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
                <Globe className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Zerith Mainnet</p>
                <p className="text-xs text-green-400">● Live</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Chain ID: zerith-mainnet-1</p>
            <p className="text-xs text-muted-foreground">Symbol: ZTH</p>
            <p className="text-xs text-muted-foreground">Supply: 1,000,000,000 ZTH</p>
          </CardContent>
        </Card>
        <Card className="border-amber-500/20">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center">
                <Cpu className="w-4 h-4 text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Zerith Testnet</p>
                <p className="text-xs text-amber-400">● Test Network</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Chain ID: zerith-testnet-1</p>
            <p className="text-xs text-muted-foreground">Symbol: tZTH (test only)</p>
            <p className="text-xs text-muted-foreground">Supply: 1,000,000,000 tZTH</p>
          </CardContent>
        </Card>
        <Card className="border-blue-500/20">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center">
                <Wallet className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Multi-Chain Support</p>
                <p className="text-xs text-blue-400">● EVM + Solana</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Ethereum, BNB, Polygon</p>
            <p className="text-xs text-muted-foreground">Arbitrum, Base, Avalanche</p>
            <p className="text-xs text-muted-foreground">Solana</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
