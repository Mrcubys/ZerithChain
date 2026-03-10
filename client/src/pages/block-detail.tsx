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
import { Layers, ArrowLeft, ChevronLeft, ChevronRight, Copy } from "lucide-react";
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
    return <div className="p-6 space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64 w-full" /></div>;
  }

  if (error || !data) {
    return (
      <div className="p-6 text-center py-16">
        <Layers className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
        <h2 className="text-lg font-semibold">Block Not Found</h2>
        <p className="text-muted-foreground text-sm mt-1">No block found for: {identifier}</p>
        <Button variant="outline" size="sm" asChild className="mt-4">
          <Link href="/explorer"><ArrowLeft className="w-4 h-4 mr-1.5" />Back to Explorer</Link>
        </Button>
      </div>
    );
  }

  const { block, transactions } = data;

  return (
    <div className="flex flex-col min-h-full">
      <div className="border-b border-border px-6 py-4">
        <div className="flex items-center gap-3 flex-wrap">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/explorer"><ArrowLeft className="w-4 h-4 mr-1" />Explorer</Link>
          </Button>
          <Separator orientation="vertical" className="h-4" />
          <Layers className="w-4 h-4 text-muted-foreground" />
          <h1 className="font-semibold">Block #{block.height.toLocaleString()}</h1>
          <Badge variant="secondary" className="text-xs">Finalized</Badge>
          <div className="flex items-center gap-1 ml-auto">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/explorer/block/${block.height - 1}`} data-testid="button-prev-block"><ChevronLeft className="w-4 h-4" /></Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/explorer/block/${block.height + 1}`} data-testid="button-next-block"><ChevronRight className="w-4 h-4" /></Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-5">
        <Card>
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
              { label: "Validator", value: block.validatorName, link: `/explorer/address/${block.validator}` },
              { label: "Transactions", value: `${block.transactionCount}` },
              { label: "Gas Used", value: `${parseInt(block.gasUsed).toLocaleString()} / ${parseInt(block.gasLimit).toLocaleString()}` },
              { label: "Block Size", value: formatBytes(block.size) },
              { label: "Reward", value: formatZTH(block.reward) },
            ].map((row, i) => (
              <div key={i} className="flex items-start gap-4 py-2.5 border-b border-border/40 last:border-0">
                <span className="text-xs text-muted-foreground w-28 flex-shrink-0 pt-0.5">{row.label}</span>
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {row.link ? (
                    <Link href={row.link} className="text-sm font-medium hover:text-foreground/80">{row.value}</Link>
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
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Transactions ({transactions.length})</CardTitle>
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
