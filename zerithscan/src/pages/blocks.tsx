import { useQuery } from "@tanstack/react-query";
  import { Link } from "wouter";
  import { shortHash, timeAgo } from "@/lib/chain-utils";
  import { Box } from "lucide-react";

  interface Block {
    height: number; hash: string; timestamp: string;
    validatorName: string; validator: string; transactionCount: number; size: number;
  }

  export default function Blocks() {
    const { data: blocks, isLoading } = useQuery<Block[]>({
      queryKey: ["/api/blocks?limit=25"],
      refetchInterval: 12000,
    });

    const list = Array.isArray(blocks) ? blocks : [];

    return (
      <div>
        <h1 className="text-[18px] font-bold text-gray-900 mb-4">Blocks</h1>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase text-[11px] tracking-wider">
                  <th className="text-left px-4 py-3 font-semibold">Block</th>
                  <th className="text-left px-4 py-3 font-semibold">Age</th>
                  <th className="text-left px-4 py-3 font-semibold">Txn</th>
                  <th className="text-left px-4 py-3 font-semibold">Validator</th>
                  <th className="text-left px-4 py-3 font-semibold">Block Hash</th>
                  <th className="text-right px-4 py-3 font-semibold">Size</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  Array.from({length: 10}).map((_, i) => (
                    <tr key={i}><td colSpan={6} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td></tr>
                  ))
                ) : list.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-gray-400">No blocks found</td></tr>
                ) : list.map(b => (
                  <tr key={b.height} className="hover:bg-blue-50/40 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/block/${b.height}`} className="text-blue-600 hover:text-blue-800 font-medium" data-testid={`link-block-${b.height}`}>
                        {b.height.toLocaleString()}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{timeAgo(b.timestamp)}</td>
                    <td className="px-4 py-3">
                      <span className="text-blue-600">{b.transactionCount}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/address/${b.validator}`} className="text-blue-600 hover:text-blue-800" data-testid={`link-validator-${b.height}`}>
                        {b.validatorName || shortHash(b.validator)}
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-mono text-gray-500 text-[12px]">{shortHash(b.hash, 10)}</td>
                    <td className="px-4 py-3 text-right text-gray-500">{(b.size / 1024).toFixed(2)} KB</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
  