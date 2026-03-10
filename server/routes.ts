import type { Express } from "express";
import { createServer, type Server } from "http";
import { blockchainStorage } from "./storage";
import { sendTransactionSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get("/api/network/status", (req, res) => {
    const network = (req.query.network as string) || "mainnet";
    res.json(blockchainStorage.getNetworkStatus(network));
  });

  app.get("/api/blocks", (req, res) => {
    const limit = parseInt(req.query.limit as string) || 20;
    res.json(blockchainStorage.getLatestBlocks(limit));
  });

  app.get("/api/blocks/:identifier", (req, res) => {
    const { identifier } = req.params;
    let block;
    if (identifier.startsWith("0x")) {
      block = blockchainStorage.getBlockByHash(identifier);
    } else {
      const height = parseInt(identifier);
      if (!isNaN(height)) {
        block = blockchainStorage.getBlock(height);
      }
    }
    if (!block) {
      return res.status(404).json({ error: "Block not found" });
    }
    const transactions = blockchainStorage.getTransactionsByBlock(block.height);
    res.json({ block, transactions });
  });

  app.get("/api/transactions", (req, res) => {
    const limit = parseInt(req.query.limit as string) || 20;
    res.json(blockchainStorage.getLatestTransactions(limit));
  });

  app.get("/api/transactions/:hash", (req, res) => {
    const tx = blockchainStorage.getTransaction(req.params.hash);
    if (!tx) {
      return res.status(404).json({ error: "Transaction not found" });
    }
    res.json(tx);
  });

  app.get("/api/addresses/:address", (req, res) => {
    const info = blockchainStorage.getAddressInfo(req.params.address);
    res.json(info);
  });

  app.get("/api/address/:address", (req, res) => {
    const info = blockchainStorage.getAddressInfo(req.params.address);
    res.json(info);
  });

  app.get("/api/validators", (req, res) => {
    res.json(blockchainStorage.getValidators());
  });

  app.get("/api/validators/:address", (req, res) => {
    const validator = blockchainStorage.getValidator(req.params.address);
    if (!validator) {
      return res.status(404).json({ error: "Validator not found" });
    }
    res.json(validator);
  });

  app.get("/api/wallet", (req, res) => {
    const address = req.query.address as string;
    const network = (req.query.network as string) || "mainnet";
    if (!address) {
      return res.status(400).json({ error: "Address required" });
    }
    const wallet = blockchainStorage.getWallet(address, network);
    res.json(wallet);
  });

  app.get("/api/wallet/:address", (req, res) => {
    const network = (req.query.network as string) || "mainnet";
    const wallet = blockchainStorage.getWallet(req.params.address, network);
    res.json(wallet);
  });

  app.post("/api/wallet/send", (req, res) => {
    const result = sendTransactionSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "Invalid request", details: result.error });
    }
    const { from, to, amount, network } = result.data;

    if (!to.startsWith("zth1") || to.length < 10) {
      return res.status(400).json({ error: "Invalid recipient address" });
    }
    if (parseFloat(amount) <= 0) {
      return res.status(400).json({ error: "Amount must be greater than 0" });
    }

    const tx = blockchainStorage.submitTransaction(from, to, amount, network);
    res.json(tx);
  });

  app.get("/api/search", (req, res) => {
    const query = (req.query.q as string) || "";
    if (!query) {
      return res.status(400).json({ error: "Query required" });
    }
    res.json(blockchainStorage.search(query));
  });

  app.get("/api/genesis", (req, res) => {
    res.json(blockchainStorage.getGenesisConfig());
  });

  app.get("/api/proxy", async (req, res) => {
    const targetUrl = req.query.url as string;
    if (!targetUrl) return res.status(400).send("Missing url");

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(targetUrl);
    } catch {
      return res.status(400).send("Invalid URL");
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      const upstream = await fetch(targetUrl, {
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
          "Accept-Encoding": "identity",
          "Cache-Control": "no-cache",
          "Sec-Fetch-Dest": "document",
          "Sec-Fetch-Mode": "navigate",
          "Sec-Fetch-Site": "none",
          "Upgrade-Insecure-Requests": "1",
        },
        redirect: "follow",
      });
      clearTimeout(timeout);

      const contentType = upstream.headers.get("content-type") ?? "application/octet-stream";

      res.removeHeader("X-Frame-Options");
      res.setHeader("Content-Type", contentType);

      if (contentType.includes("text/html")) {
        let html = await upstream.text();
        const origin = parsedUrl.origin;
        const pageUrl = targetUrl;

        const interceptor = `
<base href="${origin}/">
<script>
(function(){
  var PROXY = '/api/proxy?url=';
  function abs(href) {
    if (!href) return null;
    if (href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#')) return null;
    try { return new URL(href, '${pageUrl}').href; } catch(e){ return null; }
  }
  function nav(url) {
    if (!url) return;
    if (window !== window.top) {
      window.top.postMessage({ zerithBrowser: true, type: 'NAVIGATE', url: url }, '*');
    } else {
      window.location.href = PROXY + encodeURIComponent(url);
    }
  }
  document.addEventListener('click', function(e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    var href = a.getAttribute('href');
    var target = a.getAttribute('target');
    if (target === '_blank') return;
    var u = abs(href);
    if (u) { e.preventDefault(); e.stopPropagation(); nav(u); }
  }, true);
  document.addEventListener('submit', function(e) {
    var form = e.target;
    var method = (form.getAttribute('method') || 'get').toLowerCase();
    if (method === 'get') {
      e.preventDefault();
      var action = abs(form.getAttribute('action') || '${pageUrl}') || '${pageUrl}';
      var data = new URLSearchParams(new FormData(form)).toString();
      nav(action + (action.indexOf('?') >= 0 ? '&' : '?') + data);
    }
  }, true);
})();
<\/script>`;

        if (html.includes("<head>")) {
          html = html.replace("<head>", "<head>" + interceptor);
        } else if (html.includes("<html")) {
          html = html.replace(/(<html[^>]*>)/i, "$1" + interceptor);
        } else {
          html = interceptor + html;
        }

        res.send(html);
      } else {
        const buf = await upstream.arrayBuffer();
        res.send(Buffer.from(buf));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(502).send(`<html><body style="font-family:sans-serif;padding:2rem;color:#444"><h2>Cannot reach this page</h2><p>${parsedUrl.hostname} — ${msg}</p></body></html>`);
    }
  });

  return httpServer;
}
