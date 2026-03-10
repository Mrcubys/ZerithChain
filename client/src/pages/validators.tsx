import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import type { Validator } from "@shared/schema";
import { BrowserSubNav } from "@/components/wallet-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { regionColor } from "@/lib/chain-utils";
import { Shield, Activity, Globe, Server, Zap, Lock, ExternalLink } from "lucide-react";

export default function Validators() {
  const { data: validators, isLoading } = useQuery<Validator[]>({
    queryKey: ["/api/validators"],
    refetchInterval: 15000,
  });

  const isEmpty = !isLoading && (!validators || validators.length === 0);

  return (
    <div className="flex flex-col min-h-full bg-background">
      <BrowserSubNav />

      <div className="px-4 py-5 space-y-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Registered", value: validators?.length ?? 0, icon: Shield },
            { label: "Active", value: validators?.filter(v => v.status === "active").length ?? 0, color: "text-green-600", icon: Activity },
            { label: "Min Stake", value: "50K ZTH", icon: Zap },
            { label: "Max Slots", value: "100", icon: Server },
          ].map((stat, i) => (
            <Card key={i} className="rounded-2xl border-card-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-1.5 mb-1">
                  <stat.icon className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</span>
                </div>
                <div className={`text-xl font-semibold font-mono ${stat.color ?? "text-foreground"}`}>{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="rounded-2xl border-card-border">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 rounded-xl" />
                ))}
              </div>
            ) : isEmpty ? (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center gap-5">
                <div className="w-20 h-20 rounded-full bg-primary/8 flex items-center justify-center" style={{ background: "hsl(200 80% 95%)" }}>
                  <Shield className="w-10 h-10 text-primary/40" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-base font-semibold text-foreground">No validators registered yet</h3>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    Zerith Chain's validator set is open. Be the first to join and help secure the network.
                  </p>
                </div>
                <div className="bg-muted/50 rounded-2xl p-4 w-full max-w-sm space-y-2 text-left">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Requirements</p>
                  <div className="space-y-1.5">
                    {[
                      { icon: Lock, text: "Minimum stake: 50,000 ZTH" },
                      { icon: Server, text: "Dedicated server with 8 vCPU / 16 GB RAM" },
                      { icon: Zap, text: "99%+ uptime guaranteed" },
                      { icon: Globe, text: "Public static IP or domain" },
                    ].map((req, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <req.icon className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                        <span>{req.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 w-full max-w-sm">
                  <Button className="flex-1 rounded-xl" data-testid="button-register-validator">
                    <Shield className="w-4 h-4 mr-2" />
                    Register as Validator
                  </Button>
                  <Button variant="outline" className="rounded-xl border-border" asChild>
                    <Link href="/whitepaper">
                      <ExternalLink className="w-4 h-4 mr-1.5" />
                      Learn more
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left text-xs text-muted-foreground font-medium py-3 px-4 uppercase tracking-wider">#</th>
                      <th className="text-left text-xs text-muted-foreground font-medium py-3 pr-4 uppercase tracking-wider">Validator</th>
                      <th className="text-left text-xs text-muted-foreground font-medium py-3 pr-4 uppercase tracking-wider hidden md:table-cell">Region</th>
                      <th className="text-right text-xs text-muted-foreground font-medium py-3 pr-4 uppercase tracking-wider hidden sm:table-cell">Stake</th>
                      <th className="text-right text-xs text-muted-foreground font-medium py-3 pr-4 uppercase tracking-wider hidden lg:table-cell">Uptime</th>
                      <th className="text-right text-xs text-muted-foreground font-medium py-3 pr-4 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {validators!.map((v) => (
                      <tr key={v.address} className="border-b border-border/40 last:border-0 hover:bg-muted/30 transition-colors" data-testid={`validator-row-${v.rank}`}>
                        <td className="py-3 pl-4 pr-3">
                          <span className="font-mono text-xs text-muted-foreground">#{v.rank}</span>
                        </td>
                        <td className="py-3 pr-4">
                          <Link href={`/explorer/address/${v.address}`} className="font-medium text-sm hover:text-primary transition-colors">
                            {v.name}
                          </Link>
                          <div className="font-mono text-[10px] text-muted-foreground truncate max-w-[160px]">{v.address.slice(0, 20)}...</div>
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
                          <span className={`font-mono text-xs ${parseFloat(v.uptime.toString()) >= 99 ? "text-green-500" : "text-yellow-500"}`}>
                            {v.uptime}%
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-right">
                          <Badge variant="outline" className={`text-[10px] capitalize ${v.status === "active" ? "border-green-200 text-green-700 bg-green-50" : v.status === "inactive" ? "border-yellow-200 text-yellow-700 bg-yellow-50" : "border-red-200 text-red-700 bg-red-50"}`}>
                            {v.status === "active" && <Activity className="w-2.5 h-2.5 mr-0.5" />}
                            {v.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
