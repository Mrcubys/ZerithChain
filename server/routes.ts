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

  return httpServer;
}
