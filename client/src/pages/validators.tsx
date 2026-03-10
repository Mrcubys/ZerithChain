import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import type { Validator } from "@shared/schema";
import { BrowserSubNav } from "@/components/wallet-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { regionColor } from "@/lib/chain-utils";
import { Shield, Activity, Globe } from "lucide-react";

function statusBadge(status: string) {
  if (status === "active") return "bg-green-500/10 text-green-400 border-green-500/20";
  if (status === "inactive") return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
  return "bg-red-500/10 text-red-400 border-red-500/20";
}

export default function Validators() {
  const { data: validators, isLoading } = useQuery<Validator[]>({
    queryKey: ["/api/validators"],
    refetchInterval: 10000,
  });

  const active = validators?.filter(v => v.status === "active").length ?? 0;
  const inactive = validators?.filter(v => v.status === "inactive").length ?? 0;
  const jailed = validators?.filter(v => v.status === "jailed").length ?? 0;

  return (
    <div className="flex flex-col min-h-full">
      <div className="bg-background border-b border-border px-5 pt-10 pb-0 sticky top-0 z-10">
        <h1 className="text-xl font-semibold mb-4">Browser</h1>
        <BrowserSubNav />
      </div>
      <div className="border-b border-border px-5 py-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-sm font-semibold">Validators</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Global Zerith Chain validator network</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
              {active} active
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
              {inactive} inactive
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
              {jailed} jailed
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Validators", value: validators?.length ?? "—" },
            { label: "Active", value: active, color: "text-green-400" },
            { label: "Min Stake", value: "50,000 ZTH" },
            { label: "Block Time", value: "~2.0s" },
          ].map((stat, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</div>
                <div className={`text-xl font-semibold font-mono mt-1 ${stat.color ?? "text-foreground"}`}>{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="w-4 h-4 text-muted-foreground" />
              Validator Set
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs text-muted-foreground font-medium py-2.5 pr-4 uppercase tracking-wider">Rank</th>
                    <th className="text-left text-xs text-muted-foreground font-medium py-2.5 pr-4 uppercase tracking-wider">Validator</th>
                    <th className="text-left text-xs text-muted-foreground font-medium py-2.5 pr-4 uppercase tracking-wider hidden md:table-cell">Region</th>
                    <th className="text-right text-xs text-muted-foreground font-medium py-2.5 pr-4 uppercase tracking-wider hidden sm:table-cell">Stake</th>
                    <th className="text-right text-xs text-muted-foreground font-medium py-2.5 pr-4 uppercase tracking-wider hidden lg:table-cell">Uptime</th>
                    <th className="text-right text-xs text-muted-foreground font-medium py-2.5 pr-4 uppercase tracking-wider hidden lg:table-cell">Latency</th>
                    <th className="text-right text-xs text-muted-foreground font-medium py-2.5 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading
                    ? Array.from({ length: 10 }).map((_, i) => (
                      <tr key={i} className="border-b border-border/40">
                        <td colSpan={7} className="py-3"><Skeleton className="h-5 w-full" /></td>
                      </tr>
                    ))
                    : validators?.map((v) => (
                      <tr key={v.address} className="border-b border-border/40 last:border-0 hover:bg-accent/30 transition-colors" data-testid={`validator-row-${v.rank}`}>
                        <td className="py-3 pr-4">
                          <span className="font-mono text-xs text-muted-foreground">#{v.rank}</span>
                        </td>
                        <td className="py-3 pr-4">
                          <Link href={`/explorer/address/${v.address}`} className="font-medium hover:text-foreground/80">
                            {v.name}
                          </Link>
                          <div className="font-mono text-xs text-muted-foreground truncate max-w-[160px]">{v.address.slice(0, 20)}...</div>
                        </td>
                        <td className="py-3 pr-4 hidden md:table-cell">
                          <div className="flex items-center gap-1.5">
                            <Globe className={`w-3 h-3 ${regionColor(v.region)}`} />
                            <span className={`text-xs ${regionColor(v.region)}`}>{v.region}</span>
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-right hidden sm:table-cell">
                          <div className="font-mono text-xs">{parseFloat(v.stake).toLocaleString()}</div>
                          <div className="font-mono text-xs text-muted-foreground">+{parseFloat(v.delegatedStake).toLocaleString()}</div>
                        </td>
                        <td className="py-3 pr-4 text-right hidden lg:table-cell">
                          <span className={`font-mono text-xs ${parseFloat(v.uptime.toString()) >= 99 ? "text-green-400" : "text-yellow-400"}`}>
                            {v.uptime}%
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-right hidden lg:table-cell">
                          <span className={`font-mono text-xs ${v.latency < 50 ? "text-green-400" : v.latency < 100 ? "text-yellow-400" : "text-red-400"}`}>
                            {v.latency}ms
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium border capitalize ${statusBadge(v.status)}`}>
                            {v.status === "active" && <Activity className="w-2.5 h-2.5 mr-1" />}
                            {v.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
