import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Users, ShieldCheck, ShieldAlert, Activity } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { shortHash, formatZTH, formatNumber, pctColor } from "@/lib/chain-utils";

function ValidatorRow({ validator, rank }: { validator: any; rank: number }) {
  const address = validator.address ?? validator.validatorAddress ?? "";
  const name = validator.name ?? validator.moniker ?? validator.validatorName ?? shortHash(address, 8);
  const stake = parseFloat(validator.stake ?? validator.votingPower ?? validator.stakedAmount ?? "0");
  const commission = validator.commission ?? validator.commissionRate ?? null;
  const uptime = validator.uptime ?? validator.uptimePercent ?? null;
  const status = validator.status ?? (validator.active ? "active" : "inactive");
  const isActive = status === "active" || status === "bonded";

  return (
    <div className="grid grid-cols-[auto_auto_1fr_auto_auto_auto] gap-4 items-center py-3.5 hover:bg-secondary/30 rounded-lg px-4 -mx-4 transition-colors">
      <span className="text-sm font-bold text-muted-foreground w-6 text-center">{rank}</span>
      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        {isActive ? <ShieldCheck className="w-4 h-4 text-primary" /> : <ShieldAlert className="w-4 h-4 text-muted-foreground" />}
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <Link href={`/address/${address}`}>
            <span className="text-sm font-semibold text-primary hover:underline cursor-pointer" data-testid={`link-validator-${rank}`}>{name}</span>
          </Link>
          <Badge variant={isActive ? "success" : "outline"} className="text-xs">{status}</Badge>
        </div>
        <p className="text-xs text-muted-foreground font-mono">{shortHash(address, 10)}</p>
      </div>
      <div className="text-right hidden lg:block">
        <p className="text-xs text-muted-foreground">Voting Power</p>
        <p className="text-sm font-semibold text-foreground">{formatZTH(stake)}</p>
      </div>
      <div className="text-right hidden md:block">
        <p className="text-xs text-muted-foreground">Commission</p>
        <p className="text-sm text-foreground">{commission != null ? `${(commission * 100).toFixed(1)}%` : "—"}</p>
      </div>
      <div className="text-right">
        <p className="text-xs text-muted-foreground">Uptime</p>
        <p className={`text-sm font-semibold ${uptime != null ? pctColor(uptime) : "text-muted-foreground"}`}>
          {uptime != null ? `${uptime.toFixed(1)}%` : "—"}
        </p>
      </div>
    </div>
  );
}

export default function ScanValidators() {
  const { data: networkStatus } = useQuery<any>({
    queryKey: ["/api/network/status"],
    refetchInterval: 30_000,
  });

  const { data, isLoading, error } = useQuery<any>({
    queryKey: ["/api/validators"],
    refetchInterval: 30_000,
  });

  const validators: any[] = Array.isArray(data) ? data : data?.validators ?? [];
  const activeCount = networkStatus?.activeValidators ?? validators.filter(v => v.status === "active" || v.status === "bonded" || v.active).length;
  const totalValidators = networkStatus?.totalValidators ?? validators.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            Validators
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Validators securing the Zerith Chain</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="success" className="text-xs">
            <ShieldCheck className="w-3 h-3 mr-1" />
            {activeCount} active
          </Badge>
          {totalValidators > 0 && <Badge variant="outline" className="text-xs">{totalValidators} total</Badge>}
        </div>
      </div>

      {validators.length === 0 && !isLoading ? (
        <Card>
          <CardContent className="p-8">
            <div className="text-center py-6">
              <Activity className="w-12 h-12 text-primary/30 mx-auto mb-4" />
              <p className="text-foreground font-semibold mb-1">Validator Information</p>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                Validator data is not available via the API at this time. Based on network status,
                there are <span className="text-primary font-semibold">{activeCount} active validators</span> securing
                the Zerith Chain.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-primary">{activeCount}</p>
                <p className="text-xs text-muted-foreground mt-1">Active Validators</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-foreground">{totalValidators || "—"}</p>
                <p className="text-xs text-muted-foreground mt-1">Total Validators</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-foreground">
                  {networkStatus?.bondedRatio != null ? `${(networkStatus.bondedRatio * 100).toFixed(2)}%` : "—"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Bonded Ratio</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-0 pt-5 px-4">
            <div className="grid grid-cols-[auto_auto_1fr_auto_auto_auto] gap-4 items-center pb-3 border-b border-border">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider w-6 text-center">#</span>
              <div className="w-9" />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Validator</p>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right hidden lg:block">Voting Power</p>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right hidden md:block">Commission</p>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Uptime</p>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {isLoading ? (
              <div className="space-y-2 pt-2">{Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
            ) : (
              <div className="divide-y divide-border/40">
                {validators.map((v, i) => <ValidatorRow key={v.address ?? i} validator={v} rank={i + 1} />)}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
