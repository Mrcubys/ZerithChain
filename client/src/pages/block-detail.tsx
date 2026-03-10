import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Block, Transaction } from "@shared/schema";
import { TxRow } from "@/components/tx-row";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { formatTimestamp, formatBytes, shortHash, formatZTH } from "@/lib/chain-utils";
import { Layers, ArrowLeft, ChevronLeft, ChevronRight, Copy, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function BlockDetail() {
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
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6">
        <div className="text-center py-16">
          <Layers className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h2 className="text-xl font-display font-bold">Block Not Found</h2>
          <p className="text-muted-foreground mt-2">No block found for: {identifier}</p>
          <Button variant="outline" asChild className="mt-4">
            <Link href="/explorer"><ArrowLeft className="w-4 h-4 mr-1.5" />Back to Explorer</Link>
          </Button>
        </div>
      </div>
    );
  }

  const { block, transactions } = data;

  return (
    <div className="flex flex-col h-full overflow-auto">
      <div className="border-b border-border/50 px-6 py-5">
        <div className="flex items-center gap-3 flex-wrap">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/explorer"><ArrowLeft className="w-4 h-4 mr-1" />Explorer</Link>
          </Button>
          <Separator orientation="vertical" className="h-4" />
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" />
            <h1 className="font-display text-xl font-bold">Block #{block.height.toLocaleString()}</h1>
          </div>
          <Badge variant="secondary" className="ml-auto">Finalized</Badge>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/explorer/block/${block.height - 1}`} data-testid="button-prev-block">
                <ChevronLeft className="w-4 h-4" />
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/explorer/block/${block.height + 1}`} data-testid="button-next-block">
                <ChevronRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6 flex-1 overflow-auto">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-display">Block Details</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-0">
              {[
                { label: "Block Height", value: block.height.toLocaleString(), mono: false },
                { label: "Timestamp", value: formatTimestamp(block.timestamp), mono: false },
                { label: "Block Hash", value: block.hash, mono: true, copy: true },
                { label: "Parent Hash", value: block.previousHash, mono: true, copy: true },
                { label: "State Root", value: block.stateRoot, mono: true, copy: true },
                { label: "Validator", value: block.validator, mono: true, copy: true, link: `/explorer/address/${block.validator}`, linkLabel: block.validatorName },
                { label: "Transactions", value: `${block.transactionCount} transactions` },
                { label: "Gas Used", value: parseInt(block.gasUsed).toLocaleString() },
                { label: "Gas Limit", value: parseInt(block.gasLimit).toLocaleString() },
                { label: "Block Size", value: formatBytes(block.size) },
                { label: "Block Reward", value: formatZTH(block.reward) },
              ].map((row, i) => (
                <div key={i} className="flex items-start gap-4 py-3 border-b border-border/40 last:border-0">
                  <span className="text-sm text-muted-foreground w-32 flex-shrink-0 pt-0.5">{row.label}</span>
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {row.link ? (
                      <Link href={row.link} className="text-sm text-primary font-medium">{row.linkLabel}</Link>
                    ) : (
                      <span className={`text-sm break-all ${row.mono ? "font-mono text-foreground/80" : "font-medium"}`}>
                        {row.value}
                      </span>
                    )}
                    {row.mono && row.copy && (
                      <button
                        data-testid={`copy-${row.label.toLowerCase().replace(/\s+/g, "-")}`}
                        onClick={() => copy(row.value as string, row.label)}
                        className="flex-shrink-0 p-1 rounded text-muted-foreground"
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

        {transactions.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-display">
                Transactions ({transactions.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {transactions.map(tx => <TxRow key={tx.hash} tx={tx} />)}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
