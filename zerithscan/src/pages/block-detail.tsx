import { useQuery } from "@tanstack/react-query";
  import { Link, useParams } from "wouter";
  import { shortHash, formatTimestamp } from "@/lib/chain-utils";
  import { ArrowLeft } from "lucide-react";

  interface Block {
    height: number; hash: string; previousHash: string; timestamp: string;
    validator: string; validatorName: string; transactionCount: number;
    gasUsed: string; gasLimit: string; stateRoot: string; size: number; reward: string;
  }

  export default function BlockDetail() {
    const { identifier } = useParams<{ identifier: string }>();
    const { data: block, isLoading } = useQuery<Block>({
      queryKey: ["/api/block", identifier],
      queryFn: async () => {
        const res = await fetch(`/api/block/${identifier}`);
        if (!res.ok) throw new Error("Block not found");
        return res.json();
      },
    });

    if (isLoading) return <div className="text-center py-12 text-gray-400">Loading...</div>;
    if (!block) return <div className="text-center py-12 text-gray-400">Block not found</div>;

    return (
      <div>
        <div className="flex items-center gap-3 mb-4">
          <Link href="/blocks" className="text-gray-400 hover:text-blue-600"><ArrowLeft className="w-4 h-4" /></Link>
          <h1 className="text-[18px] font-bold text-gray-900">Block #{block.height.toLocaleString()}</h1>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-[13px]">
            <tbody className="divide-y divide-gray-100">
              <Row label="Block Height" value={block.height.toLocaleString()} />
              <Row label="Timestamp" value={formatTimestamp(block.timestamp)} />
              <Row label="Transactions" value={String(block.transactionCount)} link={`/block/${block.height}`} />
              <Row label="Validated By">
                <Link href={`/address/${block.validator}`} className="text-blue-600 hover:text-blue-800" data-testid="link-validator">
                  {block.validatorName} ({shortHash(block.validator)})
                </Link>
              </Row>
              <Row label="Block Hash" value={block.hash} mono />
              <Row label="Parent Hash" value={block.previousHash} mono />
              <Row label="State Root" value={block.stateRoot} mono />
              <Row label="Gas Used" value={parseInt(block.gasUsed).toLocaleString()} />
              <Row label="Gas Limit" value={parseInt(block.gasLimit).toLocaleString()} />
              <Row label="Size" value={`${(block.size / 1024).toFixed(2)} KB`} />
              <Row label="Block Reward" value={`${block.reward} ZTH`} />
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  function Row({ label, value, mono, link, children }: { label: string; value?: string; mono?: boolean; link?: string; children?: React.ReactNode }) {
    return (
      <tr className="hover:bg-blue-50/30">
        <td className="px-5 py-3 text-gray-500 font-medium w-[200px] align-top">{label}:</td>
        <td className={`px-5 py-3 text-gray-900 ${mono ? "font-mono text-[12px] break-all" : ""}`}>
          {children ?? (link ? <Link href={link} className="text-blue-600 hover:text-blue-800">{value}</Link> : value)}
        </td>
      </tr>
    );
  }
  