import { useQuery } from "@tanstack/react-query";
  import { Link, useParams } from "wouter";
  import { shortHash, formatZTH, formatTimestamp } from "@/lib/chain-utils";
  import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";

  interface Transaction {
    hash: string; blockHeight: number; from: string; to: string;
    amount: string; gasFee: string; nonce: number; timestamp: string;
    status: string; type: string;
  }

  export default function TxDetail() {
    const { hash } = useParams<{ hash: string }>();
    const { data: tx, isLoading } = useQuery<Transaction>({
      queryKey: ["/api/transaction", hash],
      queryFn: async () => {
        const res = await fetch(`/api/transaction/${hash}`);
        if (!res.ok) throw new Error("Transaction not found");
        return res.json();
      },
    });

    if (isLoading) return <div className="text-center py-12 text-gray-400">Loading...</div>;
    if (!tx) return <div className="text-center py-12 text-gray-400">Transaction not found</div>;

    return (
      <div>
        <div className="flex items-center gap-3 mb-4">
          <Link href="/txs" className="text-gray-400 hover:text-blue-600"><ArrowLeft className="w-4 h-4" /></Link>
          <h1 className="text-[18px] font-bold text-gray-900">Transaction Details</h1>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-[13px]">
            <tbody className="divide-y divide-gray-100">
              <Row label="Transaction Hash" value={tx.hash} mono />
              <Row label="Status">
                {tx.status === "success" ? (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-green-50 text-green-700 text-[12px] font-medium">
                    <CheckCircle className="w-3.5 h-3.5" /> Success
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-50 text-red-700 text-[12px] font-medium">
                    <XCircle className="w-3.5 h-3.5" /> Failed
                  </span>
                )}
              </Row>
              <Row label="Block">
                <Link href={`/block/${tx.blockHeight}`} className="text-blue-600 hover:text-blue-800" data-testid="link-block">
                  {tx.blockHeight.toLocaleString()}
                </Link>
              </Row>
              <Row label="Timestamp" value={formatTimestamp(tx.timestamp)} />
              <Row label="From">
                <Link href={`/address/${tx.from}`} className="text-blue-600 hover:text-blue-800 font-mono text-[12px]" data-testid="link-from">{tx.from}</Link>
              </Row>
              <Row label="To">
                <Link href={`/address/${tx.to}`} className="text-blue-600 hover:text-blue-800 font-mono text-[12px]" data-testid="link-to">{tx.to}</Link>
              </Row>
              <Row label="Value" value={formatZTH(tx.amount)} />
              <Row label="Transaction Fee" value={tx.gasFee ? formatZTH(tx.gasFee) : "0 ZTH"} />
              <Row label="Type">
                <span className="inline-block px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-[12px] font-medium capitalize">{tx.type}</span>
              </Row>
              <Row label="Nonce" value={String(tx.nonce)} />
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  function Row({ label, value, mono, children }: { label: string; value?: string; mono?: boolean; children?: React.ReactNode }) {
    return (
      <tr className="hover:bg-blue-50/30">
        <td className="px-5 py-3 text-gray-500 font-medium w-[200px] align-top">{label}:</td>
        <td className={`px-5 py-3 text-gray-900 ${mono ? "font-mono text-[12px] break-all" : ""}`}>{children ?? value}</td>
      </tr>
    );
  }
  