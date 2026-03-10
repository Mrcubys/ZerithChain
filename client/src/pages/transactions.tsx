import { useState, useMemo } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Transaction } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { shortHash, shortAddress, formatZTH, timeAgo, formatTimestamp } from "@/lib/chain-utils";
import { Search, ArrowDownLeft, ArrowRight, Filter, ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 15;
const WALLET_KEY = "zerith-wallet-address";
const NETWORK_KEY = "zerith-network";

export default function Transactions() {
  const address = localStorage.getItem(WALLET_KEY) ?? "";
  const network = localStorage.getItem(NETWORK_KEY) ?? "mainnet";
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const { data: walletInfo, isLoading } = useQuery<{ transactions: Transaction[] }>({
    queryKey: ["/api/wallet", address, network],
    queryFn: async () => {
      if (!address) return { transactions: [] };
      const res = await fetch(`/api/wallet?address=${address}&network=${network}`);
      return res.json();
    },
    enabled: !!address,
    refetchInterval: 15000,
  });

  const txs = walletInfo?.transactions ?? [];

  const filtered = useMemo(() => {
    return txs.filter(tx => {
      if (typeFilter !== "all" && tx.type !== typeFilter) return false;
      if (statusFilter !== "all" && tx.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return tx.hash.includes(q) || tx.from.includes(q) || tx.to.includes(q) || tx.type.includes(q);
      }
      return true;
    });
  }, [txs, typeFilter, statusFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const typeOptions = ["all", "transfer", "stake", "unstake", "contract", "delegate"];
  const statusOptions = ["all", "success", "failed"];

  if (!address) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3 p-6">
        <p className="text-muted-foreground text-sm">No wallet connected.</p>
        <Link href="/" className="text-primary text-sm font-medium">Open Wallet →</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-background border-b border-border px-5 pt-10 pb-4 sticky top-0 z-10">
        <h1 className="text-xl font-semibold mb-4">Transaction History</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by hash, address..."
            className="pl-9 rounded-xl bg-muted/50 border-border"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            data-testid="input-tx-search"
          />
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        <div className="flex gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Type:</span>
          </div>
          {typeOptions.map(t => (
            <button key={t} onClick={() => { setTypeFilter(t); setPage(1); }} className={`px-3 py-1 rounded-full text-xs font-medium transition-colors capitalize ${typeFilter === t ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`} data-testid={`filter-type-${t}`}>
              {t}
            </button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Status:</span>
          </div>
          {statusOptions.map(s => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }} className={`px-3 py-1 rounded-full text-xs font-medium transition-colors capitalize ${statusFilter === s ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`} data-testid={`filter-status-${s}`}>
              {s}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
          </div>
        ) : paginated.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-sm">No transactions found</p>
          </div>
        ) : (
          <Card className="rounded-2xl shadow-sm border-card-border">
            <CardContent className="p-0">
              {paginated.map((tx, i) => {
                const isSend = tx.from === address;
                return (
                  <Link key={tx.hash} href={`/explorer/tx/${tx.hash}`} className={`flex items-center gap-3 px-4 py-3.5 hover:bg-muted/40 transition-colors ${i < paginated.length - 1 ? "border-b border-border/60" : ""}`} data-testid={`tx-history-${tx.hash.slice(2, 10)}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isSend ? "bg-red-50" : "bg-green-50"}`}>
                      {isSend
                        ? <ArrowRight className="w-4 h-4 text-red-500" />
                        : <ArrowDownLeft className="w-4 h-4 text-green-500" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium capitalize">{tx.type}</span>
                        <span className={`text-sm font-semibold font-mono ${isSend ? "text-red-500" : "text-green-600"}`}>
                          {isSend ? "-" : "+"}{parseFloat(tx.amount).toFixed(2)} ZTH
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2 mt-0.5">
                        <span className="font-mono text-xs text-muted-foreground truncate">{shortHash(tx.hash, 8)}</span>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <span className="text-xs text-muted-foreground">{timeAgo(tx.timestamp)}</span>
                          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-4 capitalize ${tx.status === "success" ? "border-green-200 text-green-700 bg-green-50" : "border-red-200 text-red-700 bg-red-50"}`}>
                            {tx.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </CardContent>
          </Card>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-1">
            <span className="text-xs text-muted-foreground">{filtered.length} transactions</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg border border-border disabled:opacity-40 hover:bg-muted transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded-lg border border-border disabled:opacity-40 hover:bg-muted transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
