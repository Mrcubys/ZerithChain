import { useQuery } from "@tanstack/react-query";
import type { NetworkStatus, Block, Transaction } from "@shared/schema";
import { StatCard } from "@/components/stat-card";
import { BlockRow } from "@/components/block-row";
import { TxRow } from "@/components/tx-row";
import { SearchBar } from "@/components/search-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  Layers, ArrowRightLeft, Zap, Clock, Shield, Coins,
  TrendingUp, ArrowRight, RefreshCw,
} from "lucide-react";
import { formatCompact, formatZTH } from "@/lib/chain-utils";

export default function Dashboard() {
  const { data: status, isLoading: statusLoading } = useQuery<NetworkStatus>({
    queryKey: ["/api/network/status"],
    refetchInterval: 3000,
  });

  const { data: blocks, isLoading: blocksLoading } = useQuery<Block[]>({
    queryKey: ["/api/blocks"],
    queryFn: async () => {
      const res = await fetch("/api/blocks?limit=8");
      return res.json();
    },
    refetchInterval: 4000,
  });

  const { data: transactions, isLoading: txLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
    queryFn: async () => {
      const res = await fetch("/api/transactions?limit=10");
      return res.json();
    },
    refetchInterval: 4000,
  });

  return (
    <div className="flex flex-col h-full overflow-auto bg-background">
      <div className="relative overflow-hidden bg-grid-pattern bg-grid border-b border-border/50">
        <div className="absolute inset-0 bg-hero-gradient pointer-events-none" />
        <div className="relative px-6 py-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <Badge variant="secondary" className="text-xs font-mono">
                  zerith-mainnet-1
                </Badge>
              </div>
              <h1 className="font-display text-3xl font-bold text-foreground">ZenithScan</h1>
              <p className="text-muted-foreground mt-1 text-sm">
                The official block explorer for Zerith Chain
              </p>
            </div>
            <div className="flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 text-muted-foreground animate-spin" style={{ animationDuration: "3s" }} />
              <span className="text-xs text-muted-foreground">Live updates</span>
            </div>
          </div>
          <div className="mt-5">
            <SearchBar />
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6 flex-1">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Block Height"
            value={status ? `#${status.blockHeight.toLocaleString()}` : undefined}
            sub={`Epoch ${status?.epoch ?? "..."}`}
            icon={<Layers className="w-4 h-4" />}
            accent="text-primary"
            loading={statusLoading}
            testId="stat-block-height"
          />
          <StatCard
            label="Live TPS"
            value={status?.tps.toLocaleString()}
            sub={`Peak: ${status?.peakTps?.toLocaleString() ?? "5,000"} TPS`}
            icon={<Zap className="w-4 h-4" />}
            accent="text-neon-cyan"
            loading={statusLoading}
            testId="stat-tps"
          />
          <StatCard
            label="Total Transactions"
            value={status ? formatCompact(status.totalTransactions) : undefined}
            sub="All time"
            icon={<ArrowRightLeft className="w-4 h-4" />}
            accent="text-neon-purple"
            loading={statusLoading}
            testId="stat-total-tx"
          />
          <StatCard
            label="Total Supply"
            value={status ? `${formatCompact(status.totalSupply)} ZTH` : undefined}
            sub={`Staked: ${status ? formatCompact(status.totalStaked) : "..."} ZTH`}
            icon={<Coins className="w-4 h-4" />}
            accent="text-neon-green"
            loading={statusLoading}
            testId="stat-supply"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Validators"
            value={status ? `${status.activeValidators}/${status.totalValidators}` : undefined}
            sub="Active/Total"
            icon={<Shield className="w-4 h-4" />}
            accent="text-purple-400"
            loading={statusLoading}
            testId="stat-validators"
          />
          <StatCard
            label="Block Time"
            value={status ? `${status.averageBlockTime.toFixed(2)}s` : undefined}
            sub="Average"
            icon={<Clock className="w-4 h-4" />}
            accent="text-orange-400"
            loading={statusLoading}
            testId="stat-block-time"
          />
          <StatCard
            label="Circulating"
            value={status ? `${formatCompact(status.circulatingSupply)} ZTH` : undefined}
            sub="35% of supply"
            icon={<TrendingUp className="w-4 h-4" />}
            accent="text-blue-400"
            loading={statusLoading}
            testId="stat-circulating"
          />
          <StatCard
            label="Bonded Ratio"
            value={status ? `${(status.bondedRatio * 100).toFixed(2)}%` : undefined}
            sub="Stake ratio"
            icon={<Shield className="w-4 h-4" />}
            accent="text-cyan-400"
            loading={statusLoading}
            testId="stat-bonded"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-3">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                Latest Blocks
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/explorer" data-testid="link-view-all-blocks">
                  View All <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="pt-0">
              {blocksLoading
                ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 mb-2" />)
                : blocks?.map((block) => <BlockRow key={block.height} block={block} />)
              }
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-3">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-neon-purple" />
                Latest Transactions
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/explorer" data-testid="link-view-all-txs">
                  View All <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="pt-0">
              {txLoading
                ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 mb-2" />)
                : transactions?.map((tx) => <TxRow key={tx.hash} tx={tx} />)
              }
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
