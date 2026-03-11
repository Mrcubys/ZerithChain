import type { Express } from "express";
import { createServer, type Server } from "http";
import { blockchainStorage } from "./storage";
import { sendTransactionSchema } from "@shared/schema";

// ── Helper: resolve network from URL prefix or query param ─────────────────
function resolveNetwork(prefix: "mainnet" | "testnet" | null, query: Record<string, string>): string {
  if (prefix) return prefix;
  return (query.network as string) === "testnet" ? "testnet" : "mainnet";
}

// ── EVM / Solana RPC helpers ───────────────────────────────────────────────

const EVM_RPCS: Record<string, string> = {
  "ethereum": "https://eth.llamarpc.com",
  "binance-smart-chain": "https://bsc-dataseed.binance.org/",
  "polygon-pos": "https://polygon-rpc.com",
  "arbitrum-one": "https://arb1.arbitrum.io/rpc",
  "optimistic-ethereum": "https://mainnet.optimism.io",
  "base": "https://mainnet.base.org",
  "avalanche": "https://api.avax.network/ext/bc/C/rpc",
};

const NATIVE_SYMBOLS: Record<string, string> = {
  "ethereum": "ETH",
  "binance-smart-chain": "BNB",
  "polygon-pos": "MATIC",
  "arbitrum-one": "ETH",
  "optimistic-ethereum": "ETH",
  "base": "ETH",
  "avalanche": "AVAX",
};

const NETWORK_LABELS: Record<string, string> = {
  "ethereum": "Ethereum",
  "binance-smart-chain": "BNB Chain",
  "polygon-pos": "Polygon",
  "arbitrum-one": "Arbitrum",
  "optimistic-ethereum": "Optimism",
  "base": "Base",
  "avalanche": "Avalanche",
};

function abiDecodeString(hex: string): string {
  try {
    const data = hex.startsWith("0x") ? hex.slice(2) : hex;
    if (data.length < 128) return "";
    const firstWord = parseInt(data.slice(0, 64), 16);
    let offset = firstWord === 32 ? 64 : 0;
    const length = parseInt(data.slice(offset, offset + 64), 16);
    if (isNaN(length) || length <= 0 || length > 512) return "";
    const strHex = data.slice(offset + 64, offset + 64 + length * 2);
    let result = "";
    for (let i = 0; i < strHex.length; i += 2) {
      const code = parseInt(strHex.slice(i, i + 2), 16);
      if (code > 0) result += String.fromCharCode(code);
    }
    return result.trim();
  } catch { return ""; }
}

function abiDecodeUint(hex: string): number {
  try {
    const data = hex.startsWith("0x") ? hex.slice(2) : hex;
    return parseInt(data.slice(-64), 16);
  } catch { return 18; }
}

async function rpcEthCall(rpc: string, contract: string, selector: string): Promise<string> {
  const r = await fetch(rpc, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", method: "eth_call", id: 1, params: [{ to: contract, data: selector }, "latest"] }),
  });
  const d = await r.json() as Record<string, unknown>;
  return String(d.result ?? "0x");
}

async function lookupErc20ViaRpc(rpc: string, contract: string): Promise<{ name: string; symbol: string; decimals: number } | null> {
  try {
    const [nameHex, symbolHex, decimalsHex] = await Promise.all([
      rpcEthCall(rpc, contract, "0x06fdde03"),
      rpcEthCall(rpc, contract, "0x95d89b41"),
      rpcEthCall(rpc, contract, "0x313ce567"),
    ]);
    const name = abiDecodeString(nameHex);
    const symbol = abiDecodeString(symbolHex);
    const decimals = abiDecodeUint(decimalsHex);
    if (!name && !symbol) return null;
    return { name: name || symbol || "Unknown Token", symbol: (symbol || name || "???").toUpperCase(), decimals: isNaN(decimals) ? 18 : decimals };
  } catch { return null; }
}

