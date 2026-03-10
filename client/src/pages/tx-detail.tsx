import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Transaction } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    toast({ title: "Copied", description: `${label} copied.` });
  };

  if (isLoading) return <div className="p-6 space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64 w-full" /></div>;

  if (error || !tx) {
    return (
      <div className="p-6 text-center py-16">
        <ArrowRightLeft className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
        <h2 className="text-lg font-semibold">Transaction Not Found</h2>
        <Button variant="outline" size="sm" asChild className="mt-4">
          <Link href="/explorer"><ArrowLeft className="w-4 h-4 mr-1.5" />Back to Explorer</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      <div className="border-b border-border px-6 py-4">
        <div className="flex items-center gap-3 flex-wrap">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/explorer"><ArrowLeft className="w-4 h-4 mr-1" />Explorer</Link>
          </Button>
          <Separator orientation="vertical" className="h-4" />
          <ArrowRightLeft className="w-4 h-4 text-muted-foreground" />
          <h1 className="font-semibold">Transaction</h1>
          <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium border ml-auto capitalize ${statusBadgeClass(tx.status)}`}>
            {tx.status}
          </span>
        </div>
        <div className="mt-1 font-mono text-xs text-muted-foreground truncate">{tx.hash}</div>
      </div>

      <div className="p-6 space-y-5">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-center gap-6 py-4">
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-1.5">From</div>
                <Link href={`/explorer/address/${tx.from}`} className="font-mono text-sm hover:text-foreground/80">{shortAddress(tx.from)}</Link>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <div className="text-center">
                  <div className="text-lg font-semibold font-mono">{formatZTH(tx.amount)}</div>
                  <div className="text-xs text-muted-foreground">Gas: {formatZTH(tx.gasFee, 6)}</div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-1.5">To</div>
                <Link href={`/explorer/address/${tx.to}`} className="font-mono text-sm hover:text-foreground/80">{shortAddress(tx.to)}</Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Transaction Details</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {[
              { label: "TX Hash", value: tx.hash, mono: true, copy: true },
              { label: "Status", value: tx.status, badge: statusBadgeClass(tx.status) },
              { label: "Type", value: tx.type, badge: txTypeBadgeClass(tx.type) },
              { label: "Block", value: tx.blockHeight.toLocaleString(), link: `/explorer/block/${tx.blockHeight}` },
              { label: "Timestamp", value: formatTimestamp(tx.timestamp) },
              { label: "From", value: tx.from, mono: true, copy: true, link: `/explorer/address/${tx.from}` },
              { label: "To", value: tx.to, mono: true, copy: true, link: `/explorer/address/${tx.to}` },
              { label: "Amount", value: formatZTH(tx.amount) },
              { label: "Gas Fee", value: formatZTH(tx.gasFee, 6) },
              { label: "Nonce", value: tx.nonce.toString() },
            ].map((row, i) => (
              <div key={i} className="flex items-start gap-4 py-2.5 border-b border-border/40 last:border-0">
                <span className="text-xs text-muted-foreground w-24 flex-shrink-0 pt-0.5">{row.label}</span>
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {row.badge ? (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium border capitalize ${row.badge}`}>{row.value}</span>
                  ) : row.link ? (
                    <Link href={row.link} className="text-sm font-mono hover:text-foreground/80">{row.value}</Link>
                  ) : (
                    <span className={`text-sm break-all ${row.mono ? "font-mono text-muted-foreground" : "font-medium"}`}>{row.value}</span>
                  )}
                  {row.copy && !row.link && (
                    <button onClick={() => copy(row.value as string, row.label)} className="flex-shrink-0 p-0.5 text-muted-foreground hover:text-foreground" data-testid={`copy-${row.label.toLowerCase().replace(/\s+/g, "-")}`}>
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
