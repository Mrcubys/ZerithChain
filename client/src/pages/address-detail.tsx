import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Transaction } from "@shared/schema";
import { TxRow } from "@/components/tx-row";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { formatZTH, shortAddress } from "@/lib/chain-utils";
import { User, ArrowLeft, Copy, Shield, ArrowRightLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AddressInfo {
  address: string;
  balance: string;
  stakedBalance: string;
  nonce: number;
  transactions: Transaction[];
  isValidator: boolean;
}

export default function AddressDetail() {
  const { address } = useParams<{ address: string }>();
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery<AddressInfo>({
    queryKey: ["/api/address", address],
    queryFn: async () => {
      const res = await fetch(`/api/address/${address}`);
      if (!res.ok) throw new Error("Address not found");
      return res.json();
    },
  });

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: "Address copied to clipboard." });
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6">
        <div className="text-center py-16">
          <User className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h2 className="text-xl font-display font-bold">Address Not Found</h2>
          <Button variant="outline" asChild className="mt-4">
            <Link href="/explorer"><ArrowLeft className="w-4 h-4 mr-1.5" />Back to Explorer</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-auto">
      <div className="border-b border-border/50 px-6 py-5">
        <div className="flex items-center gap-3 flex-wrap">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/explorer"><ArrowLeft className="w-4 h-4 mr-1" />Explorer</Link>
          </Button>
          <Separator orientation="vertical" className="h-4" />
          <div className="flex items-center gap-2">
            {data.isValidator ? <Shield className="w-5 h-5 text-neon-purple" /> : <User className="w-5 h-5 text-primary" />}
            <h1 className="font-display text-xl font-bold">Address</h1>
          </div>
          {data.isValidator && <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20">Validator</Badge>}
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className="font-mono text-sm text-muted-foreground truncate" data-testid="address-value">{data.address}</span>
          <button onClick={() => copy(data.address)} className="p-1 rounded text-muted-foreground" data-testid="button-copy-address">
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6 flex-1 overflow-auto">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Balance</p>
              <p className="text-xl font-display font-bold text-primary mt-1" data-testid="address-balance">{formatZTH(data.balance)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Staked</p>
              <p className="text-xl font-display font-bold text-neon-purple mt-1" data-testid="address-staked">{formatZTH(data.stakedBalance)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Transactions</p>
              <p className="text-xl font-display font-bold text-foreground mt-1" data-testid="address-nonce">{data.transactions.length}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-display flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-neon-purple" />
              Transaction History
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {data.transactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No transactions found</div>
            ) : (
              data.transactions.map(tx => <TxRow key={tx.hash} tx={tx} />)
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
