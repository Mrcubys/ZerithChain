import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import type { Block } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { timeAgo, shortHash, formatBytes } from "@/lib/chain-utils";
import { Layers } from "lucide-react";

export default function ScanBlocks() {
  const { data: blocks, isLoading } = useQuery<Block[]>({
    queryKey: ["/api/blocks", "scan-all"],
    queryFn: async () => {
      const res = await fetch("/api/blocks?limit=50");
      return res.json();
    },
    refetchInterval: 5000,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Layers className="w-5 h-5 text-primary" />
          Blocks
        </h2>
        <span className="text-xs text-muted-foreground">Auto-refreshing every 5s</span>
      </div>

      <Card className="rounded-2xl border-border/60 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left text-xs text-muted-foreground font-medium py-3 px-4 uppercase tracking-wider">Block</th>
                <th className="text-left text-xs text-muted-foreground font-medium py-3 pr-4 uppercase tracking-wider hidden md:table-cell">Hash</th>
                <th className="text-left text-xs text-muted-foreground font-medium py-3 pr-4 uppercase tracking-wider hidden sm:table-cell">Validator</th>
                <th className="text-right text-xs text-muted-foreground font-medium py-3 pr-4 uppercase tracking-wider">Txns</th>
                <th className="text-right text-xs text-muted-foreground font-medium py-3 pr-4 uppercase tracking-wider hidden lg:table-cell">Size</th>
                <th className="text-right text-xs text-muted-foreground font-medium py-3 pr-4 uppercase tracking-wider">Age</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 15 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/40">
                    <td className="py-3 px-4"><Skeleton className="h-4 w-20" /></td>
                    <td className="py-3 pr-4 hidden md:table-cell"><Skeleton className="h-4 w-32" /></td>
                    <td className="py-3 pr-4 hidden sm:table-cell"><Skeleton className="h-4 w-28" /></td>
                    <td className="py-3 pr-4"><Skeleton className="h-4 w-8 ml-auto" /></td>
                    <td className="py-3 pr-4 hidden lg:table-cell"><Skeleton className="h-4 w-12 ml-auto" /></td>
                    <td className="py-3 pr-4"><Skeleton className="h-4 w-14 ml-auto" /></td>
                  </tr>
                ))
                : blocks?.map((block) => (
                  <tr key={block.height} className="border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors" data-testid={`scan-block-${block.height}`}>
                    <td className="py-3 px-4">
                      <Link href={`/scan/block/${block.height}`} className="font-mono font-semibold text-primary hover:underline" data-testid={`link-block-${block.height}`}>
                        #{block.height.toLocaleString()}
                      </Link>
                    </td>
                    <td className="py-3 pr-4 hidden md:table-cell">
                      <span className="font-mono text-xs text-muted-foreground">{shortHash(block.hash, 8)}</span>
                    </td>
                    <td className="py-3 pr-4 hidden sm:table-cell">
                      <Link href={`/scan/address/${block.validator}`} className="text-sm hover:text-primary transition-colors truncate max-w-[140px] block">{block.validatorName}</Link>
                    </td>
                    <td className="py-3 pr-4 text-right">
                      <span className="font-mono text-sm">{block.transactionCount}</span>
                    </td>
                    <td className="py-3 pr-4 text-right hidden lg:table-cell">
                      <span className="font-mono text-xs text-muted-foreground">{formatBytes(block.size)}</span>
                    </td>
                    <td className="py-3 pr-4 text-right">
                      <span className="text-xs text-muted-foreground">{timeAgo(block.timestamp)}</span>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
