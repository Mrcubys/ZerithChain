import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Blocks, Clock } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { shortHash, timeAgo, formatNumber } from "@/lib/chain-utils";

function BlockRow({ block }: { block: any }) {
  const height = block.height ?? 0;
  const hash = block.hash ?? "";
  const validatorName = block.validatorName ?? shortHash(block.validator ?? "", 6);
  const txCount = block.transactionCount ?? block.txCount ?? 0;
  const ts = block.timestamp;
  const gasUsed = block.gasUsed ? parseInt(block.gasUsed) : null;
  const gasLimit = block.gasLimit ? parseInt(block.gasLimit) : null;
  const gasPercent = gasUsed && gasLimit ? Math.round((gasUsed / gasLimit) * 100) : null;
  const size = block.size ?? null;

  return (
    <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 items-center py-3.5 hover:bg-secondary/30 rounded-lg px-4 -mx-4 transition-colors group">
      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <Blocks className="w-4 h-4 text-primary" />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <Link href={`/block/${height}`}>
            <span className="text-sm font-bold text-primary hover:underline cursor-pointer" data-testid={`link-block-${height}`}>
              #{formatNumber(height)}
            </span>
          </Link>
        </div>
        <p className="text-xs text-muted-foreground font-mono truncate">{shortHash(hash, 12)}</p>
      </div>
      <div className="text-right hidden md:block">
        <p className="text-xs text-muted-foreground">Validator</p>
        <p className="text-xs text-foreground font-medium">{validatorName}</p>
      </div>
      <div className="text-right hidden sm:block">
        <p className="text-xs text-muted-foreground">Gas Used</p>
        <p className="text-xs text-foreground">{gasPercent != null ? `${gasPercent}%` : "—"}</p>
        {size != null && <p className="text-xs text-muted-foreground">{(size / 1024).toFixed(1)} KB</p>}
      </div>
      <div className="text-right">
        <p className="text-xs font-semibold text-foreground">{formatNumber(txCount)} txs</p>
        <p className="text-xs text-muted-foreground flex items-center justify-end gap-1">
          <Clock className="w-3 h-3" />
          {ts ? timeAgo(ts) : "—"}
        </p>
      </div>
    </div>
  );
}

export default function ScanBlocks() {
  const { data, isLoading, error } = useQuery<any>({
    queryKey: ["/api/blocks?limit=50"],
    refetchInterval: 12_000,
  });

  const blocks: any[] = Array.isArray(data) ? data : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Blocks className="w-6 h-6 text-primary" />
            Blocks
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Latest blocks on Zerith Chain</p>
        </div>
        {!isLoading && blocks.length > 0 && (
          <Badge variant="outline" className="text-xs">{blocks.length} blocks</Badge>
        )}
      </div>

      <Card>
        <CardHeader className="pb-0 pt-5 px-4">
          <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 items-center pb-3 border-b border-border">
            <div className="w-9" />
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Block / Hash</p>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:block text-right">Validator</p>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:block text-right">Gas</p>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Txs / Age</p>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          {isLoading ? (
            <div className="space-y-2 pt-2">
              {Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-destructive text-sm">Failed to load blocks.</p>
              <p className="text-muted-foreground text-xs mt-1">Check your API connection.</p>
            </div>
          ) : blocks.length === 0 ? (
            <div className="text-center py-12">
              <Blocks className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No blocks found</p>
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {blocks.map((block) => <BlockRow key={block.height} block={block} />)}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
