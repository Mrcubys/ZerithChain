import { useState } from "react";
  import { useQuery } from "@tanstack/react-query";
  import { Link, useLocation } from "wouter";
  import { shortHash, formatZTH, timeAgo } from "@/lib/chain-utils";
  import { Layers, ArrowRightLeft, Activity, Search, ArrowRight, Box, Users } from "lucide-react";

  interface Block {
    height: number; hash: string; timestamp: string;
    validatorName: string; validator: string; transactionCount: number; size: number;
  }
  interface Transaction {
    hash: string; from: string; to: string; amount: string;
    timestamp: string; status: string; type: string;
  }
  interface NetStatus {
    blockHeight: number; tps: number; averageBlockTime: number;
    totalValidators: number; activeValidators: number; totalTransactions: number;
    totalSupply: string; chainId: string;
  }

  function formatNum(n: number): string {
    if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
    if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
    if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
    return n.toLocaleString();
  }

  export default function Home() {
    const [query, setQuery] = useState("");
    const [, navigate] = useLocation();

    const { data: blocks, isLoading: blocksLoading } = useQuery<Block[]>({
      queryKey: ["/api/blocks?limit=6"],
      refetchInterval: 12000,
    });
    const { data: txs, isLoading: txsLoading } = useQuery<Transaction[]>({
      queryKey: ["/api/transactions?limit=6"],
      refetchInterval: 12000,
    });
    const { data: net } = useQuery<NetStatus>({
      queryKey: ["/api/network/status"],
      refetchInterval: 15000,
    });

    const handleSearch = (e: React.FormEvent) => {
      e.preventDefault();
      const q = query.trim();
      if (!q) return;
      if (/^\d+$/.test(q)) navigate(`/block/${q}`);
      else if (q.length === 64 && /^[0-9A-Fa-f]+$/.test(q)) navigate(`/tx/${q}`);
      else navigate(`/address/${q}`);
      setQuery("");
    };

    const blockList = Array.isArray(blocks) ? blocks : [];
    const txList = Array.isArray(txs) ? txs : [];

    return (
      <div className="space-y-5">
        {/* Hero Search */}
        <div className="bg-gradient-to-r from-[#21325b] to-[#2c3e6d] rounded-xl px-6 py-8 text-white relative overflow-hidden">
          <div className="absolute top-3 right-4">
            <span className="px-2.5 py-1 rounded bg-orange-500/20 text-orange-300 text-[11px] font-bold uppercase tracking-wider border border-orange-500/30">Testnet</span>
          </div>
          <h1 className="text-xl font-semibold mb-1">ZerithScan Testnet Explorer</h1>
          <p className="text-blue-200 text-sm mb-4">Explore the Zerith Chain Testnet</p>
          <form onSubmit={handleSearch} className="flex gap-2 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search by Address / Txn Hash / Block Number"
                className="w-full h-[42px] pl-10 pr-4 rounded-lg text-[13px] text-gray-900 bg-white border-0 focus:outline-none focus:ring-2 focus:ring-orange-400"
                data-testid="input-hero-search"
              />
            </div>
            <button type="submit" className="h-[42px] px-5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-colors" data-testid="button-hero-search">
              Search
            </button>
          </form>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={<Layers className="w-5 h-5 text-orange-500" />} label="Block Height" value={net ? formatNum(net.blockHeight) : "..."} />
          <StatCard icon={<ArrowRightLeft className="w-5 h-5 text-orange-500" />} label="Total Transactions" value={net ? formatNum(net.totalTransactions) : "..."} />
          <StatCard icon={<Users className="w-5 h-5 text-orange-500" />} label="Active Validators" value={net ? String(net.activeValidators) : "..."} />
          <StatCard icon={<Activity className="w-5 h-5 text-orange-500" />} label="Avg Block Time" value={net ? net.averageBlockTime.toFixed(1) + "s" : "..."} />
        </div>

        {/* Latest Blocks & Txs side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Latest Blocks */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
              <h2 className="text-[15px] font-semibold text-gray-900">Latest Blocks</h2>
              <Link href="/blocks" className="text-xs text-orange-600 hover:text-orange-800 font-medium flex items-center gap-1" data-testid="link-view-blocks">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {blocksLoading ? (
                Array.from({length: 6}).map((_, i) => <div key={i} className="h-[68px] animate-pulse bg-gray-50" />)
              ) : blockList.length === 0 ? (
                <div className="py-12 text-center text-gray-400 text-sm">No blocks found</div>
              ) : blockList.map(b => (
                <div key={b.height} className="flex items-center gap-4 px-5 py-3 hover:bg-orange-50/30 transition-colors">
                  <div className="w-[42px] h-[42px] rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Box className="w-4.5 h-4.5 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Link href={`/block/${b.height}`} className="text-[13px] font-semibold text-blue-600 hover:text-blue-800" data-testid={`link-block-${b.height}`}>
                        {b.height.toLocaleString()}
                      </Link>
                      <span className="text-[11px] text-gray-400">{timeAgo(b.timestamp)}</span>
                    </div>
                    <div className="text-[12px] text-gray-500 truncate">
                      Validated by <span className="text-gray-700">{b.validatorName || shortHash(b.validator)}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-600">
                      {b.transactionCount} txn{b.transactionCount !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Latest Transactions */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
              <h2 className="text-[15px] font-semibold text-gray-900">Latest Transactions</h2>
              <Link href="/txs" className="text-xs text-orange-600 hover:text-orange-800 font-medium flex items-center gap-1" data-testid="link-view-txs">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {txsLoading ? (
                Array.from({length: 6}).map((_, i) => <div key={i} className="h-[68px] animate-pulse bg-gray-50" />)
              ) : txList.length === 0 ? (
                <div className="py-12 text-center text-gray-400 text-sm">No transactions found</div>
              ) : txList.map((tx, i) => (
                <div key={tx.hash + i} className="flex items-center gap-4 px-5 py-3 hover:bg-orange-50/30 transition-colors">
                  <div className="w-[42px] h-[42px] rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <ArrowRightLeft className="w-4 h-4 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Link href={`/tx/${tx.hash}`} className="text-[13px] font-medium text-blue-600 hover:text-blue-800 font-mono" data-testid={`link-tx-${i}`}>
                        {shortHash(tx.hash)}
                      </Link>
                      <span className="text-[11px] text-gray-400">{timeAgo(tx.timestamp)}</span>
                    </div>
                    <div className="text-[12px] text-gray-500 truncate">
                      From <Link href={`/address/${tx.from}`} className="text-blue-600 hover:underline">{shortHash(tx.from)}</Link>
                      {" "}To <Link href={`/address/${tx.to}`} className="text-blue-600 hover:underline">{shortHash(tx.to)}</Link>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-orange-50 text-orange-700">
                      {formatZTH(tx.amount)} ZTH
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
            {icon}
          </div>
          <div>
            <div className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">{label}</div>
            <div className="text-[17px] font-bold text-gray-900">{value}</div>
          </div>
        </div>
      </div>
    );
  }
  