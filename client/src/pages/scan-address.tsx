import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { Wallet, ArrowLeftRight, Copy, CheckCheck, ChevronLeft, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { shortHash, timeAgo, formatZTH, formatNumber } from "@/lib/chain-utils";
import { useState } from "react";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-md hover:bg-secondary/50" data-testid="button-copy-address">
      {copied ? <CheckCheck className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
    </button>
  );
}

export default function ScanAddress() {
  const params = useParams<{ addr: string }>();
  const addr = params.addr;

  const { data: addressData, isLoading, error } = useQuery<any>({
    queryKey: [`/api/addresses/${addr}`],
  });

  const balance = addressData?.balance ?? addressData?.ZTH ?? 0;
  const totalSent = addressData?.totalSent ?? null;
  const totalReceived = addressData?.totalReceived ?? null;
  const txCount = addressData?.txCount ?? addressData?.transactionCount ?? 0;
  const txs: any[] = Array.isArray(addressData?.transactions) ? addressData.transactions :
    Array.isArray(addressData?.txs) ? addressData.txs : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/">
          <span className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
            <ChevronLeft className="w-4 h-4" />
            Explorer
          </span>
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm font-mono text-foreground truncate">{shortHash(addr, 12)}</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Wallet className="w-6 h-6 text-primary" />
          Address
        </h1>
        <div className="flex items-center gap-1 mt-1">
          <p className="text-sm font-mono text-muted-foreground break-all">{addr}</p>
          <CopyButton text={addr} />
        </div>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-3 gap-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>
      ) : error ? (
        <Card><CardContent className="p-12 text-center">
          <Wallet className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Address not found or API unavailable</p>
        </CardContent></Card>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-5">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Balance</p>
                <p className="text-2xl font-bold text-foreground">{formatZTH(parseFloat(String(balance)))}</p>
              </CardContent>
            </Card>
            {totalReceived != null && (
              <Card>
                <CardContent className="p-5">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                    <TrendingDown className="w-3 h-3 text-green-400" /> Total Received
                  </p>
                  <p className="text-xl font-bold text-foreground">{formatZTH(parseFloat(String(totalReceived)))}</p>
                </CardContent>
              </Card>
            )}
            {totalSent != null && (
              <Card>
                <CardContent className="p-5">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-red-400" /> Total Sent
                  </p>
                  <p className="text-xl font-bold text-foreground">{formatZTH(parseFloat(String(totalSent)))}</p>
                </CardContent>
              </Card>
            )}
            <Card>
              <CardContent className="p-5">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Transactions</p>
                <p className="text-2xl font-bold text-foreground">{formatNumber(txCount)}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <ArrowLeftRight className="w-4 h-4 text-primary" />
                Transactions
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              {txs.length === 0 ? (
                <div className="text-center py-10">
                  <ArrowLeftRight className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">No transactions for this address</p>
                </div>
              ) : (
                <div className="divide-y divide-border/40">
                  {txs.map((tx: any, i: number) => {
                    const hash = tx.hash ?? "";
                    const from = tx.from ?? "";
                    const to = tx.to ?? "";
                    const isIncoming = to.toLowerCase() === addr.toLowerCase();
                    const ts = tx.timestamp;
                    const status = tx.status ?? "pending";
                    const type = tx.type ?? "transfer";
                    const amount = parseFloat(tx.amount ?? "0");
                    return (
                      <div key={hash || i} className="grid grid-cols-[auto_1fr_auto_auto] gap-3 items-center py-3 hover:bg-secondary/30 rounded-lg px-3 -mx-3 transition-colors">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isIncoming ? "bg-green-500/15" : "bg-red-500/15"}`}>
                          {isIncoming ? <TrendingDown className="w-4 h-4 text-green-400" /> : <TrendingUp className="w-4 h-4 text-red-400" />}
                        </div>
                        <div className="min-w-0">
                          <Link href={`/tx/${hash}`}>
                            <span className="text-sm font-mono text-primary hover:underline cursor-pointer truncate block">{shortHash(hash, 10)}</span>
                          </Link>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <span>{isIncoming ? "from" : "to"}</span>
                            <Link href={`/address/${isIncoming ? from : to}`}>
                              <span className="font-mono hover:text-primary cursor-pointer">{shortHash(isIncoming ? from : to, 6)}</span>
                            </Link>
                            <Badge variant="outline" className="text-xs capitalize">{type}</Badge>
                          </div>
                        </div>
                        <p className={`text-sm font-medium ${isIncoming ? "text-green-400" : "text-red-400"}`}>
                          {isIncoming ? "+" : "-"}{formatZTH(amount)}
                        </p>
                        <div className="text-right">
                          <Badge variant={status === "success" ? "success" : "destructive"} className="text-xs">{status}</Badge>
                          <p className="text-xs text-muted-foreground mt-0.5">{ts ? timeAgo(ts) : "—"}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
