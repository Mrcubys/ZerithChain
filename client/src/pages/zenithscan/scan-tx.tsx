import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Transaction } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { formatTimestamp, formatZTH, statusBadgeClass, txTypeBadgeClass, shortAddress } from "@/lib/chain-utils";
import { ArrowRightLeft, ArrowLeft, Copy, ArrowRight, Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ScanTx() {
  const { hash } = useParams<{ hash: string }>();
  const { toast } = useToast();
  const connectedAddress = localStorage.getItem("zerith-wallet-address") ?? "";

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

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (error || !tx) {
    return (
      <div className="text-center py-20">
        <ArrowRightLeft className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
        <h2 className="text-lg font-semibold">Transaction Not Found</h2>
        <Button variant="outline" size="sm" asChild className="mt-4">
          <Link href="/scan/txs"><ArrowLeft className="w-4 h-4 mr-1.5" />Back to Transactions</Link>
        </Button>
      </div>
    );
  }

  const isMyTx = tx.from === connectedAddress || tx.to === connectedAddress;

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center gap-3 flex-wrap">
        <Button variant="ghost" size="sm" asChild className="h-8 px-2">
          <Link href="/scan/txs"><ArrowLeft className="w-4 h-4 mr-1" />Transactions</Link>
        </Button>
        <Separator orientation="vertical" className="h-4" />
        <ArrowRightLeft className="w-4 h-4 text-muted-foreground" />
        <h1 className="font-semibold">Transaction</h1>
        <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium border ml-auto capitalize ${statusBadgeClass(tx.status)}`}>
          {tx.status}
        </span>
        {isMyTx && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium border bg-primary/10 text-primary border-primary/20">
            <Wallet className="w-3 h-3 mr-1" />Your Wallet
          </span>
        )}
      </div>
      <div className="font-mono text-xs text-muted-foreground break-all bg-muted/40 rounded-lg px-3 py-2">{tx.hash}</div>

      <Card className="rounded-2xl border-border/60 bg-white shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-center justify-center gap-6 py-4 flex-wrap">
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1.5">From</div>
              <Link href={`/scan/address/${tx.from}`} className={`font-mono text-sm hover:text-primary transition-colors ${tx.from === connectedAddress ? "text-primary font-semibold" : ""}`}>
                {shortAddress(tx.from)}
              </Link>
              {tx.from === connectedAddress && <div className="text-[10px] text-primary mt-0.5">Your Wallet</div>}
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <ArrowRight className="w-5 h-5 text-muted-foreground" />
              <div className="text-center">
                <div className="text-lg font-semibold font-mono">{formatZTH(tx.amount)}</div>
                <div className="text-xs text-muted-foreground">Gas: {formatZTH(tx.gasFee, 6)}</div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1.5">To</div>
              <Link href={`/scan/address/${tx.to}`} className={`font-mono text-sm hover:text-primary transition-colors ${tx.to === connectedAddress ? "text-primary font-semibold" : ""}`}>
                {shortAddress(tx.to)}
              </Link>
              {tx.to === connectedAddress && <div className="text-[10px] text-primary mt-0.5">Your Wallet</div>}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border/60 bg-white shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Transaction Details</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {[
            { label: "TX Hash", value: tx.hash, mono: true, copy: true },
            { label: "Status", value: tx.status, badge: statusBadgeClass(tx.status) },
            { label: "Type", value: tx.type, badge: txTypeBadgeClass(tx.type) },
            { label: "Block", value: tx.blockHeight.toLocaleString(), link: `/scan/block/${tx.blockHeight}` },
            { label: "Timestamp", value: formatTimestamp(tx.timestamp) },
            { label: "From", value: tx.from, mono: true, copy: true, link: `/scan/address/${tx.from}` },
            { label: "To", value: tx.to, mono: true, copy: true, link: `/scan/address/${tx.to}` },
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
                  <Link href={row.link} className="text-sm font-mono text-primary hover:underline">{row.value}</Link>
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
  );
}
