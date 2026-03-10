import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import type { Validator } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Globe, Zap, Award, Activity } from "lucide-react";
import { formatZTH, formatCompact, shortAddress, regionColor } from "@/lib/chain-utils";

function validatorStatusBadge(status: string) {
  switch (status) {
    case "active": return "bg-green-500/10 text-green-400 border-green-500/20";
    case "inactive": return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
    case "jailed": return "bg-red-500/10 text-red-400 border-red-500/20";
    default: return "bg-muted text-muted-foreground";
  }
}

export default function Validators() {
  const { data: validators, isLoading } = useQuery<Validator[]>({
    queryKey: ["/api/validators"],
    refetchInterval: 15000,
  });

  const byRegion = validators ? {
    Americas: validators.filter(v => v.region === "Americas"),
    Europe: validators.filter(v => v.region === "Europe"),
    Asia: validators.filter(v => v.region === "Asia"),
    Africa: validators.filter(v => v.region === "Africa"),
  } : {};

  const activeCount = validators?.filter(v => v.status === "active").length ?? 0;
  const totalStake = validators?.reduce((sum, v) => sum + parseFloat(v.stake) + parseFloat(v.delegatedStake), 0) ?? 0;

  return (
    <div className="flex flex-col h-full overflow-auto">
      <div className="border-b border-border/50 px-6 py-6 bg-grid-pattern bg-grid">
        <div className="flex items-center gap-3 mb-1">
          <Shield className="w-6 h-6 text-neon-purple" />
          <h1 className="font-display text-2xl font-bold">Validator Network</h1>
        </div>
        <p className="text-muted-foreground text-sm">Zerith Chain global validator network — ZPoS consensus</p>

        <div className="grid grid-cols-2 gap-4 mt-5 lg:grid-cols-4">
          <div className="rounded-md border border-border/50 bg-card p-3">
            <div className="text-xs text-muted-foreground">Active Validators</div>
            <div className="text-xl font-display font-bold text-green-400 mt-0.5" data-testid="validators-active">{activeCount}</div>
          </div>
          <div className="rounded-md border border-border/50 bg-card p-3">
            <div className="text-xs text-muted-foreground">Total Staked</div>
            <div className="text-xl font-display font-bold text-neon-purple mt-0.5">{formatCompact(totalStake)} ZTH</div>
          </div>
          <div className="rounded-md border border-border/50 bg-card p-3">
            <div className="text-xs text-muted-foreground">Min. Stake</div>
            <div className="text-xl font-display font-bold text-primary mt-0.5">50K ZTH</div>
          </div>
          <div className="rounded-md border border-border/50 bg-card p-3">
            <div className="text-xs text-muted-foreground">Block Time</div>
            <div className="text-xl font-display font-bold text-neon-cyan mt-0.5">~2s</div>
          </div>
        </div>
      </div>

      <div className="p-6 flex-1">
        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            <TabsTrigger value="all" data-testid="tab-all-validators">All</TabsTrigger>
            {Object.keys(byRegion).map(region => (
              <TabsTrigger key={region} value={region} data-testid={`tab-region-${region.toLowerCase()}`}>{region}</TabsTrigger>
            ))}
          </TabsList>

          {["all", "Americas", "Europe", "Asia", "Africa"].map(tab => (
            <TabsContent key={tab} value={tab}>
              <div className="space-y-3">
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24" />)
                  : (tab === "all" ? validators : byRegion[tab as keyof typeof byRegion])?.map((validator) => (
                    <ValidatorCard key={validator.address} validator={validator} />
                  ))
                }
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}

function ValidatorCard({ validator }: { validator: Validator }) {
  const totalStake = parseFloat(validator.stake) + parseFloat(validator.delegatedStake);

  return (
    <Card className="hover-elevate" data-testid={`validator-card-${validator.rank}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-md bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center border border-border/50">
            <span className="text-sm font-display font-bold text-primary">#{validator.rank}</span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Link href={`/explorer/address/${validator.address}`} className="font-semibold text-foreground" data-testid={`validator-name-${validator.rank}`}>
                {validator.name}
              </Link>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border capitalize ${validatorStatusBadge(validator.status)}`}>
                {validator.status}
              </span>
              <span className={`text-xs font-medium ${regionColor(validator.region)} flex items-center gap-1`}>
                <Globe className="w-3 h-3" />
                {validator.region}
              </span>
            </div>
            <div className="text-xs font-mono text-muted-foreground mt-0.5">{shortAddress(validator.address)}</div>

            <div className="grid grid-cols-4 gap-4 mt-3">
              <div>
                <div className="text-xs text-muted-foreground">Total Stake</div>
                <div className="text-sm font-semibold text-neon-purple">{formatCompact(totalStake)} ZTH</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Commission</div>
                <div className="text-sm font-semibold">{validator.commission}%</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Uptime</div>
                <div className="flex items-center gap-1.5">
                  <div className="flex-1">
                    <Progress value={validator.uptime} className="h-1.5" />
                  </div>
                  <span className="text-sm font-semibold text-green-400">{validator.uptime}%</span>
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Latency</div>
                <div className="text-sm font-semibold text-neon-cyan flex items-center gap-1">
                  <Activity className="w-3 h-3" />
                  {validator.latency}ms
                </div>
              </div>
            </div>
          </div>

          <div className="text-right flex-shrink-0">
            <div className="text-xs text-muted-foreground">Blocks</div>
            <div className="text-sm font-semibold font-mono">{validator.blocksProduced.toLocaleString()}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
