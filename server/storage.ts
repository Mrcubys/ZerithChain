import { type Block, type Transaction, type Validator, type NetworkStatus } from "@shared/schema";
import { randomBytes } from "crypto";

function hexHash(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, "0");
  return "0x" + hex.repeat(8).slice(0, 64);
}

function zthAddress(seed: string): string {
  let hash = 5381;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) + hash) + seed.charCodeAt(i);
    hash = hash & hash;
  }
  const addr = Math.abs(hash).toString(36).padStart(38, "0").slice(0, 38);
  return "zth1" + addr;
}

function randomAmount(min: number, max: number): string {
  return (Math.random() * (max - min) + min).toFixed(4);
}

const VALIDATOR_NAMES = [
  "Zerith Foundation", "NovaStar Validation", "CryptoGuard Node", "AlphaStake Pool",
  "BetaValidator", "Consensus One", "Meridian Node", "Quantum Stake",
  "Apex Validator", "StarForge Node", "NexusPool", "OmegaStake",
  "Celestia Node", "Polaris Validator", "Aurora Stake", "Horizon Node",
  "ZenithBlock", "CosmosGuard", "BlockForge", "NetherNode",
];

const REGIONS: Array<"Americas" | "Europe" | "Asia" | "Africa"> = ["Americas", "Europe", "Asia", "Africa"];
const TX_TYPES: Array<"transfer" | "stake" | "unstake" | "contract" | "delegate"> = ["transfer", "stake", "unstake", "contract", "delegate"];
const TX_TYPE_WEIGHTS = [0.6, 0.15, 0.08, 0.12, 0.05];

function weightedTxType(): "transfer" | "stake" | "unstake" | "contract" | "delegate" {
  const r = Math.random();
  let cumulative = 0;
  for (let i = 0; i < TX_TYPES.length; i++) {
    cumulative += TX_TYPE_WEIGHTS[i];
    if (r < cumulative) return TX_TYPES[i];
  }
  return "transfer";
}

export class BlockchainStorage {
  private blocks: Block[] = [];
  private transactions: Transaction[] = [];
  private validators: Validator[] = [];
  private currentHeight = 1847293;
  private currentEpoch = 924;
  private totalTxCount = 48293741;

  constructor() {
    this.initValidators();
    this.initChain();
  }

  private initValidators() {
    for (let i = 0; i < 21; i++) {
      const region = REGIONS[i % REGIONS.length];
      const stake = (Math.random() * 500000 + 50000).toFixed(0);
      const delegated = (Math.random() * 200000 + 10000).toFixed(0);
      this.validators.push({
        address: zthAddress(`validator-${i}`),
        name: VALIDATOR_NAMES[i],
        region,
        stake,
        delegatedStake: delegated,
        commission: Math.floor(Math.random() * 10) + 1,
        uptime: parseFloat((99 + Math.random() * 0.99).toFixed(2)),
        blocksProduced: Math.floor(Math.random() * 80000 + 20000),
        status: i < 18 ? "active" : i < 20 ? "inactive" : "jailed",
        rank: i + 1,
        latency: Math.floor(Math.random() * 80) + 10,
      });
    }
  }

  private initChain() {
    const now = Date.now();
    for (let i = 99; i >= 0; i--) {
      const height = this.currentHeight - i;
      const time = new Date(now - i * 2000).toISOString();
      const validatorIdx = Math.floor(Math.random() * 18);
      const txCount = Math.floor(Math.random() * 180) + 20;

      const block: Block = {
        height,
        hash: hexHash(`block-${height}`),
        previousHash: hexHash(`block-${height - 1}`),
        timestamp: time,
        validator: this.validators[validatorIdx].address,
        validatorName: this.validators[validatorIdx].name,
        transactionCount: txCount,
        gasUsed: (Math.random() * 8000000 + 1000000).toFixed(0),
        gasLimit: "10000000",
        stateRoot: hexHash(`state-${height}`),
        size: Math.floor(Math.random() * 50000) + 5000,
        reward: "2.000000000000000000",
      };
      this.blocks.push(block);

      for (let j = 0; j < Math.min(txCount, 5); j++) {
        const fromIdx = Math.floor(Math.random() * 50);
        const toIdx = Math.floor(Math.random() * 50);
        const txType = weightedTxType();
        const tx: Transaction = {
          hash: hexHash(`tx-${height}-${j}`),
          blockHeight: height,
          from: zthAddress(`user-${fromIdx}`),
          to: txType === "stake" || txType === "delegate"
            ? this.validators[Math.floor(Math.random() * 18)].address
            : zthAddress(`user-${toIdx}`),
          amount: randomAmount(txType === "stake" ? 1000 : 0.1, txType === "stake" ? 100000 : 10000),
          gasFee: (Math.random() * 0.05 + 0.001).toFixed(6),
          nonce: Math.floor(Math.random() * 1000),
          timestamp: time,
          status: Math.random() > 0.02 ? "success" : "failed",
          type: txType,
        };
        this.transactions.push(tx);
      }
    }
  }

