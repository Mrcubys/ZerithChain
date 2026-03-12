import { useQuery } from "@tanstack/react-query";
  import { Link } from "wouter";
  import { shortHash, formatZTH, timeAgo } from "@/lib/chain-utils";

  interface Transaction {
    hash: string; from: string; to: string; amount: string;
    timestamp: string; status: string; type: string; fee: string; blockHeight: number;
  }

  export default function Txs() {
    const { data: txs, isLoading } = useQuery<Transaction[]>({
      queryKey: ["/api/transactions?limit=25"],
      refetchInterval: 12000,
    });

    const list = Array.isArray(txs) ? txs : [];

    return (
      <div>
        <h1 className="text-[18px] font-bold text-gray-900 mb-4">Transactions</h1>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase text-[11px] tracking-wider">
                  <th className="text-left px-4 py-3 font-semibold">Txn Hash</th>
                  <th className="text-left px-4 py-3 font-semibold">Block</th>
                  <th className="text-left px-4 py-3 font-semibold">Age</th>
                  <th className="text-left px-4 py-3 font-semibold">From</th>
                  <th className="text-left px-4 py-3 font-semibold">To</th>
                  <th className="text-right px-4 py-3 font-semibold">Value</th>
                  <th className="text-right px-4 py-3 font-semibold">Txn Fee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  Array.from({length: 10}).map((_, i) => (
                    <tr key={i}><td colSpan={7} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td></tr>
                  ))
                ) : list.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-12 text-gray-400">No transactions found</td></tr>
                ) : list.map((tx, i) => (
                  <tr key={tx.hash + i} className="hover:bg-blue-50/40 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/tx/${tx.hash}`} className="text-blue-600 hover:text-blue-800 font-mono" data-testid={`link-tx-${i}`}>
                        {shortHash(tx.hash, 10)}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/block/${tx.blockHeight}`} className="text-blue-600 hover:text-blue-800" data-testid={`link-block-${i}`}>
                        {tx.blockHeight?.toLocaleString() ?? "—"}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{timeAgo(tx.timestamp)}</td>
                    <td className="px-4 py-3">
                      <Link href={`/address/${tx.from}`} className="text-blue-600 hover:text-blue-800 font-mono text-[12px]" data-testid={`link-from-${i}`}>
                        {shortHash(tx.from)}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/address/${tx.to}`} className="text-blue-600 hover:text-blue-800 font-mono text-[12px]" data-testid={`link-to-${i}`}>
                        {shortHash(tx.to)}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-900 font-medium">{formatZTH(tx.amount)}</td>
                    <td className="px-4 py-3 text-right text-gray-400 text-[12px]">{tx.fee ? formatZTH(tx.fee) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
  