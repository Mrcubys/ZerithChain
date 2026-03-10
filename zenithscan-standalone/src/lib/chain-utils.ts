export function shortHash(hash: string, chars = 8): string {
  if (!hash) return "";
  if (hash.length <= chars * 2 + 3) return hash;
  return `${hash.slice(0, chars)}...${hash.slice(-chars)}`;
}

export function shortAddress(address: string, chars = 6): string {
  if (!address) return "";
  if (address.startsWith("zth1")) {
    return `${address.slice(0, chars + 4)}...${address.slice(-4)}`;
  }
  return `${address.slice(0, chars)}...${address.slice(-4)}`;
}

export function formatZTH(amount: string | number, decimals = 4): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "0.0000 ZTH";
  return `${num.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })} ZTH`;
}

export function timeAgo(timestamp: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 5) return "just now";
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function formatTimestamp(timestamp: string): string {
  return new Date(timestamp).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${bytes} B`;
}

export function txTypeBadgeClass(type: string): string {
  switch (type) {
    case "transfer": return "bg-secondary text-secondary-foreground border-border/50";
    case "stake": return "bg-secondary text-blue-400 border-border/50";
    case "unstake": return "bg-secondary text-orange-400 border-border/50";
    case "contract": return "bg-secondary text-purple-400 border-border/50";
    case "delegate": return "bg-secondary text-green-400 border-border/50";
    default: return "bg-secondary text-muted-foreground border-border/50";
  }
}

export function statusBadgeClass(status: string): string {
  switch (status) {
    case "success": return "bg-green-500/10 text-green-400 border-green-500/20";
    case "failed": return "bg-red-500/10 text-red-400 border-red-500/20";
    case "pending": return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
    default: return "bg-secondary text-muted-foreground border-border/50";
  }
}

export function regionColor(region: string): string {
  switch (region) {
    case "Americas": return "text-blue-400";
    case "Europe": return "text-purple-400";
    case "Asia": return "text-orange-400";
    case "Africa": return "text-green-400";
    default: return "text-muted-foreground";
  }
}
