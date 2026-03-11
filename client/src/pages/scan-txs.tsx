import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowLeftRight, Clock } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { shortHash, timeAgo, formatZTH } from "@/lib/chain-utils";

const TX_TYPE_COLORS: Record<string, "success" | "info" | "warning" | "outline"> = {
  transfer: "info",
  stake: "success",
  unstake: "warning",
  delegate: "success",
  undelegate: "warning",
};

function TxRow({ tx }: { tx: any }) {
  const hash = tx.hash ?? "";
  const from = tx.from ?? "";
  const to = tx.to ?? "";
  const ts = tx.timestamp;
  const status = tx.status ?? "pending";
  const type = tx.type ?? "transfer";
  const amount = parseFloat(tx.amount ?? "0");
  const gasFee = parseFloat(tx.gasFee ?? "0");

  return (
    <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 items-center py-3.5 hover:bg-secondary/30 rounded-lg px-4 -mx-4 transition-colors group">
      <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center shrink-0">
        <ArrowLeftRight className="w-4 h-4 text-accent-foreground" />
      </div>
      <div className="min-w-0">
        <Link href={`/tx/${hash}`}>
          <span className="text-sm font-mono text-primary hover:underline cursor-pointer block truncate" data-testid={`link-tx-${hash.slice(0, 8)}`}>
            {shortHash(hash, 12)}
          </span>
        </Link>
        <div className="flex items-center gap-2 mt-0.5">
          <Link href={`/address/${from}`}>
            <span className="text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer font-mono">{shortHash(from, 6)}</span>
          </Link>
          <span className="text-xs text-muted-foreground">→</span>
          <Link href={`/address/${to}`}>
            <span className="text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer font-mono">{shortHash(to, 6)}</span>
          </Link>
        </div>
      </div>
      <div className="text-right hidden sm:block">
        <p className="text-sm text-foreground font-medium">{formatZTH(amount)}</p>
        <p className="text-xs text-muted-foreground">fee: {gasFee.toFixed(6)} ZTH</p>
      </div>
      <div className="text-right space-y-1">
        <div className="flex flex-col items-end gap-1">
          <Badge variant={TX_TYPE_COLORS[type] ?? "outline"} className="text-xs capitalize">{type}</Badge>
          <Badge variant={status === "success" ? "success" : "destructive"} className="text-xs">{status}</Badge>
        </div>
        <p className="text-xs text-muted-foreground flex items-center justify-end gap-1">
          <Clock className="w-3 h-3" />
          {ts ? timeAgo(ts) : "—"}
        </p>
      </div>
    </div>
  );
}

export default function ScanTxs() {
  const { data, isLoading, error } = useQuery<any>({
    queryKey: ["/api/transactions?limit=50"],
    refetchInterval: 12_000,
  });

  const txs: any[] = Array.isArray(data) ? data : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ArrowLeftRight className="w-6 h-6 text-primary" />
            Transactions
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Latest transactions on Zerith Chain</p>
        </div>
        {!isLoading && txs.length > 0 && (
          <Badge variant="outline" className="text-xs">{txs.length} txs</Badge>
        )}
      </div>

      <Card>
        <CardHeader className="pb-0 pt-5 px-4">
          <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 items-center pb-3 border-b border-border">
            <div className="w-9" />
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Hash / From → To</p>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right hidden sm:block">Amount</p>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Type / Status</p>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          {isLoading ? (
            <div className="space-y-2 pt-2">{Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-destructive text-sm">Failed to load transactions.</p>
            </div>
          ) : txs.length === 0 ? (
            <div className="text-center py-12">
              <ArrowLeftRight className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No transactions found</p>
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {txs.map((tx) => <TxRow key={tx.hash} tx={tx} />)}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
