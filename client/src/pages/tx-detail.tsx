import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Transaction } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { formatTimestamp, formatZTH, statusBadgeClass, txTypeBadgeClass, shortAddress } from "@/lib/chain-utils";
import { ArrowRightLeft, ArrowLeft, Copy, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function TxDetail() {
  const { hash } = useParams<{ hash: string }>();
  const { toast } = useToast();

  const { data: tx, isLoading, error } = useQuery<Transaction>({
    queryKey: ["/api/transactions", hash],
    queryFn: async () => {
      const res = await fetch(`/api/transactions/${hash}`);
      if (!res.ok) throw new Error("Transaction not found");
      return res.json();
    },
  });

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: `${label} copied to clipboard.` });
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !tx) {
    return (
      <div className="p-6">
        <div className="text-center py-16">
          <ArrowRightLeft className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h2 className="text-xl font-display font-bold">Transaction Not Found</h2>
          <p className="text-muted-foreground mt-2 font-mono text-sm">{hash}</p>
          <Button variant="outline" asChild className="mt-4">
            <Link href="/explorer"><ArrowLeft className="w-4 h-4 mr-1.5" />Back to Explorer</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-auto">
      <div className="border-b border-border/50 px-6 py-5">
        <div className="flex items-center gap-3 flex-wrap">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/explorer"><ArrowLeft className="w-4 h-4 mr-1" />Explorer</Link>
          </Button>
          <Separator orientation="vertical" className="h-4" />
          <ArrowRightLeft className="w-5 h-5 text-neon-purple" />
          <h1 className="font-display text-xl font-bold">Transaction</h1>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium border ml-auto capitalize ${statusBadgeClass(tx.status)}`}>
            {tx.status}
          </span>
        </div>
        <div className="mt-2 font-mono text-xs text-muted-foreground truncate">{tx.hash}</div>
      </div>

      <div className="p-6 space-y-6 flex-1 overflow-auto">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-center gap-4 py-4 bg-card rounded-md border border-border/50">
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-1">From</div>
                <Link href={`/explorer/address/${tx.from}`} className="font-mono text-sm text-primary">
                  {shortAddress(tx.from)}
                </Link>
              </div>
              <div className="flex flex-col items-center gap-1">
                <ArrowRight className="w-5 h-5 text-muted-foreground" />
                <div className="text-center">
                  <div className="text-lg font-display font-bold text-foreground">{formatZTH(tx.amount)}</div>
                  <div className="text-xs text-muted-foreground">Gas: {formatZTH(tx.gasFee, 6)}</div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-1">To</div>
                <Link href={`/explorer/address/${tx.to}`} className="font-mono text-sm text-primary">
                  {shortAddress(tx.to)}
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-display">Transaction Details</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-0">
              {[
                { label: "TX Hash", value: tx.hash, mono: true, copy: true },
                { label: "Status", value: tx.status, badge: statusBadgeClass(tx.status) },
                { label: "Type", value: tx.type, badge: txTypeBadgeClass(tx.type) },
                { label: "Block", value: tx.blockHeight.toLocaleString(), link: `/explorer/block/${tx.blockHeight}` },
                { label: "Timestamp", value: formatTimestamp(tx.timestamp), mono: false },
                { label: "From", value: tx.from, mono: true, copy: true, link: `/explorer/address/${tx.from}` },
                { label: "To", value: tx.to, mono: true, copy: true, link: `/explorer/address/${tx.to}` },
                { label: "Amount", value: formatZTH(tx.amount) },
                { label: "Gas Fee", value: formatZTH(tx.gasFee, 6) },
                { label: "Nonce", value: tx.nonce.toString() },
              ].map((row, i) => (
                <div key={i} className="flex items-start gap-4 py-3 border-b border-border/40 last:border-0">
                  <span className="text-sm text-muted-foreground w-28 flex-shrink-0 pt-0.5">{row.label}</span>
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {row.badge ? (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border capitalize ${row.badge}`}>{row.value}</span>
                    ) : row.link ? (
                      <Link href={row.link} className="text-sm text-primary font-mono">{row.value}</Link>
                    ) : (
                      <span className={`text-sm break-all ${row.mono ? "font-mono text-foreground/80" : "font-medium"}`}>{row.value}</span>
                    )}
                    {row.copy && (
                      <button
                        onClick={() => copy(row.value as string, row.label)}
                        className="flex-shrink-0 p-1 rounded text-muted-foreground"
                        data-testid={`copy-${row.label.toLowerCase().replace(/\s+/g, "-")}`}
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
