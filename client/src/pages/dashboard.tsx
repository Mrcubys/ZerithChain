import { useQuery } from "@tanstack/react-query";
import type { NetworkStatus, Block, Transaction } from "@shared/schema";
import { StatCard } from "@/components/stat-card";
import { BlockRow } from "@/components/block-row";
import { TxRow } from "@/components/tx-row";
import { SearchBar } from "@/components/search-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  Layers, ArrowRightLeft, Zap, Clock, Shield, Coins,
  TrendingUp, ArrowRight,
} from "lucide-react";
import { formatCompact } from "@/lib/chain-utils";

export default function Dashboard() {
  const { data: status, isLoading: statusLoading } = useQuery<NetworkStatus>({
    queryKey: ["/api/network/status"],
    refetchInterval: 4000,
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
    <div className="flex flex-col min-h-full">
      <div className="border-b border-border px-6 py-6">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
          <div>
            <h1 className="text-xl font-semibold text-foreground">ZenithScan</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Zerith Chain block explorer</p>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-muted-foreground">Live</span>
          </div>
        </div>
        <SearchBar />
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            label="Block Height"
            value={status ? `${status.blockHeight.toLocaleString()}` : undefined}
            sub={`Epoch ${status?.epoch ?? "—"}`}
            icon={<Layers className="w-4 h-4" />}
            loading={statusLoading}
            testId="stat-block-height"
          />
          <StatCard
            label="Live TPS"
            value={status?.tps.toLocaleString()}
            sub={`Peak: ${(status?.peakTps ?? 5000).toLocaleString()}`}
            icon={<Zap className="w-4 h-4" />}
            valueColor="text-green-400"
            loading={statusLoading}
            testId="stat-tps"
          />
          <StatCard
            label="Transactions"
            value={status ? formatCompact(status.totalTransactions) : undefined}
            sub="All time"
            icon={<ArrowRightLeft className="w-4 h-4" />}
            loading={statusLoading}
            testId="stat-total-tx"
          />
          <StatCard
            label="Total Supply"
            value={status ? `${formatCompact(status.totalSupply)} ZTH` : undefined}
            sub={`Staked: ${status ? formatCompact(status.totalStaked) : "—"} ZTH`}
            icon={<Coins className="w-4 h-4" />}
            loading={statusLoading}
            testId="stat-supply"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            label="Validators"
            value={status ? `${status.activeValidators}/${status.totalValidators}` : undefined}
            sub="Active/Total"
            icon={<Shield className="w-4 h-4" />}
            loading={statusLoading}
            testId="stat-validators"
          />
          <StatCard
            label="Block Time"
            value={status ? `${status.averageBlockTime.toFixed(2)}s` : undefined}
            sub="Average"
            icon={<Clock className="w-4 h-4" />}
            loading={statusLoading}
            testId="stat-block-time"
          />
          <StatCard
            label="Circulating"
            value={status ? `${formatCompact(status.circulatingSupply)} ZTH` : undefined}
            sub="35% of supply"
            icon={<TrendingUp className="w-4 h-4" />}
            loading={statusLoading}
            testId="stat-circulating"
          />
          <StatCard
            label="Bonded"
            value={status ? `${(status.bondedRatio * 100).toFixed(2)}%` : undefined}
            sub="Staking ratio"
            icon={<Shield className="w-4 h-4" />}
            loading={statusLoading}
            testId="stat-bonded"
          />
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Layers className="w-4 h-4 text-muted-foreground" />
                Latest Blocks
              </CardTitle>
              <Button variant="ghost" size="sm" asChild className="text-xs">
                <Link href="/explorer" data-testid="link-view-all-blocks">
                  All blocks <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="pt-0">
              {blocksLoading
                ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 mb-1" />)
                : blocks?.map((block) => <BlockRow key={block.height} block={block} />)
              }
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-muted-foreground" />
                Latest Transactions
              </CardTitle>
              <Button variant="ghost" size="sm" asChild className="text-xs">
                <Link href="/explorer" data-testid="link-view-all-txs">
                  All txns <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="pt-0">
              {txLoading
                ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 mb-1" />)
                : transactions?.map((tx) => <TxRow key={tx.hash} tx={tx} />)
              }
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
