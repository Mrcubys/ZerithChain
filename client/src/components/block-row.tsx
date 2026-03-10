import { Link } from "wouter";
import type { Block } from "@shared/schema";
import { shortHash, timeAgo, formatBytes } from "@/lib/chain-utils";
import { Layers } from "lucide-react";

interface BlockRowProps {
  block: Block;
}

export function BlockRow({ block }: BlockRowProps) {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-border/50 last:border-0" data-testid={`block-row-${block.height}`}>
      <div className="flex-shrink-0 w-9 h-9 rounded-sm bg-secondary flex items-center justify-center">
        <Layers className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Link href={`/explorer/block/${block.height}`} className="font-mono font-semibold text-foreground hover:text-foreground/80" data-testid={`link-block-${block.height}`}>
            #{block.height.toLocaleString()}
          </Link>
          <span className="text-xs text-muted-foreground truncate hidden sm:block">
            {block.validatorName}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
          <span className="font-mono">{shortHash(block.hash, 6)}</span>
          <span>{block.transactionCount} txns</span>
          <span className="hidden sm:inline">{formatBytes(block.size)}</span>
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <div className="text-xs text-muted-foreground">{timeAgo(block.timestamp)}</div>
        <div className="text-xs font-mono text-green-400 mt-0.5">+2 ZTH</div>
      </div>
    </div>
  );
}
