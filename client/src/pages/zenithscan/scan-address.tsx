import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { formatZTH, shortHash, shortAddress, timeAgo, txTypeBadgeClass, statusBadgeClass } from "@/lib/chain-utils";
import { User, ArrowLeft, Copy, Shield, Gem, Wallet, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ScanAddress() {
  const { address } = useParams<{ address: string }>();
  const { toast } = useToast();
  const connectedAddress = localStorage.getItem("zerith-wallet-address") ?? "";
  const isMyWallet = address === connectedAddress;

  const { data, isLoading, error } = useQuery<{
    address: string; balance: string; stakedBalance: string;
    nonce: number; transactions: any[]; isValidator: boolean;
    isDeveloper: boolean; walletName: string | null;
  }>({
    queryKey: ["/api/addresses", address],
    queryFn: async () => {
      const res = await fetch(`/api/addresses/${address}`);
      if (!res.ok) throw new Error("Address not found");
      return res.json();
    },
  });

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: `${label} copied.` });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-20">
        <User className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
        <h2 className="text-lg font-semibold">Address Not Found</h2>
        <Button variant="outline" size="sm" asChild className="mt-4">
          <Link href="/scan"><ArrowLeft className="w-4 h-4 mr-1.5" />Back to Explorer</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center gap-3 flex-wrap">
        <Button variant="ghost" size="sm" asChild className="h-8 px-2">
          <Link href="/scan"><ArrowLeft className="w-4 h-4 mr-1" />Explorer</Link>
        </Button>
        <Separator orientation="vertical" className="h-4" />
        <User className="w-4 h-4 text-muted-foreground" />
        <h1 className="font-semibold">Address</h1>
        {isMyWallet && (
          <Badge className="bg-primary/10 text-primary border-primary/20 text-xs border">
            <Wallet className="w-3 h-3 mr-1" />Your Wallet
          </Badge>
        )}
        {data.isDeveloper && (
          <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs border">
            <Gem className="w-3 h-3 mr-1" />Genesis
          </Badge>
        )}
        {data.isValidator && (
          <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-xs border">
            <Shield className="w-3 h-3 mr-1" />Validator
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-2 bg-muted/40 rounded-lg px-3 py-2">
        <span className="font-mono text-xs text-muted-foreground break-all flex-1">{address}</span>
        <button onClick={() => copy(address, "Address")} className="flex-shrink-0 text-muted-foreground hover:text-foreground" data-testid="copy-address">
          <Copy className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="rounded-2xl border-border/60 bg-white shadow-sm">
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Balance</div>
            <div className="text-xl font-bold font-mono text-foreground" data-testid="address-balance">{formatZTH(data.balance)}</div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/60 bg-white shadow-sm">
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Staked</div>
            <div className="text-xl font-bold font-mono text-foreground" data-testid="address-staked">{formatZTH(data.stakedBalance)}</div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/60 bg-white shadow-sm">
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Transactions</div>
            <div className="text-xl font-bold font-mono text-foreground" data-testid="address-tx-count">{data.transactions.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-border/60 bg-white shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Overview</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {[
            { label: "Address", value: address, mono: true, copyable: true },
            { label: "Name", value: data.walletName ?? "—" },
            { label: "Type", value: data.isDeveloper ? "Genesis Developer Wallet" : data.isValidator ? "Validator Node" : "Standard Wallet" },
            { label: "Nonce", value: data.nonce.toLocaleString() },
          ].map((row, i) => (
            <div key={i} className="flex items-start gap-4 py-2.5 border-b border-border/40 last:border-0">
              <span className="text-xs text-muted-foreground w-24 flex-shrink-0 pt-0.5">{row.label}</span>
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className={`text-sm break-all ${row.mono ? "font-mono text-muted-foreground" : "font-medium"}`}>{row.value}</span>
                {row.copyable && (
                  <button onClick={() => copy(row.value as string, row.label)} className="flex-shrink-0 p-0.5 text-muted-foreground hover:text-foreground">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {data.transactions.length > 0 && (
        <Card className="rounded-2xl border-border/60 bg-white shadow-sm overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Transactions ({data.transactions.length})</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 p-0">
            {data.transactions.map((tx: any) => (
              <div key={tx.hash} className="flex items-center gap-3 px-4 py-3 border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors">
                <div className="flex-shrink-0">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium border capitalize ${txTypeBadgeClass(tx.type)}`}>
                    {tx.type}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/scan/tx/${tx.hash}`} className="font-mono text-xs text-primary hover:underline truncate block">
                    {shortHash(tx.hash)}
                  </Link>
                  <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground">
                    <Link href={`/scan/address/${tx.from}`} className="font-mono truncate max-w-[80px] hover:text-foreground transition-colors">{shortAddress(tx.from)}</Link>
                    <ArrowRight className="w-2.5 h-2.5 flex-shrink-0" />
                    <Link href={`/scan/address/${tx.to}`} className="font-mono truncate max-w-[80px] hover:text-foreground transition-colors">{shortAddress(tx.to)}</Link>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-mono text-xs font-medium">{formatZTH(tx.amount, 2)}</div>
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded-sm text-[10px] font-medium border capitalize ${statusBadgeClass(tx.status)}`}>{tx.status}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
