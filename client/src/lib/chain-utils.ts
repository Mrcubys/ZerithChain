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

export const DEVELOPER_WALLET_ADDRESS = "zth1dev0000000000000000000000000000000000";
export const DEMO_WALLET_ADDRESS = DEVELOPER_WALLET_ADDRESS;
export const DEVELOPER_WALLET_NAME = "Genesis Dev Wallet";

export const SUPPORTED_NETWORKS = [
  { id: "ethereum",            label: "Ethereum",  symbol: "ETH",  color: "#627EEA" },
  { id: "binance-smart-chain", label: "BNB Chain", symbol: "BNB",  color: "#F3BA2F" },
  { id: "polygon-pos",         label: "Polygon",   symbol: "POL",  color: "#8247E5" },
  { id: "arbitrum-one",        label: "Arbitrum",  symbol: "ETH",  color: "#28A0F0" },
  { id: "optimistic-ethereum", label: "Optimism",  symbol: "ETH",  color: "#FF0420" },
  { id: "base",                label: "Base",      symbol: "ETH",  color: "#0052FF" },
  { id: "avalanche",           label: "Avalanche", symbol: "AVAX", color: "#E84142" },
  { id: "solana",              label: "Solana",    symbol: "SOL",  color: "#9945FF" },
] as const;

export type SupportedNetworkId = (typeof SUPPORTED_NETWORKS)[number]["id"];

export interface CustomToken {
  id: string;
  name: string;
  symbol: string;
  decimals: number;
  contractAddress: string;
  network: string;
  networkLabel: string;
  logoUrl: string | null;
  price: number | null;
  balance: string;
  balanceFormatted: string;
  addedAt: number;
}

const TOKENS_KEY = "zerith-custom-tokens-v1";

export function loadCustomTokens(walletAddress: string): CustomToken[] {
  try {
    const raw = localStorage.getItem(`${TOKENS_KEY}-${walletAddress}`);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveCustomTokens(walletAddress: string, tokens: CustomToken[]): void {
  localStorage.setItem(`${TOKENS_KEY}-${walletAddress}`, JSON.stringify(tokens));
}

function simpleHash(seed: string, rounds = 8): number[] {
  let state = new Array(rounds).fill(0).map((_, i) => 0x6a09e667 + i * 0x9b05688c);
  for (let i = 0; i < seed.length; i++) {
    const c = seed.charCodeAt(i);
    for (let j = 0; j < state.length; j++) {
      state[j] = ((state[j] ^ (state[(j + 1) % rounds] >>> 2)) * 1664525 + c * (j + 1) * 1013904223) | 0;
    }
  }
  for (let round = 0; round < 4; round++) {
    for (let j = 0; j < state.length; j++) {
      state[j] = ((state[j] << 13) | (state[j] >>> 19)) ^ state[(j + 3) % rounds];
    }
  }
  return state.map(v => v >>> 0);
}

export function deriveEvmAddress(zthAddress: string): string {
  const nums = simpleHash("evm:" + zthAddress, 5);
  let hex = nums.map(n => n.toString(16).padStart(8, "0")).join("");
  return "0x" + hex.slice(0, 40);
}

const B58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

export function base58Encode(bytes: Uint8Array): string {
  let leading = 0;
  for (const b of bytes) { if (b !== 0) break; leading++; }
  const digits: number[] = [0];
  for (const byte of bytes) {
    let carry = byte;
    for (let j = 0; j < digits.length; j++) {
      carry += digits[j] << 8;
      digits[j] = carry % 58;
      carry = Math.floor(carry / 58);
    }
    while (carry > 0) { digits.push(carry % 58); carry = Math.floor(carry / 58); }
  }
  return "1".repeat(leading) + digits.reverse().map(d => B58_ALPHABET[d]).join("");
}

export function deriveSolanaAddress(zthAddress: string): string {
  const nums = simpleHash("sol:" + zthAddress, 8);
  const bytes = new Uint8Array(32);
  for (let i = 0; i < 8; i++) {
    const v = nums[i];
    bytes[i * 4]     = (v >>> 24) & 0xff;
    bytes[i * 4 + 1] = (v >>> 16) & 0xff;
    bytes[i * 4 + 2] = (v >>> 8)  & 0xff;
    bytes[i * 4 + 3] = v & 0xff;
  }
  return base58Encode(bytes);
}

export function formatTokenBalance(rawBalance: string, decimals: number): string {
  try {
    const n = BigInt(rawBalance);
    const d = BigInt(10) ** BigInt(decimals);
    const whole = n / d;
    const frac = n % d;
    if (frac === 0n) return whole.toString();
    const fracStr = frac.toString().padStart(decimals, "0").replace(/0+$/, "").slice(0, 6);
    return `${whole}.${fracStr}`;
  } catch { return rawBalance; }
}
