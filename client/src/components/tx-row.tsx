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
    <div className="flex items-center gap-3 py-3 border-b border-border/50 last:border-0" data-testid={`tx-row-${tx.hash.slice(2, 10)}`}>
      <div className="flex-shrink-0">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium border capitalize ${txTypeBadgeClass(tx.type)}`}>
          {tx.type}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <Link href={`/explorer/tx/${tx.hash}`} className="font-mono text-sm text-foreground/80 hover:text-foreground truncate block" data-testid={`link-tx-${tx.hash.slice(2, 10)}`}>
          {shortHash(tx.hash)}
        </Link>
        <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground">
          <Link href={`/explorer/address/${tx.from}`} className="font-mono truncate max-w-[90px] hover:text-foreground transition-colors">
            {shortAddress(tx.from)}
          </Link>
          <ArrowRight className="w-3 h-3 flex-shrink-0" />
          <Link href={`/explorer/address/${tx.to}`} className="font-mono truncate max-w-[90px] hover:text-foreground transition-colors">
            {shortAddress(tx.to)}
          </Link>
        </div>
      </div>
      {!compact && (
        <div className="text-right flex-shrink-0 hidden sm:block">
          <div className="font-mono text-sm font-medium">{formatZTH(tx.amount, 2)}</div>
          <div className="text-xs text-muted-foreground">{timeAgo(tx.timestamp)}</div>
        </div>
      )}
      <div className="flex-shrink-0">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium border ${statusBadgeClass(tx.status)}`}>
          {tx.status}
        </span>
      </div>
    </div>
  );
}
