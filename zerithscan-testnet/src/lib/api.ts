const BASE = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/\/$/, "");
  const NETWORK_PARAM = "network=testnet";

  export function apiUrl(path: string): string {
    const sep = path.includes("?") ? "&" : "?";
    return `${BASE}${path}${sep}${NETWORK_PARAM}`;
  }

  export async function apiFetch<T>(path: string): Promise<T> {
    const res = await fetch(apiUrl(path));
    if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
    return res.json();
  }
  