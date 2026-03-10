import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Validator } from "@shared/schema";
import { BrowserSubNav } from "@/components/wallet-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { formatZTH, regionColor } from "@/lib/chain-utils";
import { TrendingUp, Shield, Plus, Coins, ChevronRight } from "lucide-react";

const WALLET_KEY = "zerith-wallet-address";
const NETWORK_KEY = "zerith-network";

export default function Stake() {
  const address = localStorage.getItem(WALLET_KEY) ?? "";
  const network = localStorage.getItem(NETWORK_KEY) ?? "mainnet";
  const { toast } = useToast();
  const qc = useQueryClient();
  const [selected, setSelected] = useState<Validator | null>(null);
  const [amount, setAmount] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: validators, isLoading: validatorsLoading } = useQuery<Validator[]>({
    queryKey: ["/api/validators"],
    refetchInterval: 30000,
  });

  const { data: walletInfo, isLoading: walletLoading } = useQuery<{
    balance: string; stakedBalance: string;
  }>({
    queryKey: ["/api/wallet", address, network],
    queryFn: async () => {
      if (!address) return { balance: "0", stakedBalance: "0" };
      const res = await fetch(`/api/wallet?address=${address}&network=${network}`);
      return res.json();
    },
    enabled: !!address,
  });

  const stakeMutation = useMutation({
    mutationFn: async () => {
      if (!selected || !address) throw new Error("Missing data");
      const res = await fetch("/api/wallet/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from: address, to: selected.address, amount, network, type: "stake" }),
      });
      if (!res.ok) throw new Error("Stake failed");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Stake submitted", description: `${amount} ZTH delegated to ${selected?.name}` });
      qc.invalidateQueries({ queryKey: ["/api/wallet", address, network] });
      setDialogOpen(false);
      setAmount("");
      setSelected(null);
    },
    onError: () => {
      toast({ title: "Stake failed", variant: "destructive" });
    },
  });

  const openStakeDialog = (v: Validator) => {
    setSelected(v);
    setAmount("");
    setDialogOpen(true);
  };

  const activeValidators = validators?.filter(v => v.status === "active") ?? [];
  const totalStaked = validators?.reduce((sum, v) => sum + parseFloat(v.stake), 0) ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <BrowserSubNav />

      <div className="px-4 py-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Card className="rounded-2xl border-card-border">
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Your Staked</div>
              {walletLoading ? <Skeleton className="h-6 w-24" /> : (
                <div className="text-lg font-semibold font-mono" data-testid="staked-balance">{formatZTH(walletInfo?.stakedBalance ?? "0", 2)}</div>
              )}
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-card-border">
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Network</div>
              <div className="text-lg font-semibold font-mono text-primary">{(totalStaked / 1_000_000).toFixed(2)}M ZTH</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Card className="rounded-2xl border-card-border">
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Active Validators</div>
              <div className="text-lg font-semibold font-mono text-green-600">{activeValidators.length}</div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-card-border">
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Min Stake</div>
              <div className="text-lg font-semibold font-mono">50K ZTH</div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <p className="text-sm font-semibold text-foreground">Active Validators</p>
            <span className="text-xs text-muted-foreground">{activeValidators.length} available</span>
          </div>

          {validatorsLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
            </div>
          ) : activeValidators.length === 0 ? (
            <Card className="rounded-2xl border-card-border">
              <CardContent className="py-10 text-center">
                <Shield className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground text-sm">No validators yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {activeValidators.slice(0, 12).map((v) => (
                <Card key={v.address} className="rounded-2xl border-card-border hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Shield className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-sm truncate">{v.name}</span>
                          <span className="text-xs text-green-600 font-medium flex-shrink-0">APR ~{(v.commission > 0 ? 12 - v.commission * 0.5 : 12).toFixed(1)}%</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className={`text-xs ${regionColor(v.region)}`}>{v.region}</span>
                          <span className="text-xs text-muted-foreground">Commission {v.commission}%</span>
                          <span className="text-xs text-muted-foreground">Uptime {v.uptime}%</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Staked: {(parseFloat(v.stake) / 1000).toFixed(0)}K ZTH
                        </div>
                      </div>
                      <button onClick={() => openStakeDialog(v)} className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors" data-testid={`button-stake-${v.rank}`}>
                        <Plus className="w-4 h-4 text-primary" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle>Delegate Stake</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/40">
                <Shield className="w-8 h-8 text-primary" />
                <div>
                  <p className="font-semibold text-sm">{selected.name}</p>
                  <p className="text-xs text-muted-foreground">{selected.region} · Commission {selected.commission}%</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Amount (ZTH)</label>
                <Input
                  type="number"
                  placeholder="Enter amount to stake..."
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="rounded-xl"
                  data-testid="input-stake-amount"
                />
                <p className="text-xs text-muted-foreground mt-1">Minimum stake: 50,000 ZTH</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)} className="flex-1 rounded-xl">Cancel</Button>
                <Button
                  onClick={() => stakeMutation.mutate()}
                  disabled={!amount || parseFloat(amount) <= 0 || stakeMutation.isPending}
                  className="flex-1 rounded-xl"
                  data-testid="button-confirm-stake"
                >
                  {stakeMutation.isPending ? "Staking..." : "Stake ZTH"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
