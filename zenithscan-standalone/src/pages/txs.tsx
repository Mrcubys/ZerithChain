import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { shortHash, shortAddress, formatZTH, timeAgo, txTypeBadgeClass, statusBadgeClass } from "@/lib/chain-utils";
import { ArrowRightLeft, Search, ArrowRight } from "lucide-react";

interface Transaction {
  hash: string; from: string; to: string; amount: string;
  timestamp: string; status: string; type: string;
}

export default function Txs() {
  const [search, setSearch] = useState("");

  const { data: txs, isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions?limit=50"],
    refetchInterval: 5000,
  });

  const filtered = useMemo(() => {
    if (!txs || !search.trim()) return txs ?? [];
    const q = search.trim().toLowerCase();
    return txs.filter(tx =>
      tx.hash.toLowerCase().includes(q) ||
      tx.from.toLowerCase().includes(q) ||
      tx.to.toLowerCase().includes(q) ||
      tx.type.includes(q)
    );
  }, [txs, search]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <ArrowRightLeft className="w-5 h-5 text-primary" />
          Transactions
        </h2>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Filter by hash or address…"
            className="pl-9 h-9 rounded-xl bg-white text-sm"
            data-testid="input-filter"
          />
        </div>
      </div>

      <Card className="rounded-2xl border-border/60 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left text-xs text-muted-foreground font-medium py-3 px-4 uppercase tracking-wider">Tx Hash</th>
                <th className="text-left text-xs text-muted-foreground font-medium py-3 pr-4 uppercase tracking-wider hidden sm:table-cell">Type</th>
                <th className="text-left text-xs text-muted-foreground font-medium py-3 pr-4 uppercase tracking-wider hidden md:table-cell">From → To</th>
                <th className="text-right text-xs text-muted-foreground font-medium py-3 pr-4 uppercase tracking-wider hidden lg:table-cell">Amount</th>
                <th className="text-right text-xs text-muted-foreground font-medium py-3 pr-4 uppercase tracking-wider">Status</th>
                <th className="text-right text-xs text-muted-foreground font-medium py-3 pr-4 uppercase tracking-wider">Age</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 15 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/40">
                    <td className="py-3 px-4"><Skeleton className="h-4 w-32" /></td>
                    <td className="py-3 pr-4 hidden sm:table-cell"><Skeleton className="h-4 w-16" /></td>
                    <td className="py-3 pr-4 hidden md:table-cell"><Skeleton className="h-4 w-40" /></td>
                    <td className="py-3 pr-4 hidden lg:table-cell"><Skeleton className="h-4 w-20 ml-auto" /></td>
                    <td className="py-3 pr-4"><Skeleton className="h-4 w-14 ml-auto" /></td>
                    <td className="py-3 pr-4"><Skeleton className="h-4 w-12 ml-auto" /></td>
                  </tr>
                ))
                : filtered.map((tx) => (
                  <tr key={tx.hash} className="border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors" data-testid={`tx-row-${tx.hash.slice(0, 8)}`}>
                    <td className="py-3 px-4">
                      <Link href={`/tx/${tx.hash}`} className="font-mono text-xs text-primary hover:underline">
                        {shortHash(tx.hash)}
                      </Link>
                    </td>
                    <td className="py-3 pr-4 hidden sm:table-cell">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium border capitalize ${txTypeBadgeClass(tx.type)}`}>{tx.type}</span>
                    </td>
                    <td className="py-3 pr-4 hidden md:table-cell">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Link href={`/address/${tx.from}`} className="font-mono hover:text-foreground">{shortAddress(tx.from)}</Link>
                        <ArrowRight className="w-3 h-3 flex-shrink-0" />
                        <Link href={`/address/${tx.to}`} className="font-mono hover:text-foreground">{shortAddress(tx.to)}</Link>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-right hidden lg:table-cell">
                      <span className="font-mono text-xs font-medium">{formatZTH(tx.amount, 2)}</span>
                    </td>
                    <td className="py-3 pr-4 text-right">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium border capitalize ${statusBadgeClass(tx.status)}`}>{tx.status}</span>
                    </td>
                    <td className="py-3 pr-4 text-right">
                      <span className="text-xs text-muted-foreground">{timeAgo(tx.timestamp)}</span>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
