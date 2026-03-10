import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { TxRow } from "@/components/tx-row";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { formatZTH } from "@/lib/chain-utils";
import { User, ArrowLeft, Copy, Shield, Gem } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AddressDetail() {
  const { address } = useParams<{ address: string }>();
  const { toast } = useToast();

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

  if (isLoading) return <div className="p-6 space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-48 w-full" /></div>;

  if (error || !data) {
    return (
      <div className="p-6 text-center py-16">
        <User className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
        <h2 className="text-lg font-semibold">Address Not Found</h2>
        <Button variant="outline" size="sm" asChild className="mt-4">
          <Link href="/explorer"><ArrowLeft className="w-4 h-4 mr-1.5" />Back to Explorer</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      <div className="border-b border-border px-6 py-4">
        <div className="flex items-center gap-3 flex-wrap">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/explorer"><ArrowLeft className="w-4 h-4 mr-1" />Explorer</Link>
          </Button>
          <Separator orientation="vertical" className="h-4" />
          <User className="w-4 h-4 text-muted-foreground" />
          <h1 className="font-semibold">Address</h1>
          {data.isDeveloper && (
            <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-xs border ml-1">
              <Gem className="w-3 h-3 mr-1" />Genesis
            </Badge>
          )}
          {data.isValidator && (
            <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs border ml-1">
              <Shield className="w-3 h-3 mr-1" />Validator
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="font-mono text-xs text-muted-foreground break-all">{address}</span>
          <button onClick={() => copy(address, "Address")} className="flex-shrink-0 text-muted-foreground hover:text-foreground" data-testid="copy-address">
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Balance</div>
              <div className="text-xl font-semibold font-mono mt-1" data-testid="address-balance">{formatZTH(data.balance)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Staked</div>
              <div className="text-xl font-semibold font-mono mt-1" data-testid="address-staked">{formatZTH(data.stakedBalance)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Transactions</div>
              <div className="text-xl font-semibold font-mono mt-1" data-testid="address-tx-count">{data.transactions.length}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
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
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Transactions ({data.transactions.length})</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {data.transactions.map((tx: any) => <TxRow key={tx.hash} tx={tx} />)}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
