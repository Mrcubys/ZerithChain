import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { Blocks, ChevronLeft, ChevronRight, ArrowLeftRight, Clock, Copy, CheckCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { shortHash, timeAgo, formatNumber, formatZTH } from "@/lib/chain-utils";
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

export default function ScanBlock() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const { data, isLoading, error } = useQuery<any>({
    queryKey: [`/api/blocks/${id}`],
    staleTime: Infinity,
    retry: 2,
    retryDelay: 1000,
  });

  const block = data?.block ?? null;
  const txs: any[] = Array.isArray(data?.transactions) ? data.transactions : [];
  const prevHeight = block ? block.height - 1 : null;
  const nextHeight = block ? block.height + 1 : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/blocks">
          <span className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
            <ChevronLeft className="w-4 h-4" />
            Blocks
          </span>
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm font-semibold text-foreground">Block #{isLoading ? "…" : formatNumber(block?.height ?? parseInt(id))}</span>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Blocks className="w-6 h-6 text-primary" />
          Block Details
        </h1>
        {!isLoading && block && (
          <div className="flex items-center gap-2">
            {prevHeight != null && prevHeight >= 0 && (
              <Link href={`/block/${prevHeight}`}>
                <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors" data-testid="button-prev-block">
                  <ChevronLeft className="w-4 h-4" /> Prev
                </button>
              </Link>
            )}
            <Link href={`/block/${nextHeight}`}>
              <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors" data-testid="button-next-block">
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        )}
      </div>

      {isLoading ? (
        <Card><CardContent className="p-6 space-y-4">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</CardContent></Card>
      ) : error || !block ? (
        <Card><CardContent className="p-12 text-center">
          <Blocks className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Block not found or API unavailable</p>
        </CardContent></Card>
      ) : (
        <>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Overview</CardTitle></CardHeader>
            <CardContent className="px-6 pb-6">
              <DetailRow label="Block Height" value={formatNumber(block.height)} />
              <DetailRow label="Block Hash" mono>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-foreground break-all">{block.hash}</span>
                  {block.hash && <CopyButton text={block.hash} />}
                </div>
              </DetailRow>
              <DetailRow label="Previous Hash" mono>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-muted-foreground break-all">{shortHash(block.previousHash ?? "", 16)}</span>
                  {block.previousHash && prevHeight != null && prevHeight >= 0 && (
                    <Link href={`/block/${prevHeight}`}>
                      <span className="text-xs text-primary hover:underline cursor-pointer ml-1">prev block</span>
                    </Link>
                  )}
                </div>
              </DetailRow>
              <DetailRow label="Timestamp">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-sm text-foreground">{new Date(block.timestamp).toLocaleString()}</span>
                  <span className="text-xs text-muted-foreground">({timeAgo(block.timestamp)})</span>
                </div>
              </DetailRow>
              <DetailRow label="Transactions">
                <Badge variant="info" className="text-xs">{formatNumber(block.transactionCount)} transactions</Badge>
              </DetailRow>
              <DetailRow label="Validator">
                <div>
                  <Link href={`/address/${block.validator}`}>
                    <span className="text-sm font-mono text-primary hover:underline cursor-pointer">{block.validator}</span>
                  </Link>
                  {block.validatorName && <span className="ml-2 text-xs text-muted-foreground">({block.validatorName})</span>}
                </div>
              </DetailRow>
              <DetailRow label="Block Reward" value={`${block.reward ?? "2"} ZTH`} />
              <DetailRow label="Gas Used / Limit">
                <span className="text-sm text-foreground">
                  {formatNumber(parseInt(block.gasUsed ?? "0"))} / {formatNumber(parseInt(block.gasLimit ?? "0"))}
                  {block.gasUsed && block.gasLimit && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      ({Math.round((parseInt(block.gasUsed) / parseInt(block.gasLimit)) * 100)}%)
                    </span>
                  )}
                </span>
              </DetailRow>
              <DetailRow label="Block Size" value={block.size ? `${(block.size / 1024).toFixed(2)} KB` : "—"} />
              <DetailRow label="State Root" mono value={block.stateRoot ? shortHash(block.stateRoot, 16) : "—"} />
            </CardContent>
          </Card>

          {txs.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <ArrowLeftRight className="w-4 h-4 text-primary" />
                  Transactions ({txs.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-4">
                <div className="divide-y divide-border/40">
                  {txs.map((tx: any, i: number) => {
                    const hash = tx.hash ?? "";
                    const type = tx.type ?? "transfer";
                    const status = tx.status ?? "pending";
                    const amount = tx.amount ?? "0";
                    return (
                      <div key={hash || i} className="grid grid-cols-[1fr_auto_auto_auto] gap-3 items-center py-3 hover:bg-secondary/30 rounded-lg px-3 -mx-3 transition-colors">
                        <Link href={`/tx/${hash}`}>
                          <span className="text-sm font-mono text-primary hover:underline cursor-pointer truncate block">{shortHash(hash, 12)}</span>
                        </Link>
                        <Badge variant="outline" className="text-xs capitalize">{type}</Badge>
                        <Badge variant={status === "success" ? "success" : "destructive"} className="text-xs">{status}</Badge>
                        <span className="text-sm text-foreground text-right">{formatZTH(parseFloat(amount))}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
