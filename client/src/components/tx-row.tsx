import { Link } from "wouter";
import type { Transaction } from "@shared/schema";
import { shortHash, shortAddress, formatZTH, timeAgo, txTypeBadgeClass, statusBadgeClass } from "@/lib/chain-utils";
import { ArrowRight } from "lucide-react";

interface TxRowProps {
  tx: Transaction;
  compact?: boolean;
}

export function TxRow({ tx, compact }: TxRowProps) {
  return (
    <div className={`flex items-center gap-3 py-2.5 border-b border-border/40 last:border-0 hover-elevate transition-colors group ${compact ? "text-xs" : "text-sm"}`} data-testid={`tx-row-${tx.hash.slice(2, 10)}`}>
      <div className="flex-shrink-0">
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border capitalize ${txTypeBadgeClass(tx.type)}`}>
          {tx.type}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <Link href={`/explorer/tx/${tx.hash}`} className="font-mono text-primary truncate" data-testid={`link-tx-${tx.hash.slice(2, 10)}`}>
            {shortHash(tx.hash)}
          </Link>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5 text-muted-foreground">
          <Link href={`/explorer/address/${tx.from}`} className="font-mono truncate max-w-[100px]">
            {shortAddress(tx.from)}
          </Link>
          <ArrowRight className="w-3 h-3 flex-shrink-0" />
          <Link href={`/explorer/address/${tx.to}`} className="font-mono truncate max-w-[100px]">
            {shortAddress(tx.to)}
          </Link>
        </div>
      </div>
      {!compact && (
        <div className="text-right flex-shrink-0">
          <div className="font-mono font-semibold text-foreground">{formatZTH(tx.amount, 2)}</div>
          <div className="text-xs text-muted-foreground">{timeAgo(tx.timestamp)}</div>
        </div>
      )}
      <div className="flex-shrink-0">
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${statusBadgeClass(tx.status)}`}>
          {tx.status}
        </span>
      </div>
    </div>
  );
}
