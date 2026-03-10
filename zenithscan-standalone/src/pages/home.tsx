import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { shortHash, shortAddress, formatZTH, timeAgo, statusBadgeClass, txTypeBadgeClass } from "@/lib/chain-utils";
import { Layers, ArrowRightLeft, Activity, Zap, Clock, Search, ArrowRight } from "lucide-react";

interface Block {
  height: number; hash: string; timestamp: string;
  validatorName: string; validator: string; transactionCount: number; size: number;
}
interface Transaction {
  hash: string; from: string; to: string; amount: string;
  timestamp: string; status: string; type: string;
}
interface NetStatus {
  tps: number; blockTime: number; latestBlock: number; totalValidators: number;
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [, navigate] = useLocation();

  const { data: blocks, isLoading: blocksLoading } = useQuery<Block[]>({
    queryKey: ["/api/blocks?limit=10"],
    refetchInterval: 5000,
  });

  const { data: txs, isLoading: txsLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions?limit=10"],
    refetchInterval: 5000,
  });

  const { data: netStatus } = useQuery<NetStatus>({
    queryKey: ["/api/network/status"],
    refetchInterval: 10000,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    if (/^\d+$/.test(q)) navigate(`/block/${q}`);
    else if (q.length === 64 && /^[0-9A-Fa-f]+$/.test(q)) navigate(`/tx/${q}`);
    else navigate(`/address/${q}`);
    setQuery("");
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-2xl p-6 border border-primary/15">
        <h1 className="text-xl font-bold text-foreground mb-1">Zerith Chain Explorer</h1>
        <p className="text-sm text-muted-foreground mb-4">Search blocks, transactions, and addresses on the Zerith Chain network.</p>
        <form onSubmit={handleSearch} className="flex gap-2 max-w-xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Block height, tx hash, or address…"
              className="pl-9 rounded-xl bg-white border-border/60"
              data-testid="input-home-search"
            />
          </div>
          <Button type="submit" className="rounded-xl px-5" data-testid="button-search">
            Search
          </Button>
        </form>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Latest Block", value: netStatus?.latestBlock?.toLocaleString() ?? "—", icon: Layers, color: "text-primary" },
          { label: "Avg Block Time", value: netStatus?.blockTime ? `${netStatus.blockTime}s` : "—", icon: Clock, color: "text-blue-500" },
          { label: "Network TPS", value: netStatus?.tps?.toFixed(1) ?? "—", icon: Zap, color: "text-yellow-500" },
          { label: "Validators", value: netStatus?.totalValidators?.toString() ?? "—", icon: Activity, color: "text-green-500" },
        ].map((stat, i) => (
          <Card key={i} className="rounded-2xl border-border/60 bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                <span className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</span>
              </div>
              <div className="text-xl font-bold font-mono text-foreground" data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, "-")}`}>
                {stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="rounded-2xl border-border/60 bg-white shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Layers className="w-4 h-4 text-muted-foreground" />
              Latest Blocks
            </CardTitle>
            <Link href="/blocks" className="text-xs text-primary hover:underline font-medium" data-testid="link-all-blocks">View all →</Link>
          </CardHeader>
          <CardContent className="pt-0 p-0">
            {blocksLoading
              ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14 mx-4 mb-2 rounded-xl" />)
              : blocks?.map((block) => (
                <div key={block.height} className="flex items-center gap-3 px-4 py-3 border-b border-border/40 last:border-0 hover:bg-muted/30 transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Layers className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/block/${block.height}`} className="font-mono font-semibold text-sm hover:text-primary transition-colors" data-testid={`link-block-${block.height}`}>
                      #{block.height.toLocaleString()}
                    </Link>
                    <div className="text-xs text-muted-foreground mt-0.5 truncate">{block.validatorName}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xs text-muted-foreground">{timeAgo(block.timestamp)}</div>
                    <div className="text-xs font-mono text-muted-foreground mt-0.5">{block.transactionCount} txns</div>
                  </div>
                </div>
              ))
            }
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/60 bg-white shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-muted-foreground" />
              Latest Transactions
            </CardTitle>
            <Link href="/txs" className="text-xs text-primary hover:underline font-medium" data-testid="link-all-txs">View all →</Link>
          </CardHeader>
          <CardContent className="pt-0 p-0">
            {txsLoading
              ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14 mx-4 mb-2 rounded-xl" />)
              : txs?.map((tx) => (
                <div key={tx.hash} className="flex items-center gap-3 px-4 py-3 border-b border-border/40 last:border-0 hover:bg-muted/30 transition-colors">
                  <div className="flex-shrink-0">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium border capitalize ${txTypeBadgeClass(tx.type)}`}>
                      {tx.type}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/tx/${tx.hash}`} className="font-mono text-xs text-foreground/80 hover:text-primary transition-colors truncate block" data-testid={`link-tx-${tx.hash.slice(0, 8)}`}>
                      {shortHash(tx.hash)}
                    </Link>
                    <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground">
                      <Link href={`/address/${tx.from}`} className="font-mono truncate max-w-[80px] hover:text-foreground">{shortAddress(tx.from)}</Link>
                      <ArrowRight className="w-2.5 h-2.5 flex-shrink-0" />
                      <Link href={`/address/${tx.to}`} className="font-mono truncate max-w-[80px] hover:text-foreground">{shortAddress(tx.to)}</Link>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-mono text-xs font-medium">{formatZTH(tx.amount, 2)}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{timeAgo(tx.timestamp)}</div>
                  </div>
                </div>
              ))
            }
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
