import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Block, Transaction } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { formatTimestamp, formatBytes, shortHash, formatZTH, shortAddress, timeAgo, txTypeBadgeClass, statusBadgeClass } from "@/lib/chain-utils";
import { Layers, ArrowLeft, ChevronLeft, ChevronRight, Copy, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ScanBlock() {
  const { identifier } = useParams<{ identifier: string }>();
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery<{ block: Block; transactions: Transaction[] }>({
    queryKey: ["/api/blocks", identifier],
    queryFn: async () => {
      const res = await fetch(`/api/blocks/${identifier}`);
      if (!res.ok) throw new Error("Block not found");
      return res.json();
    },
  });

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: `${label} copied to clipboard.` });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-20">
        <Layers className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
        <h2 className="text-lg font-semibold">Block Not Found</h2>
        <p className="text-muted-foreground text-sm mt-1">No block found for: {identifier}</p>
        <Button variant="outline" size="sm" asChild className="mt-4">
          <Link href="/scan/blocks"><ArrowLeft className="w-4 h-4 mr-1.5" />Back to Blocks</Link>
        </Button>
      </div>
    );
  }

  const { block, transactions } = data;

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center gap-3 flex-wrap">
        <Button variant="ghost" size="sm" asChild className="h-8 px-2">
          <Link href="/scan/blocks"><ArrowLeft className="w-4 h-4 mr-1" />Blocks</Link>
        </Button>
        <Separator orientation="vertical" className="h-4" />
        <Layers className="w-4 h-4 text-muted-foreground" />
        <h1 className="font-semibold">Block #{block.height.toLocaleString()}</h1>
        <Badge variant="secondary" className="text-xs">Finalized</Badge>
        <div className="flex items-center gap-1 ml-auto">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/scan/block/${block.height - 1}`} data-testid="button-prev-block">
              <ChevronLeft className="w-4 h-4" />
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/scan/block/${block.height + 1}`} data-testid="button-next-block">
              <ChevronRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>

      <Card className="rounded-2xl border-border/60 bg-white shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Block Details</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {[
            { label: "Height", value: block.height.toLocaleString() },
            { label: "Timestamp", value: formatTimestamp(block.timestamp) },
            { label: "Block Hash", value: block.hash, mono: true, copy: true },
            { label: "Parent Hash", value: block.previousHash, mono: true, copy: true },
            { label: "State Root", value: block.stateRoot, mono: true, copy: true },
            { label: "Validator", value: block.validatorName, link: `/scan/address/${block.validator}` },
            { label: "Transactions", value: `${block.transactionCount}` },
            { label: "Gas Used", value: `${parseInt(block.gasUsed).toLocaleString()} / ${parseInt(block.gasLimit).toLocaleString()}` },
            { label: "Block Size", value: formatBytes(block.size) },
            { label: "Reward", value: formatZTH(block.reward) },
          ].map((row, i) => (
            <div key={i} className="flex items-start gap-4 py-2.5 border-b border-border/40 last:border-0">
              <span className="text-xs text-muted-foreground w-28 flex-shrink-0 pt-0.5">{row.label}</span>
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {row.link ? (
                  <Link href={row.link} className="text-sm font-medium text-primary hover:underline">{row.value}</Link>
                ) : (
                  <span className={`text-sm break-all ${row.mono ? "font-mono text-muted-foreground" : "font-medium"}`}>{row.value}</span>
                )}
                {row.copy && (
                  <button onClick={() => copy(row.value as string, row.label)} className="flex-shrink-0 p-0.5 text-muted-foreground hover:text-foreground" data-testid={`copy-${row.label.toLowerCase().replace(/\s+/g, "-")}`}>
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {transactions.length > 0 && (
        <Card className="rounded-2xl border-border/60 bg-white shadow-sm overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Transactions ({transactions.length})</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 p-0">
            {transactions.map(tx => (
              <div key={tx.hash} className="flex items-center gap-3 px-4 py-3 border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors">
                <div className="flex-shrink-0">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium border capitalize ${txTypeBadgeClass(tx.type)}`}>
                    {tx.type}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/scan/tx/${tx.hash}`} className="font-mono text-xs text-primary hover:underline truncate block">
                    {shortHash(tx.hash)}
                  </Link>
                  <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground">
                    <Link href={`/scan/address/${tx.from}`} className="font-mono truncate max-w-[80px] hover:text-foreground transition-colors">{shortAddress(tx.from)}</Link>
                    <ArrowRight className="w-2.5 h-2.5 flex-shrink-0" />
                    <Link href={`/scan/address/${tx.to}`} className="font-mono truncate max-w-[80px] hover:text-foreground transition-colors">{shortAddress(tx.to)}</Link>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-mono text-xs font-medium">{formatZTH(tx.amount, 2)}</div>
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded-sm text-[10px] font-medium border capitalize ${statusBadgeClass(tx.status)}`}>{tx.status}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
