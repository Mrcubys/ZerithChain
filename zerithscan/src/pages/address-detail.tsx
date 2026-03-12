import { useQuery } from "@tanstack/react-query";
  import { Link, useParams } from "wouter";
  import { shortHash, formatZTH, timeAgo } from "@/lib/chain-utils";
  import { ArrowLeft, Copy } from "lucide-react";
  import { useState } from "react";

  interface AddressInfo {
    address: string; balance: string; stakedBalance: string; nonce: number;
    walletName: string | null; isValidator: boolean; totalSent: string; totalReceived: string;
    transactions: Array<{
      hash: string; from: string; to: string; amount: string;
      timestamp: string; status: string; type: string; blockHeight: number;
    }>;
  }

  export default function AddressDetail() {
    const { address } = useParams<{ address: string }>();
    const [copied, setCopied] = useState(false);

    const { data: info, isLoading } = useQuery<AddressInfo>({
      queryKey: ["/api/address", address],
      queryFn: async () => {
        const res = await fetch(`/api/address/${address}`);
        if (!res.ok) throw new Error("Address not found");
        return res.json();
      },
    });

    const copyAddr = () => {
      navigator.clipboard.writeText(address || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    if (isLoading) return <div className="text-center py-12 text-gray-400">Loading...</div>;
    if (!info) return <div className="text-center py-12 text-gray-400">Address not found</div>;

    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-gray-400 hover:text-blue-600"><ArrowLeft className="w-4 h-4" /></Link>
          <h1 className="text-[18px] font-bold text-gray-900">Address</h1>
          <span className="text-[13px] font-mono text-gray-600">{address}</span>
          <button onClick={copyAddr} className="text-gray-400 hover:text-blue-600" data-testid="button-copy">
            <Copy className="w-3.5 h-3.5" />
          </button>
          {copied && <span className="text-[11px] text-green-600">Copied!</span>}
        </div>

        {/* Overview cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4">
            <div className="text-[11px] text-gray-500 uppercase tracking-wider mb-1">Balance</div>
            <div className="text-[17px] font-bold text-gray-900">{formatZTH(info.balance)}</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4">
            <div className="text-[11px] text-gray-500 uppercase tracking-wider mb-1">Staked</div>
            <div className="text-[17px] font-bold text-gray-900">{formatZTH(info.stakedBalance)}</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4">
            <div className="text-[11px] text-gray-500 uppercase tracking-wider mb-1">Transactions</div>
            <div className="text-[17px] font-bold text-gray-900">{info.transactions.length}</div>
          </div>
        </div>

        {/* Transactions table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100">
            <h2 className="text-[15px] font-semibold text-gray-900">Transactions</h2>
          </div>
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
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {info.transactions.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-gray-400">No transactions</td></tr>
                ) : info.transactions.map((tx, i) => {
                  const isOutgoing = tx.from === info.address;
                  return (
                    <tr key={tx.hash + i} className="hover:bg-blue-50/40 transition-colors">
                      <td className="px-4 py-3">
                        <Link href={`/tx/${tx.hash}`} className="text-blue-600 hover:text-blue-800 font-mono" data-testid={`link-tx-${i}`}>
                          {shortHash(tx.hash, 10)}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/block/${tx.blockHeight}`} className="text-blue-600 hover:text-blue-800">
                          {tx.blockHeight.toLocaleString()}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{timeAgo(tx.timestamp)}</td>
                      <td className="px-4 py-3">
                        {tx.from === info.address ? (
                          <span className="font-mono text-[12px] text-gray-700">{shortHash(tx.from)}</span>
                        ) : (
                          <Link href={`/address/${tx.from}`} className="text-blue-600 hover:text-blue-800 font-mono text-[12px]">{shortHash(tx.from)}</Link>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold mr-1 ${isOutgoing ? "bg-orange-50 text-orange-600" : "bg-green-50 text-green-600"}`}>
                          {isOutgoing ? "OUT" : "IN"}
                        </span>
                        {tx.to === info.address ? (
                          <span className="font-mono text-[12px] text-gray-700">{shortHash(tx.to)}</span>
                        ) : (
                          <Link href={`/address/${tx.to}`} className="text-blue-600 hover:text-blue-800 font-mono text-[12px]">{shortHash(tx.to)}</Link>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-900 font-medium">{formatZTH(tx.amount)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
  