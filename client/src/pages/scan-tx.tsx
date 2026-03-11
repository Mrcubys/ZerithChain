import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { ArrowLeftRight, ChevronLeft, Copy, CheckCheck, Clock, Blocks } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { timeAgo, formatZTH, formatNumber, shortHash } from "@/lib/chain-utils";
import { useState } from "react";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded" data-testid="button-copy-hash">
      {copied ? <CheckCheck className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

function DetailRow({ label, children, mono = false, value }: {
  label: string; children?: React.ReactNode; mono?: boolean; value?: string | number | null;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-3 border-b border-border/50 last:border-0">
      <p className="text-sm text-muted-foreground sm:w-44 shrink-0 font-medium">{label}</p>
      <div className="flex-1 min-w-0">
        {children ?? <p className={`text-sm text-foreground break-all ${mono ? "font-mono" : ""}`}>{value ?? "—"}</p>}
      </div>
    </div>
  );
}

export default function ScanTx() {
  const params = useParams<{ hash: string }>();
  const hash = params.hash;

  const { data: tx, isLoading, error } = useQuery<any>({
    queryKey: [`/api/transactions/${hash}`],
  });

  const status = tx?.status ?? "pending";
  const type = tx?.type ?? "transfer";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/txs">
          <span className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
            <ChevronLeft className="w-4 h-4" />
            Transactions
          </span>
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm font-mono text-foreground truncate">{shortHash(hash, 12)}</span>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <ArrowLeftRight className="w-6 h-6 text-primary" />
          Transaction Details
        </h1>
        {!isLoading && tx && (
          <>
            <Badge variant={status === "success" ? "success" : "destructive"}>{status}</Badge>
            <Badge variant="outline" className="capitalize">{type}</Badge>
          </>
        )}
      </div>

      {isLoading ? (
        <Card><CardContent className="p-6 space-y-4">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</CardContent></Card>
      ) : error || !tx ? (
        <Card><CardContent className="p-12 text-center">
          <ArrowLeftRight className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Transaction not found or API unavailable</p>
        </CardContent></Card>
      ) : (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Overview</CardTitle></CardHeader>
          <CardContent className="px-6 pb-6">
            <DetailRow label="Transaction Hash" mono>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono text-foreground break-all">{tx.hash}</span>
                <CopyButton text={tx.hash} />
              </div>
            </DetailRow>
            <DetailRow label="Status">
              <div className="flex items-center gap-2">
                <Badge variant={status === "success" ? "success" : "destructive"}>{status}</Badge>
                <Badge variant="outline" className="capitalize">{type}</Badge>
              </div>
            </DetailRow>
            <DetailRow label="Block">
              {tx.blockHeight != null ? (
                <Link href={`/block/${tx.blockHeight}`}>
                  <span className="text-sm text-primary hover:underline cursor-pointer flex items-center gap-1">
                    <Blocks className="w-3.5 h-3.5" />
                    #{formatNumber(tx.blockHeight)}
                  </span>
                </Link>
              ) : <span className="text-sm text-muted-foreground">Pending</span>}
            </DetailRow>
            <DetailRow label="Timestamp">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-sm text-foreground">{tx.timestamp ? new Date(tx.timestamp).toLocaleString() : "—"}</span>
                {tx.timestamp && <span className="text-xs text-muted-foreground">({timeAgo(tx.timestamp)})</span>}
              </div>
            </DetailRow>
            <DetailRow label="From">
              <Link href={`/address/${tx.from}`}>
                <span className="text-sm font-mono text-primary hover:underline cursor-pointer break-all">{tx.from}</span>
              </Link>
            </DetailRow>
            <DetailRow label="To">
              <Link href={`/address/${tx.to}`}>
                <span className="text-sm font-mono text-primary hover:underline cursor-pointer break-all">{tx.to}</span>
              </Link>
            </DetailRow>
            <DetailRow label="Amount" value={formatZTH(parseFloat(tx.amount ?? "0"))} />
            <DetailRow label="Gas Fee" value={`${parseFloat(tx.gasFee ?? "0").toFixed(6)} ZTH`} />
            <DetailRow label="Nonce" value={String(tx.nonce ?? "—")} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
