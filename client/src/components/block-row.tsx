import { Link } from "wouter";
import type { Block } from "@shared/schema";
import { shortHash, timeAgo, formatBytes } from "@/lib/chain-utils";
import { Layers, User, Hash } from "lucide-react";

interface BlockRowProps {
  block: Block;
}

export function BlockRow({ block }: BlockRowProps) {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-border/40 last:border-0 hover-elevate transition-colors" data-testid={`block-row-${block.height}`}>
      <div className="flex-shrink-0 w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
        <Layers className="w-4 h-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Link href={`/explorer/block/${block.height}`} className="font-display font-bold text-primary" data-testid={`link-block-${block.height}`}>
            #{block.height.toLocaleString()}
          </Link>
          <span className="text-xs text-muted-foreground">·</span>
          <Link href={`/explorer/address/${block.validator}`} className="text-xs font-mono text-muted-foreground truncate max-w-[120px]">
            {block.validatorName}
          </Link>
        </div>
        <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Hash className="w-3 h-3" />
            {shortHash(block.hash, 6)}
          </span>
          <span>{block.transactionCount} txns</span>
          <span>{formatBytes(block.size)}</span>
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <div className="text-xs text-muted-foreground">{timeAgo(block.timestamp)}</div>
        <div className="text-xs font-mono text-neon-green mt-0.5">+2 ZTH</div>
      </div>
    </div>
  );
}
