import { useQuery } from "@tanstack/react-query";
import type { NetworkStatus } from "@shared/schema";
import { formatCompact } from "@/lib/chain-utils";
import { Zap, Shield, Coins, Clock } from "lucide-react";

interface NetworkFooterProps {
  network: string;
}

export function NetworkFooter({ network }: NetworkFooterProps) {
  const { data: status } = useQuery<NetworkStatus>({
    queryKey: ["/api/network/status", network],
    queryFn: async () => {
      const res = await fetch(`/api/network/status?network=${network}`);
      return res.json();
    },
    refetchInterval: 5000,
  });

  return (
    <footer className="border-t border-border bg-background px-6 py-2.5 flex-shrink-0">
      <div className="flex items-center gap-6 flex-wrap">
        <div className="flex items-center gap-1.5">
          <Zap className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">TPS</span>
          <span className="text-xs font-mono font-medium text-foreground" data-testid="footer-tps">
            {status?.tps?.toLocaleString() ?? "—"}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Shield className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Validators</span>
          <span className="text-xs font-mono font-medium text-foreground" data-testid="footer-validators">
            {status ? `${status.activeValidators}/${status.totalValidators}` : "—"}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Coins className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Supply</span>
          <span className="text-xs font-mono font-medium text-foreground" data-testid="footer-supply">
            {status ? `${formatCompact(status.totalSupply)} ZTH` : "—"}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Block</span>
          <span className="text-xs font-mono font-medium text-foreground">
            {status ? `${status.averageBlockTime.toFixed(1)}s` : "—"}
          </span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
          <span className="text-xs text-muted-foreground capitalize">{network}</span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs font-mono text-muted-foreground">
            #{status?.blockHeight?.toLocaleString() ?? "..."}
          </span>
        </div>
      </div>
    </footer>
  );
}
