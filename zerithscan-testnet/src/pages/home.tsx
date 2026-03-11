import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { shortHash, formatZTH, timeAgo } from "@/lib/chain-utils";
import { Layers, ArrowRightLeft, Activity, Zap, Clock, Search, ArrowRight, FlaskConical } from "lucide-react";

interface Block {
  height: number; hash: string; timestamp: string;
  validatorName: string; validator: string; transactionCount: number; size: number;
}
interface Transaction {
  hash: string; from: string; to: string; amount: string;
  timestamp: string; status: string; type: string;
}
interface NetStatus {
  blockHeight: number; tps: number; averageBlockTime: number;
  totalValidators: number; activeValidators: number; totalTransactions: number;
  totalSupply: string; chainId: string;
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [, navigate] = useLocation();

  const { data: blocks, isLoading: blocksLoading } = useQuery<Block[]>({
    queryKey: ["/api/blocks?limit=10"],
    refetchInterval: 10000,
  });

  const { data: txs, isLoading: txsLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions?limit=10"],
    refetchInterval: 10000,
  });

  const { data: netStatus } = useQuery<NetStatus>({
    queryKey: ["/api/network/status"],
    refetchInterval: 15000,
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

  const blockList = Array.isArray(blocks) ? blocks : [];
  const txList = Array.isArray(txs) ? txs : [];

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="bg-gradient-to-br from-amber-500/10 via-amber-400/5 to-transparent rounded-2xl p-6 border border-amber-300/30">
        <div className="flex items-center gap-3 mb-2">
          <img src="/zerith-logo.png" alt="ZerithScan Testnet" className="h-10 w-auto" />
          <div>
            <h1 className="text-xl font-bold text-foreground">ZerithScan — Testnet Explorer</h1>
            <p className="text-sm text-muted-foreground">Chain ID: {netStatus?.chainId ?? "zerith-testnet-1"}</p>
          </div>
          <Badge variant="outline" className="ml-auto border-amber-300 text-amber-700 bg-amber-50 text-xs">
            ⚗ Test Network
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Testnet is for testing the Zerith blockchain only. Testnet ZTH (tZTH) has no real value.
        </p>
        <form onSubmit={handleSearch} className="flex gap-2 max-w-xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Block height, tx hash, or address…"
              className="pl-9 rounded-xl bg-white border-amber-200/60"
              data-testid="input-home-search"
            />
          </div>
          <Button type="submit" className="rounded-xl px-5 bg-amber-500 hover:bg-amber-600 text-white border-none" data-testid="button-search">
            Search
          </Button>
        </form>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Block Height", value: netStatus?.blockHeight != null ? `#${netStatus.blockHeight.toLocaleString()}` : "—", icon: Layers, color: "text-amber-600" },
          { label: "Block Time", value: netStatus?.averageBlockTime ? `${netStatus.averageBlockTime}s` : "—", icon: Clock, color: "text-blue-500" },
          { label: "Validators", value: netStatus?.activeValidators?.toString() ?? "—", icon: Activity, color: "text-green-500" },
          { label: "Total TXs", value: netStatus?.totalTransactions?.toLocaleString() ?? "0", icon: Zap, color: "text-amber-500" },
        ].map((stat, i) => (
          <Card key={i} className="shadow-none border-amber-200/40">
            <CardContent className="p-4 flex items-center gap-3">
              <stat.icon className={`w-5 h-5 ${stat.color} shrink-0`} />
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{stat.label}</p>
                <p className="text-base font-bold text-foreground truncate">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Genesis info */}
      <div className="rounded-xl border border-amber-200/60 bg-amber-50/30 p-4">
        <p className="text-xs font-semibold text-amber-700 mb-1">Genesis Transaction</p>
        <p className="text-xs text-muted-foreground">
          100,000,000 tZTH sent to <span className="font-mono text-foreground">zth100000000000000000000000000000000yutjs2</span> at genesis (block #1).
          Testnet ZTH is only for testing — it has no monetary value.
        </p>
      </div>

      {/* Blocks + Txs */}
      <div className="grid md:grid-cols-2 gap-5">
        <Card className="shadow-none border-amber-200/40">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-600" /> Latest Blocks
            </CardTitle>
            <Link href="/blocks" className="text-xs text-amber-600 hover:underline flex items-center gap-1" data-testid="link-all-blocks">
              All blocks <ArrowRight className="w-3 h-3" />
            </Link>
          </CardHeader>
          <CardContent className="px-3 pb-3 space-y-0.5">
            {blocksLoading ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg mb-1" />) :
              blockList.slice(0, 8).map((b) => (
                <div key={b.height} className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-amber-50/60 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                      <Layers className="w-3.5 h-3.5 text-amber-600" />
                    </div>
                    <div className="min-w-0">
                      <Link href={`/block/${b.height}`} className="text-sm font-semibold text-amber-700 hover:underline" data-testid={`link-block-${b.height}`}>
                        #{b.height.toLocaleString()}
                      </Link>
                      <p className="text-xs text-muted-foreground truncate">{b.validatorName}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <Badge variant="outline" className="text-[10px] border-amber-200 text-amber-700">{b.transactionCount} txs</Badge>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{timeAgo(b.timestamp)}</p>
                  </div>
                </div>
              ))
            }
          </CardContent>
        </Card>

        <Card className="shadow-none border-amber-200/40">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-amber-600" /> Latest Transactions
            </CardTitle>
            <Link href="/txs" className="text-xs text-amber-600 hover:underline flex items-center gap-1" data-testid="link-all-txs">
              All txs <ArrowRight className="w-3 h-3" />
            </Link>
          </CardHeader>
          <CardContent className="px-3 pb-3 space-y-0.5">
            {txsLoading ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg mb-1" />) :
              txList.length === 0 ? (
                <div className="py-10 text-center">
                  <ArrowRightLeft className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-40" />
                  <p className="text-sm text-muted-foreground">No transactions yet</p>
                </div>
              ) : (
                txList.slice(0, 8).map((tx) => (
                  <div key={tx.hash} className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-amber-50/60 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                        <ArrowRightLeft className="w-3.5 h-3.5 text-amber-600" />
                      </div>
                      <div className="min-w-0">
                        <Link href={`/tx/${tx.hash}`} className="text-xs font-mono text-amber-700 hover:underline truncate block">
                          {shortHash(tx.hash, 10)}
                        </Link>
                        <p className="text-[10px] text-muted-foreground">
                          {shortHash(tx.from, 6)} → {shortHash(tx.to, 6)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <p className="text-xs font-medium text-foreground">{formatZTH(parseFloat(tx.amount))} tZTH</p>
                      <Badge variant={tx.status === "success" ? "success" : "destructive"} className="text-[10px] mt-0.5">{tx.status}</Badge>
                    </div>
                  </div>
                ))
              )
            }
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
