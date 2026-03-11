export function shortHash(hash: string, chars = 8): string {
  if (!hash) return "";
  if (hash.length <= chars * 2 + 2) return hash;
  return `${hash.slice(0, chars)}…${hash.slice(-chars)}`;
}

export function formatZTH(amount: number | string, decimals = 6): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "0 ZTH";
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M ZTH`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(2)}K ZTH`;
  return `${num.toFixed(decimals)} ZTH`;
}

export function timeAgo(timestamp: string | number): string {
  const now = Date.now();
  const ts = typeof timestamp === "string" ? new Date(timestamp).getTime() : timestamp;
  const diff = Math.floor((now - ts) / 1000);
  if (diff < 5) return "just now";
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function formatNumber(n: number | string): string {
  const num = typeof n === "string" ? parseFloat(n) : n;
  if (isNaN(num)) return "0";
  return num.toLocaleString("en-US");
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function pctColor(pct: number): string {
  if (pct >= 95) return "text-green-400";
  if (pct >= 80) return "text-yellow-400";
  return "text-red-400";
}