// ── Register all routes ────────────────────────────────────────────────────

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {

  // ── Factory: register identical routes for mainnet and testnet prefixes ──

  function registerChainRoutes(prefix: "mainnet" | "testnet" | null) {
    const base = prefix ? `/api/${prefix}` : "/api";

    // Network status
    app.get(`${base}/network/status`, async (req, res) => {
      try {
        const network = resolveNetwork(prefix, req.query as Record<string, string>);
        res.json(await blockchainStorage.getNetworkStatus(network));
      } catch (e) { res.status(500).json({ error: String(e) }); }
    });

    // Blocks
    app.get(`${base}/blocks`, async (req, res) => {
      try {
        const network = resolveNetwork(prefix, req.query as Record<string, string>);
        const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
        res.json(await blockchainStorage.getLatestBlocks(network, limit));
      } catch (e) { res.status(500).json({ error: String(e) }); }
    });

    app.get(`${base}/blocks/:identifier`, async (req, res) => {
      try {
        const network = resolveNetwork(prefix, req.query as Record<string, string>);
        const { identifier } = req.params;
        let block;
        if (/^[0-9A-Fa-f]{64}$/.test(identifier)) {
          block = await blockchainStorage.getBlockByHash(network, identifier.toUpperCase());
        } else {
          const height = parseInt(identifier);
          if (!isNaN(height)) block = await blockchainStorage.getBlock(network, height);
        }
        if (!block) return res.status(404).json({ error: "Block not found" });
        const transactions = await blockchainStorage.getTransactionsByBlock(network, block.height);
        res.json({ block, transactions });
      } catch (e) { res.status(500).json({ error: String(e) }); }
    });

    // Transactions
    app.get(`${base}/transactions`, async (req, res) => {
      try {
        const network = resolveNetwork(prefix, req.query as Record<string, string>);
        const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
        res.json(await blockchainStorage.getLatestTransactions(network, limit));
      } catch (e) { res.status(500).json({ error: String(e) }); }
    });

    app.get(`${base}/transactions/:hash`, async (req, res) => {
      try {
        const network = resolveNetwork(prefix, req.query as Record<string, string>);
        const tx = await blockchainStorage.getTransaction(network, req.params.hash.toUpperCase());
        if (!tx) return res.status(404).json({ error: "Transaction not found" });
        res.json(tx);
      } catch (e) { res.status(500).json({ error: String(e) }); }
    });

    // Addresses
    app.get(`${base}/addresses/:address`, async (req, res) => {
      try {
        const network = resolveNetwork(prefix, req.query as Record<string, string>);
        res.json(await blockchainStorage.getAddressInfo(network, req.params.address));
      } catch (e) { res.status(500).json({ error: String(e) }); }
    });

    app.get(`${base}/address/:address`, async (req, res) => {
      try {
        const network = resolveNetwork(prefix, req.query as Record<string, string>);
        res.json(await blockchainStorage.getAddressInfo(network, req.params.address));
      } catch (e) { res.status(500).json({ error: String(e) }); }
    });

    // Validators
    app.get(`${base}/validators`, async (req, res) => {
      try {
        const network = resolveNetwork(prefix, req.query as Record<string, string>);
        res.json(await blockchainStorage.getValidators(network));
      } catch (e) { res.status(500).json({ error: String(e) }); }
    });

    app.get(`${base}/validators/:address`, async (req, res) => {
      try {
        const network = resolveNetwork(prefix, req.query as Record<string, string>);
        const v = await blockchainStorage.getValidator(network, req.params.address);
        if (!v) return res.status(404).json({ error: "Validator not found" });
        res.json(v);
      } catch (e) { res.status(500).json({ error: String(e) }); }
    });

    // Wallet
    app.get(`${base}/wallet`, async (req, res) => {
      try {
        const network = resolveNetwork(prefix, req.query as Record<string, string>);
        const address = req.query.address as string;
        if (!address) return res.status(400).json({ error: "Address required" });
        const info = await blockchainStorage.getAddressInfo(network, address);
        res.json({ ...info, network });
      } catch (e) { res.status(500).json({ error: String(e) }); }
    });

    app.get(`${base}/wallet/:address`, async (req, res) => {
      try {
        const network = resolveNetwork(prefix, req.query as Record<string, string>);
        const info = await blockchainStorage.getAddressInfo(network, req.params.address);
        res.json({ ...info, network });
      } catch (e) { res.status(500).json({ error: String(e) }); }
    });

    app.post(`${base}/wallet/send`, async (req, res) => {
      try {
        const result = sendTransactionSchema.safeParse(req.body);
        if (!result.success) return res.status(400).json({ error: "Invalid request", details: result.error });
        const { from, to, amount } = result.data;
        const network = prefix ?? (result.data.network === "testnet" ? "testnet" : "mainnet");

        if (!to.startsWith("zth1") || to.length < 10) return res.status(400).json({ error: "Invalid recipient address" });
        if (parseFloat(amount) <= 0) return res.status(400).json({ error: "Amount must be greater than 0" });

        const tx = await blockchainStorage.submitTransaction(from, to, amount, network);
        res.json(tx);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        res.status(400).json({ error: msg });
      }
    });

    // Search
    app.get(`${base}/search`, async (req, res) => {
      try {
        const network = resolveNetwork(prefix, req.query as Record<string, string>);
        const query = (req.query.q as string) || "";
        if (!query) return res.status(400).json({ error: "Query required" });
        res.json(await blockchainStorage.search(network, query));
      } catch (e) { res.status(500).json({ error: String(e) }); }
    });

    // Genesis
    app.get(`${base}/genesis`, (req, res) => {
      const network = resolveNetwork(prefix, req.query as Record<string, string>);
      res.json(blockchainStorage.getGenesisConfig(network));
    });
  }

  // Register routes for /api/mainnet/*, /api/testnet/*, and /api/* (default mainnet)
  registerChainRoutes("mainnet");
  registerChainRoutes("testnet");
  registerChainRoutes(null);

  // ── Native ETH balance ─────────────────────────────────────────────────

  app.get("/api/eth/balance/:address", async (req, res) => {
    const { address } = req.params;
    const evmChain = (req.query.chain as string) || "ethereum";
    const rpc = EVM_RPCS[evmChain];
    if (!rpc) return res.status(400).json({ error: "Unsupported chain" });

    try {
      const body = {
        jsonrpc: "2.0", method: "eth_getBalance", id: 1,
        params: [address, "latest"],
      };
      const r = await fetch(rpc, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = await r.json() as Record<string, unknown>;
      const hex = String(d.result ?? "0x0");
      const wei = BigInt(hex === "0x" ? "0" : hex);
      const balance = (Number(wei) / 1e18).toFixed(6);
      return res.json({
        address,
        chain: evmChain,
        chainLabel: NETWORK_LABELS[evmChain] ?? evmChain,
        symbol: NATIVE_SYMBOLS[evmChain] ?? "ETH",
        balance,
        balanceWei: wei.toString(),
      });
    } catch (err) {
      return res.status(500).json({ error: String(err) });
    }
  });

  // ── Native SOL balance ─────────────────────────────────────────────────

  app.get("/api/sol/balance/:address", async (req, res) => {
    const { address } = req.params;
    try {
      const body = {
        jsonrpc: "2.0", id: 1,
        method: "getBalance",
        params: [address],
      };
      const r = await fetch("https://api.mainnet-beta.solana.com", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = await r.json() as Record<string, unknown>;
      const lamports = (d.result as Record<string, unknown>)?.value ?? 0;
      const balance = (Number(lamports) / 1e9).toFixed(6);
      return res.json({ address, chain: "solana", chainLabel: "Solana", symbol: "SOL", balance });
    } catch (err) {
      return res.status(500).json({ error: String(err) });
    }
  });

  // ── ERC-20 token lookup ────────────────────────────────────────────────

  app.get("/api/token/lookup", async (req, res) => {
    const { network, contract } = req.query as Record<string, string>;
    if (!network || !contract) return res.status(400).json({ error: "Missing network or contract" });

    try {
      if (network === "solana") {
        const r = await fetch(`https://tokens.jup.ag/token/${contract}`, { headers: { "Accept": "application/json" } });
        if (!r.ok) return res.status(404).json({ error: "Token not found on Solana." });
        const d = await r.json() as Record<string, unknown>;
        return res.json({
          name: d.name, symbol: String(d.symbol ?? "").toUpperCase(), decimals: d.decimals ?? 9,
          logoUrl: d.logoURI ?? null, price: null, contractAddress: contract, network: "solana", networkLabel: "Solana",
        });
      }
      const rpc = EVM_RPCS[network];
      const cgUrl = `https://api.coingecko.com/api/v3/coins/${network}/contract/${encodeURIComponent(contract)}`;
      const cgResp = await fetch(cgUrl, { headers: { "Accept": "application/json" } });
      if (cgResp.ok) {
        const d = await cgResp.json() as Record<string, unknown>;
        const platforms = d.detail_platforms as Record<string, Record<string, unknown>> | undefined;
        const decimals = (platforms?.[network]?.decimal_place as number) ?? 18;
        const img = d.image as Record<string, string> | undefined;
        const mkt = d.market_data as Record<string, Record<string, number>> | undefined;
        return res.json({
          name: d.name, symbol: String(d.symbol ?? "").toUpperCase(), decimals,
          logoUrl: img?.large ?? img?.small ?? img?.thumb ?? null,
          price: mkt?.current_price?.usd ?? null,
          contractAddress: contract, network, networkLabel: NETWORK_LABELS[network] ?? network,
        });
      }
      if (rpc) {
        const erc20 = await lookupErc20ViaRpc(rpc, contract);
        if (erc20) return res.json({ ...erc20, logoUrl: null, price: null, contractAddress: contract, network, networkLabel: NETWORK_LABELS[network] ?? network });
      }
      return res.status(404).json({ error: `Token not found on ${NETWORK_LABELS[network] ?? network}.` });
    } catch (err) {
      return res.status(500).json({ error: `Lookup failed: ${err instanceof Error ? err.message : String(err)}` });
    }
  });

  // ── ERC-20 token balance ───────────────────────────────────────────────

  app.get("/api/token/balance", async (req, res) => {
    const { network, contract, wallet } = req.query as Record<string, string>;
    if (!network || !contract || !wallet) return res.status(400).json({ error: "Missing params" });
    try {
      if (network === "solana") {
        const body = { jsonrpc: "2.0", id: 1, method: "getTokenAccountsByOwner", params: [wallet, { mint: contract }, { encoding: "jsonParsed" }] };
        const r = await fetch("https://api.mainnet-beta.solana.com", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        const data = await r.json() as Record<string, unknown>;
        const result = data.result as Record<string, unknown> | undefined;
        const value = result?.value as Array<Record<string, unknown>> | undefined;
        const amount = (value?.[0]?.account as Record<string, unknown>)?.data as Record<string, unknown>;
        const parsed = amount?.parsed as Record<string, Record<string, unknown>> | undefined;
        const tokenAmount = (parsed?.info as Record<string, unknown> | undefined)?.tokenAmount as Record<string, unknown> | undefined;
        const balance = String(tokenAmount?.uiAmount ?? "0");
        return res.json({ balance });
      }
      const rpc = EVM_RPCS[network];
      if (!rpc) return res.status(400).json({ error: "Unsupported network" });
      const walletHex = wallet.startsWith("0x") ? wallet.slice(2) : wallet;
      const data = "0x70a08231" + "000000000000000000000000" + walletHex.padStart(40, "0");
      const body = { jsonrpc: "2.0", method: "eth_call", id: 1, params: [{ to: contract, data }, "latest"] };
      const r = await fetch(rpc, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const resp = await r.json() as Record<string, unknown>;
      const hex = String(resp.result ?? "0x0");
      const raw = BigInt(hex === "0x" ? "0" : hex);
      return res.json({ balance: raw.toString(), balanceRaw: hex });
    } catch (err) {
      return res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
    }
  });

  // ── Proxy ──────────────────────────────────────────────────────────────

  app.get("/api/proxy", async (req, res) => {
    const targetUrl = req.query.url as string;
    if (!targetUrl) return res.status(400).send("Missing url");
    let parsedUrl: URL;
    try { parsedUrl = new URL(targetUrl); } catch { return res.status(400).send("Invalid URL"); }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      const upstream = await fetch(targetUrl, {
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
          "Accept-Encoding": "identity",
          "Cache-Control": "no-cache",
        },
        redirect: "follow",
      });
      clearTimeout(timeout);
      const contentType = upstream.headers.get("content-type") ?? "application/octet-stream";
      res.removeHeader("X-Frame-Options");
      res.setHeader("Content-Type", contentType);
      if (contentType.includes("text/html")) {
        let html = await upstream.text();
        const interceptor = `<base href="${parsedUrl.origin}/"><script>(function(){var PROXY='/api/proxy?url=';function abs(href){if(!href)return null;if(href.startsWith('javascript:')||href.startsWith('mailto:')||href.startsWith('#'))return null;try{return new URL(href,'${targetUrl}').href;}catch(e){return null;}}function nav(url){if(!url)return;window.top.postMessage({zerithBrowser:true,type:'NAVIGATE',url:url},'*');}document.addEventListener('click',function(e){var a=e.target&&e.target.closest?e.target.closest('a[href]'):null;if(!a)return;var u=abs(a.getAttribute('href'));if(u){e.preventDefault();e.stopPropagation();nav(u);}},true);})();<\/script>`;
        if (html.includes("<head>")) html = html.replace("<head>", "<head>" + interceptor);
        else html = interceptor + html;
        res.send(html);
      } else {
        res.send(Buffer.from(await upstream.arrayBuffer()));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(502).send(`<html><body style="font-family:sans-serif;padding:2rem"><h2>Cannot reach this page</h2><p>${parsedUrl.hostname} — ${msg}</p></body></html>`);
    }
  });

  return httpServer;
}
