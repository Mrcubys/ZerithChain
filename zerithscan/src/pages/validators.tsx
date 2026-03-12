import { useQuery } from "@tanstack/react-query";
  import { Link } from "wouter";
  import { shortHash } from "@/lib/chain-utils";

  interface Validator {
    address: string; name: string; region: string; stake: string;
    commission: number; uptime: number; blocksProduced: number;
    status: string; rank: number; latency: number;
  }

  export default function Validators() {
    const { data: validators, isLoading } = useQuery<Validator[]>({
      queryKey: ["/api/validators"],
      refetchInterval: 30000,
    });

    const list = Array.isArray(validators) ? validators : [];

    return (
      <div>
        <h1 className="text-[18px] font-bold text-gray-900 mb-1">Validators</h1>
        <p className="text-[13px] text-gray-500 mb-4">{list.filter(v => v.status === "active").length} active of {list.length} total validators</p>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase text-[11px] tracking-wider">
                  <th className="text-left px-4 py-3 font-semibold w-12">#</th>
                  <th className="text-left px-4 py-3 font-semibold">Validator</th>
                  <th className="text-left px-4 py-3 font-semibold">Status</th>
                  <th className="text-right px-4 py-3 font-semibold">Stake (ZTH)</th>
                  <th className="text-right px-4 py-3 font-semibold">Commission</th>
                  <th className="text-right px-4 py-3 font-semibold">Uptime</th>
                  <th className="text-right px-4 py-3 font-semibold">Blocks</th>
                  <th className="text-left px-4 py-3 font-semibold">Region</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  Array.from({length: 10}).map((_, i) => (
                    <tr key={i}><td colSpan={8} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td></tr>
                  ))
                ) : list.map(v => (
                  <tr key={v.address} className="hover:bg-blue-50/40 transition-colors">
                    <td className="px-4 py-3 text-gray-400 font-medium">{v.rank}</td>
                    <td className="px-4 py-3">
                      <Link href={`/address/${v.address}`} className="text-blue-600 hover:text-blue-800 font-medium" data-testid={`link-validator-${v.rank}`}>
                        {v.name}
                      </Link>
                      <div className="text-[11px] text-gray-400 font-mono">{shortHash(v.address)}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                        v.status === "active" ? "bg-green-50 text-green-700" :
                        v.status === "jailed" ? "bg-red-50 text-red-700" : "bg-gray-100 text-gray-500"
                      }`}>{v.status}</span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-900 font-medium">{parseFloat(v.stake).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-gray-500">{v.commission}%</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`${v.uptime >= 99.5 ? "text-green-600" : v.uptime >= 98 ? "text-yellow-600" : "text-red-600"}`}>
                        {v.uptime.toFixed(2)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500">{v.blocksProduced.toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-500">{v.region}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
  