  private generateNewBlock(): void {
    this.currentHeight++;
    const now = new Date().toISOString();
    const validatorIdx = Math.floor(Math.random() * 18);
    const txCount = Math.floor(Math.random() * 180) + 20;

    const block: Block = {
      height: this.currentHeight,
      hash: hexHash(`block-${this.currentHeight}-${Date.now()}`),
      previousHash: this.blocks[this.blocks.length - 1]?.hash || hexHash("genesis"),
      timestamp: now,
      validator: this.validators[validatorIdx].address,
      validatorName: this.validators[validatorIdx].name,
      transactionCount: txCount,
      gasUsed: (Math.random() * 8000000 + 1000000).toFixed(0),
      gasLimit: "10000000",
      stateRoot: hexHash(`state-${this.currentHeight}-${Date.now()}`),
      size: Math.floor(Math.random() * 50000) + 5000,
      reward: "2.000000000000000000",
    };

    this.blocks.push(block);
    if (this.blocks.length > 500) this.blocks.shift();
    this.totalTxCount += txCount;

    for (let j = 0; j < Math.min(txCount, 8); j++) {
      const fromIdx = Math.floor(Math.random() * 50);
      const toIdx = Math.floor(Math.random() * 50);
      const txType = weightedTxType();
      const tx: Transaction = {
        hash: hexHash(`tx-${this.currentHeight}-${j}-${Date.now()}`),
        blockHeight: this.currentHeight,
        from: zthAddress(`user-${fromIdx}`),
        to: txType === "stake" || txType === "delegate"
          ? this.validators[Math.floor(Math.random() * 18)].address
          : zthAddress(`user-${toIdx}`),
        amount: randomAmount(txType === "stake" ? 1000 : 0.1, txType === "stake" ? 100000 : 10000),
        gasFee: (Math.random() * 0.05 + 0.001).toFixed(6),
        nonce: Math.floor(Math.random() * 1000),
        timestamp: now,
        status: Math.random() > 0.02 ? "success" : "failed",
        type: txType,
      };
      this.transactions.push(tx);
      if (this.transactions.length > 2000) this.transactions.shift();
    }
  }

  getLatestBlocks(limit = 20): Block[] {
    this.generateNewBlock();
    return [...this.blocks].reverse().slice(0, limit);
  }

  getBlock(height: number): Block | undefined {
    return this.blocks.find(b => b.height === height);
  }

  getBlockByHash(hash: string): Block | undefined {
    return this.blocks.find(b => b.hash === hash);
  }

  getLatestTransactions(limit = 20): Transaction[] {
    return [...this.transactions].reverse().slice(0, limit);
  }

  getTransaction(hash: string): Transaction | undefined {
    return this.transactions.find(t => t.hash === hash);
  }

  getTransactionsByAddress(address: string, limit = 20): Transaction[] {
    return this.transactions
      .filter(t => t.from === address || t.to === address)
      .slice(-limit)
      .reverse();
  }

  getTransactionsByBlock(height: number): Transaction[] {
    return this.transactions.filter(t => t.blockHeight === height);
  }

  getAddressInfo(address: string) {
    const txs = this.getTransactionsByAddress(address, 50);
    let balance = 0;
    txs.forEach(tx => {
      const amt = parseFloat(tx.amount);
      if (tx.to === address && tx.status === "success") balance += amt;
      if (tx.from === address && tx.status === "success") balance -= amt + parseFloat(tx.gasFee);
    });

    const validator = this.validators.find(v => v.address === address);
    return {
      address,
      balance: Math.max(0, balance + 50000 + Math.random() * 100000).toFixed(4),
      stakedBalance: validator ? validator.stake : "0.0000",
      nonce: txs.filter(t => t.from === address).length,
      transactions: txs,
      isValidator: !!validator,
    };
  }

  getValidators(): Validator[] {
    return this.validators;
  }

  getValidator(address: string): Validator | undefined {
    return this.validators.find(v => v.address === address);
  }

  getNetworkStatus(network: string): NetworkStatus {
    const isTestnet = network === "testnet";
    const activeValidators = this.validators.filter(v => v.status === "active").length;
    const totalStaked = this.validators.reduce((sum, v) =>
      sum + parseFloat(v.stake) + parseFloat(v.delegatedStake), 0);

    return {
      chainId: isTestnet ? "zerith-testnet-1" : "zerith-mainnet-1",
      blockHeight: this.currentHeight,
      tps: Math.floor(Math.random() * 2000) + 3000,
      peakTps: 5000,
      activeValidators,
      totalValidators: this.validators.length,
      totalSupply: "1000000000.0000",
      circulatingSupply: "350000000.0000",
      totalStaked: totalStaked.toFixed(4),
      averageBlockTime: 2.0 + Math.random() * 0.3,
      networkVersion: "v1.2.0",
      epoch: this.currentEpoch,
      bondedRatio: parseFloat((totalStaked / 1000000000).toFixed(4)),
      totalTransactions: this.totalTxCount,
    };
  }

  getWallet(address: string, network: string) {
    const info = this.getAddressInfo(address);
    return {
      ...info,
      network,
    };
  }

  submitTransaction(from: string, to: string, amount: string, network: string): Transaction {
    const now = new Date().toISOString();
    const tx: Transaction = {
      hash: hexHash(`tx-${from}-${to}-${Date.now()}`),
      blockHeight: this.currentHeight,
      from,
      to,
      amount,
      gasFee: (Math.random() * 0.01 + 0.001).toFixed(6),
      nonce: Math.floor(Math.random() * 1000),
      timestamp: now,
      status: "success",
      type: "transfer",
    };
    this.transactions.push(tx);
    return tx;
  }

  search(query: string): { type: "block" | "tx" | "address" | "not_found"; data: unknown } {
    if (query.startsWith("zth1")) {
      return { type: "address", data: this.getAddressInfo(query) };
    }
    if (query.startsWith("0x") && query.length === 66) {
      const tx = this.getTransaction(query);
      if (tx) return { type: "tx", data: tx };
      const block = this.getBlockByHash(query);
      if (block) return { type: "block", data: block };
    }
    const height = parseInt(query);
    if (!isNaN(height)) {
      const block = this.getBlock(height);
      if (block) return { type: "block", data: block };
    }
    return { type: "not_found", data: null };
  }
}

export const blockchainStorage = new BlockchainStorage();
