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
    refetchInterval: 3000,
  });

  const items = [
    {
      icon: <Zap className="w-3.5 h-3.5 text-neon-blue" />,
      label: "TPS",
      value: status?.tps?.toLocaleString() ?? "—",
      color: "text-neon-blue",
    },
    {
      icon: <Shield className="w-3.5 h-3.5 text-neon-purple" />,
      label: "Validators",
      value: status ? `${status.activeValidators}/${status.totalValidators}` : "—",
      color: "text-neon-purple",
    },
    {
      icon: <Coins className="w-3.5 h-3.5 text-neon-cyan" />,
      label: "Total Supply",
      value: status ? `${formatCompact(status.totalSupply)} ZTH` : "—",
      color: "text-neon-cyan",
    },
    {
      icon: <Clock className="w-3.5 h-3.5 text-green-400" />,
      label: "Block Time",
      value: status ? `${status.averageBlockTime.toFixed(1)}s` : "—",
      color: "text-green-400",
    },
  ];

  return (
    <footer className="border-t border-border/50 bg-background/80 backdrop-blur-sm px-6 py-2">
      <div className="flex items-center gap-6 flex-wrap">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-1.5">
            {item.icon}
            <span className="text-xs text-muted-foreground">{item.label}:</span>
            <span className={`text-xs font-mono font-semibold ${item.color}`} data-testid={`footer-${item.label.toLowerCase().replace(/\s+/g, "-")}`}>
              {item.value}
            </span>
          </div>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-muted-foreground capitalize">{network}</span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs text-muted-foreground font-mono">
            #{status?.blockHeight?.toLocaleString() ?? "..."}
          </span>
        </div>
      </div>
    </footer>
  );
}
