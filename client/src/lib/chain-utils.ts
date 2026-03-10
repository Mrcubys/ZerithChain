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

export function formatCompact(amount: string | number): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "0";
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(2)}B`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(2)}K`;
  return num.toFixed(2);
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

export function txTypeColor(type: string): string {
  switch (type) {
    case "transfer": return "text-neon-blue";
    case "stake": return "text-neon-purple";
    case "unstake": return "text-orange-400";
    case "contract": return "text-neon-cyan";
    case "delegate": return "text-neon-green";
    default: return "text-muted-foreground";
  }
}

export function txTypeBadgeClass(type: string): string {
  switch (type) {
    case "transfer": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    case "stake": return "bg-purple-500/10 text-purple-400 border-purple-500/20";
    case "unstake": return "bg-orange-500/10 text-orange-400 border-orange-500/20";
    case "contract": return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
    case "delegate": return "bg-green-500/10 text-green-400 border-green-500/20";
    default: return "bg-muted text-muted-foreground";
  }
}

export function statusBadgeClass(status: string): string {
  switch (status) {
    case "success": return "bg-green-500/10 text-green-400 border-green-500/20";
    case "failed": return "bg-red-500/10 text-red-400 border-red-500/20";
    case "pending": return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
    default: return "bg-muted text-muted-foreground";
  }
}

export function regionColor(region: string): string {
  switch (region) {
    case "Americas": return "text-blue-400";
    case "Europe": return "text-purple-400";
    case "Asia": return "text-cyan-400";
    case "Africa": return "text-green-400";
    default: return "text-muted-foreground";
  }
}

export function generateSeedWords(): string[] {
  const wordlist = [
    "abandon", "ability", "able", "about", "above", "absent", "absorb", "abstract",
    "absurd", "abuse", "access", "accident", "account", "accuse", "achieve", "acid",
    "acoustic", "acquire", "across", "action", "actor", "actress", "actual", "adapt",
    "address", "adjust", "admit", "adult", "advance", "advice", "aerobic", "afford",
    "afraid", "again", "agent", "agree", "ahead", "alarm", "album", "alcohol",
    "alert", "alien", "alter", "always", "amateur", "amazing", "among", "amount",
    "amused", "analyst", "anchor", "ancient", "anger", "angle", "angry", "animal",
    "answer", "antenna", "antique", "anxiety", "apart", "appear", "apple", "approve",
    "april", "arctic", "arena", "argue", "armed", "armor", "army", "around",
    "arrange", "arrest", "arrive", "arrow", "aspect", "assault", "asset", "assist",
    "assume", "asthma", "athlete", "atom", "attack", "attend", "attract", "auction",
    "audit", "august", "aunt", "author", "auto", "autumn", "average", "avocado",
    "avoid", "awake", "aware", "away", "awesome", "awful", "awkward", "axis",
  ];
  const result: string[] = [];
  for (let i = 0; i < 24; i++) {
    result.push(wordlist[Math.floor(Math.random() * wordlist.length)]);
  }
  return result;
}

export function generateAddress(seed: string): string {
  let hash = 5381;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) + hash) + seed.charCodeAt(i);
    hash = hash & hash;
  }
  const addr = Math.abs(hash).toString(36).padStart(38, "0").slice(0, 38);
  return "zth1" + addr;
}

export const DEMO_WALLET_ADDRESS = "zth1demo0000000000000000000000000000000000";
export const DEMO_WALLET_BALANCE = "12847.3291";
