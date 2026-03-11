import { eq, and, or, desc, sql } from "drizzle-orm";
import { db } from "./db";
import {
  dbBlocks, dbTransactions, dbAccounts, dbValidators,
  type Block, type Transaction, type Validator, type NetworkStatus,
} from "@shared/schema";

// ── Deterministic hash from seed (no random) ───────────────────────────────

function hexHash(seed: string): string {
  let h = 5381;
  for (let i = 0; i < seed.length; i++) {
    h = ((h << 5) + h) ^ seed.charCodeAt(i);
    h = h | 0;
  }
  const hex = Math.abs(h).toString(16).padStart(8, "0");
  return (hex.repeat(8).slice(0, 64)).toUpperCase();
}

// ── Genesis configuration ──────────────────────────────────────────────────

export const GENESIS_CONFIG = {
  mainnet: {
    chainId: "zerith-mainnet-1",
    genesisTime: "2026-03-10T00:00:00Z",
    symbol: "ZTH",
    initialSupply: "1000000000",
    decimals: 18,
    networkVersion: "v1.0.0",
    accounts: [
      { address: "zth1foundation0000000000000000000000000000", name: "Zerith Foundation", balance: "900000000.0000" },
      { address: "zth1dev0000000000000000000000000000000000", name: "Genesis Dev Wallet", balance: "50000000.0000" },
      { address: "zth1ecosystem00000000000000000000000000000", name: "Ecosystem Fund", balance: "50000000.0000" },
    ],
  },
  testnet: {
    chainId: "zerith-testnet-1",
    genesisTime: "2026-03-10T00:00:00Z",
    symbol: "tZTH",
    initialSupply: "1000000000",
    decimals: 18,
    networkVersion: "v1.0.0",
    accounts: [
      { address: "zth1tfoundation000000000000000000000000000", name: "Testnet Foundation", balance: "900000000.0000" },
      { address: "zth1tdev00000000000000000000000000000000000", name: "Testnet Dev Wallet", balance: "0.0000" },
    ],
    genesisRecipient: "zth100000000000000000000000000000000yutjs2",
    genesisAmount: "100000000.0000",
  },
};

const VALIDATOR_SET = [
  { name: "Zerith Foundation",   region: "Americas", stake: "469340", commission: 6,  uptime: 99.66, latency: 78,  blocksProduced: 23065 },
  { name: "NovaStar Validation", region: "Europe",   stake: "312150", commission: 4,  uptime: 99.81, latency: 42,  blocksProduced: 18420 },
  { name: "CryptoGuard Node",    region: "Asia",     stake: "289460", commission: 5,  uptime: 99.72, latency: 65,  blocksProduced: 16834 },
  { name: "AlphaStake Pool",     region: "Americas", stake: "256780", commission: 3,  uptime: 99.88, latency: 35,  blocksProduced: 15291 },
  { name: "BetaValidator",       region: "Europe",   stake: "234120", commission: 7,  uptime: 99.55, latency: 88,  blocksProduced: 14103 },
  { name: "Consensus One",       region: "Asia",     stake: "218930", commission: 2,  uptime: 99.93, latency: 28,  blocksProduced: 13567 },
  { name: "Meridian Node",       region: "Africa",   stake: "198450", commission: 8,  uptime: 99.41, latency: 112, blocksProduced: 12234 },
  { name: "Quantum Stake",       region: "Americas", stake: "187340", commission: 5,  uptime: 99.78, latency: 51,  blocksProduced: 11890 },
  { name: "Apex Validator",      region: "Europe",   stake: "176210", commission: 4,  uptime: 99.85, latency: 39,  blocksProduced: 11203 },
  { name: "StarForge Node",      region: "Asia",     stake: "165890", commission: 6,  uptime: 99.61, latency: 73,  blocksProduced: 10567 },
  { name: "NexusPool",           region: "Americas", stake: "154320", commission: 3,  uptime: 99.90, latency: 31,  blocksProduced: 9834  },
  { name: "OmegaStake",          region: "Europe",   stake: "143670", commission: 7,  uptime: 99.48, latency: 96,  blocksProduced: 9102  },
  { name: "Celestia Node",       region: "Africa",   stake: "132450", commission: 5,  uptime: 99.74, latency: 68,  blocksProduced: 8421  },
  { name: "Polaris Validator",   region: "Asia",     stake: "121890", commission: 2,  uptime: 99.95, latency: 22,  blocksProduced: 7893  },
  { name: "Aurora Stake",        region: "Americas", stake: "112340", commission: 8,  uptime: 99.38, latency: 125, blocksProduced: 7234  },
  { name: "Horizon Node",        region: "Europe",   stake: "103210", commission: 4,  uptime: 99.82, latency: 44,  blocksProduced: 6701  },
  { name: "ZenithBlock",         region: "Asia",     stake: "95670",  commission: 6,  uptime: 99.65, latency: 79,  blocksProduced: 6102  },
  { name: "CosmosGuard",         region: "Africa",   stake: "87430",  commission: 5,  uptime: 99.71, latency: 63,  blocksProduced: 5543  },
  { name: "BlockForge",          region: "Americas", stake: "72340",  commission: 9,  uptime: 98.92, latency: 145, blocksProduced: 4123, status: "inactive" },
  { name: "NetherNode",          region: "Europe",   stake: "61230",  commission: 10, uptime: 97.45, latency: 198, blocksProduced: 2341, status: "inactive" },
  { name: "ShadowChain",         region: "Asia",     stake: "51000",  commission: 0,  uptime: 45.00, latency: 500, blocksProduced: 120,  status: "jailed"   },
] as const;

// ── Seed helpers ───────────────────────────────────────────────────────────

async function seedNetwork(network: "mainnet" | "testnet") {
  const cfg = GENESIS_CONFIG[network];

  // Check if already seeded
  const existing = await db.select({ id: dbBlocks.id }).from(dbBlocks)
    .where(eq(dbBlocks.network, network)).limit(1);
  if (existing.length > 0) return;

  console.log(`[storage] Seeding ${network} genesis...`);

  // Validators
  for (let i = 0; i < VALIDATOR_SET.length; i++) {
    const v = VALIDATOR_SET[i];
    const vhash = hexHash(`validator-${network}-${i}`).toLowerCase();
    const vaddr = "zth1v" + vhash.slice(0, 37).replace(/[^0-9a-f]/g, "0");
    await db.insert(dbValidators).values({
      network,
      address: vaddr,
      name: v.name,
      region: v.region,
      stake: v.stake,
      delegatedStake: "0",
      commission: v.commission,
      uptime: v.uptime,
      blocksProduced: v.blocksProduced,
      status: "status" in v ? v.status : "active",
      rank: i + 1,
      latency: v.latency,
    });
  }

  // Build deterministic validator address list for genesis block
  const validatorRows = await db.select().from(dbValidators)
    .where(eq(dbValidators.network, network))
    .orderBy(dbValidators.rank).limit(18);

  const genesisValidator = validatorRows[0];

  // Genesis block
  await db.insert(dbBlocks).values({
    network,
    height: 1,
    hash: hexHash(`genesis-block-${network}`),
    previousHash: "0".repeat(64),
    timestamp: cfg.genesisTime,
    validator: genesisValidator.address,
    validatorName: genesisValidator.name,
    transactionCount: network === "testnet" ? 1 : 0,
    gasUsed: "0",
    gasLimit: "10000000",
    stateRoot: hexHash(`genesis-state-${network}`),
    size: 512,
    reward: "0",
  });

  // Genesis accounts
  for (const acc of cfg.accounts) {
    await db.insert(dbAccounts).values({
      network,
      address: acc.address,
      balance: acc.balance,
      stakedBalance: "0",
      nonce: 0,
      name: acc.name,
    });
  }

  // Testnet: genesis transaction — 100M tZTH to the specified address
  if (network === "testnet") {
    const testCfg = GENESIS_CONFIG.testnet;
    const recipient = testCfg.genesisRecipient;
    const amount = testCfg.genesisAmount;
    const sender = testCfg.accounts[0].address;

    await db.insert(dbTransactions).values({
      network,
      hash: hexHash(`genesis-tx-testnet-${recipient}`),
      blockHeight: 1,
      fromAddress: sender,
      toAddress: recipient,
      amount,
      gasFee: "0.000000",
      nonce: 0,
      timestamp: cfg.genesisTime,
      status: "success",
      type: "transfer",
    });

    // Deduct from foundation, credit recipient
    const senderBalance = parseFloat(testCfg.accounts[0].balance);
    const sendAmt = parseFloat(amount);
    await db.update(dbAccounts)
      .set({ balance: (senderBalance - sendAmt).toFixed(4), nonce: 1 })
      .where(and(eq(dbAccounts.network, network), eq(dbAccounts.address, sender)));

    // Create recipient account
    await db.insert(dbAccounts).values({
      network,
      address: recipient,
      balance: amount,
      stakedBalance: "0",
      nonce: 0,
      name: null,
    });

    // Update block tx count
    await db.update(dbBlocks)
      .set({ transactionCount: 1 })
      .where(and(eq(dbBlocks.network, network), eq(dbBlocks.height, 1)));
  }

  console.log(`[storage] ${network} genesis complete.`);
}

// ── Main storage class ──────────────────────────────────────────────────────

export class BlockchainStorage {
  async init() {
    await this.ensureTables();
    await seedNetwork("mainnet");
    await seedNetwork("testnet");
  }

  private async ensureTables() {
    try {
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS blocks (
          id SERIAL PRIMARY KEY,
          network TEXT NOT NULL,
          height INTEGER NOT NULL,
          hash TEXT NOT NULL,
          previous_hash TEXT NOT NULL,
          timestamp TEXT NOT NULL,
          validator TEXT NOT NULL,
          validator_name TEXT NOT NULL,
          transaction_count INTEGER NOT NULL DEFAULT 0,
          gas_used TEXT NOT NULL DEFAULT '0',
          gas_limit TEXT NOT NULL DEFAULT '10000000',
          state_root TEXT NOT NULL,
          size INTEGER NOT NULL DEFAULT 0,
          reward TEXT NOT NULL DEFAULT '2.000000000000000000'
        );
        CREATE UNIQUE INDEX IF NOT EXISTS blocks_network_height ON blocks(network, height);
        CREATE UNIQUE INDEX IF NOT EXISTS blocks_hash ON blocks(hash);

        CREATE TABLE IF NOT EXISTS transactions (
          id SERIAL PRIMARY KEY,
          network TEXT NOT NULL,
          hash TEXT NOT NULL,
          block_height INTEGER NOT NULL,
          from_address TEXT NOT NULL,
          to_address TEXT NOT NULL,
          amount TEXT NOT NULL,
          gas_fee TEXT NOT NULL,
          nonce INTEGER NOT NULL DEFAULT 0,
          timestamp TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'success',
          type TEXT NOT NULL DEFAULT 'transfer'
        );
        CREATE UNIQUE INDEX IF NOT EXISTS transactions_hash ON transactions(hash);
        CREATE INDEX IF NOT EXISTS transactions_network ON transactions(network);
        CREATE INDEX IF NOT EXISTS transactions_from ON transactions(network, from_address);
        CREATE INDEX IF NOT EXISTS transactions_to ON transactions(network, to_address);

        CREATE TABLE IF NOT EXISTS accounts (
          id SERIAL PRIMARY KEY,
          network TEXT NOT NULL,
          address TEXT NOT NULL,
          balance TEXT NOT NULL DEFAULT '0',
          staked_balance TEXT NOT NULL DEFAULT '0',
          nonce INTEGER NOT NULL DEFAULT 0,
          name TEXT
        );
        CREATE UNIQUE INDEX IF NOT EXISTS accounts_network_address ON accounts(network, address);

        CREATE TABLE IF NOT EXISTS validators (
          id SERIAL PRIMARY KEY,
          network TEXT NOT NULL,
          address TEXT NOT NULL,
          name TEXT NOT NULL,
          region TEXT NOT NULL,
          stake TEXT NOT NULL,
          delegated_stake TEXT NOT NULL DEFAULT '0',
          commission INTEGER NOT NULL DEFAULT 5,
          uptime REAL NOT NULL DEFAULT 99.9,
          blocks_produced INTEGER NOT NULL DEFAULT 0,
          status TEXT NOT NULL DEFAULT 'active',
          rank INTEGER NOT NULL DEFAULT 1,
          latency INTEGER NOT NULL DEFAULT 50
        );
        CREATE UNIQUE INDEX IF NOT EXISTS validators_network_address ON validators(network, address);
      `);
    } catch (e) {
      // Tables may already exist — that's fine
    }
  }

  // ── Blocks ────────────────────────────────────────────────────────────────

  async getLatestBlocks(network: string, limit = 20): Promise<Block[]> {
    const rows = await db.select().from(dbBlocks)
      .where(eq(dbBlocks.network, network))
      .orderBy(desc(dbBlocks.height))
      .limit(limit);
    return rows.map(dbBlockToBlock);
  }

  async getBlock(network: string, height: number): Promise<Block | undefined> {
    const rows = await db.select().from(dbBlocks)
      .where(and(eq(dbBlocks.network, network), eq(dbBlocks.height, height)))
      .limit(1);
    return rows[0] ? dbBlockToBlock(rows[0]) : undefined;
  }

  async getBlockByHash(network: string, hash: string): Promise<Block | undefined> {
    const rows = await db.select().from(dbBlocks)
      .where(and(eq(dbBlocks.network, network), eq(dbBlocks.hash, hash)))
      .limit(1);
    return rows[0] ? dbBlockToBlock(rows[0]) : undefined;
  }

  // ── Transactions ──────────────────────────────────────────────────────────

  async getLatestTransactions(network: string, limit = 20): Promise<Transaction[]> {
    const rows = await db.select().from(dbTransactions)
      .where(eq(dbTransactions.network, network))
      .orderBy(desc(dbTransactions.id))
      .limit(limit);
    return rows.map(dbTxToTx);
  }

  async getTransaction(network: string, hash: string): Promise<Transaction | undefined> {
    const rows = await db.select().from(dbTransactions)
      .where(and(eq(dbTransactions.network, network), eq(dbTransactions.hash, hash)))
      .limit(1);
    return rows[0] ? dbTxToTx(rows[0]) : undefined;
  }

  async getTransactionsByBlock(network: string, height: number): Promise<Transaction[]> {
    const rows = await db.select().from(dbTransactions)
      .where(and(eq(dbTransactions.network, network), eq(dbTransactions.blockHeight, height)))
      .orderBy(desc(dbTransactions.id));
    return rows.map(dbTxToTx);
  }

  async getTransactionsByAddress(network: string, address: string, limit = 50): Promise<Transaction[]> {
    const rows = await db.select().from(dbTransactions)
      .where(and(
        eq(dbTransactions.network, network),
        or(eq(dbTransactions.fromAddress, address), eq(dbTransactions.toAddress, address)),
      ))
      .orderBy(desc(dbTransactions.id))
      .limit(limit);
    return rows.map(dbTxToTx);
  }

  // ── Accounts ──────────────────────────────────────────────────────────────

  async getAccount(network: string, address: string) {
    const rows = await db.select().from(dbAccounts)
      .where(and(eq(dbAccounts.network, network), eq(dbAccounts.address, address)))
      .limit(1);
    return rows[0] ?? null;
  }

  async getOrCreateAccount(network: string, address: string) {
    let acc = await this.getAccount(network, address);
    if (!acc) {
      await db.insert(dbAccounts).values({ network, address, balance: "0", stakedBalance: "0", nonce: 0 });
      acc = (await db.select().from(dbAccounts)
        .where(and(eq(dbAccounts.network, network), eq(dbAccounts.address, address)))
        .limit(1))[0];
    }
    return acc!;
  }

  async getAddressInfo(network: string, address: string) {
    const [acc, txs, validator] = await Promise.all([
      this.getAccount(network, address),
      this.getTransactionsByAddress(network, address, 50),
      this.getValidator(network, address),
    ]);

    const balance = acc?.balance ?? "0";
    const stakedBalance = validator?.stake ?? acc?.stakedBalance ?? "0";

    let totalSent = 0;
    let totalReceived = 0;
    txs.forEach(tx => {
      if (tx.status === "success") {
        if (tx.from === address) totalSent += parseFloat(tx.amount);
        if (tx.to === address) totalReceived += parseFloat(tx.amount);
      }
    });

    return {
      address,
      balance,
      stakedBalance,
      nonce: acc?.nonce ?? 0,
      transactions: txs,
      isValidator: !!validator,
      isDeveloper: false,
      walletName: acc?.name ?? null,
      totalSent: totalSent.toFixed(4),
      totalReceived: totalReceived.toFixed(4),
    };
  }

  // ── Validators ────────────────────────────────────────────────────────────

  async getValidators(network: string): Promise<Validator[]> {
    const rows = await db.select().from(dbValidators)
      .where(eq(dbValidators.network, network))
      .orderBy(dbValidators.rank);
    return rows.map(dbValToVal);
  }

  async getValidator(network: string, address: string): Promise<Validator | undefined> {
    const rows = await db.select().from(dbValidators)
      .where(and(eq(dbValidators.network, network), eq(dbValidators.address, address)))
      .limit(1);
    return rows[0] ? dbValToVal(rows[0]) : undefined;
  }

  // ── Network status ────────────────────────────────────────────────────────

  async getNetworkStatus(network: string): Promise<NetworkStatus> {
    const cfg = network === "testnet" ? GENESIS_CONFIG.testnet : GENESIS_CONFIG.mainnet;

    const [latestBlocks, validators, txCountRow] = await Promise.all([
      db.select({ height: dbBlocks.height }).from(dbBlocks)
        .where(eq(dbBlocks.network, network))
        .orderBy(desc(dbBlocks.height)).limit(1),
      db.select().from(dbValidators).where(eq(dbValidators.network, network)),
      db.select({ count: sql<number>`COUNT(*)` }).from(dbTransactions)
        .where(eq(dbTransactions.network, network)),
    ]);

    const blockHeight = latestBlocks[0]?.height ?? 1;
    const activeValidators = validators.filter(v => v.status === "active").length;
    const totalStaked = validators.reduce((s, v) => s + parseFloat(v.stake) + parseFloat(v.delegatedStake ?? "0"), 0);
    const totalTx = Number(txCountRow[0]?.count ?? 0);

    return {
      chainId: cfg.chainId,
      network,
      blockHeight,
      tps: 0,
      peakTps: 5000,
      activeValidators,
      totalValidators: validators.length,
      totalSupply: "1000000000.0000",
      circulatingSupply: "1000000000.0000",
      totalStaked: totalStaked.toFixed(4),
      averageBlockTime: 2.0,
      networkVersion: cfg.networkVersion,
      epoch: Math.floor(blockHeight / 100),
      bondedRatio: parseFloat((totalStaked / 1000000000).toFixed(4)),
      totalTransactions: totalTx,
    };
  }

  // ── Submit transaction (real) ─────────────────────────────────────────────

  async submitTransaction(from: string, to: string, amount: string, network: string): Promise<Transaction> {
    const sendAmt = parseFloat(amount);
    if (isNaN(sendAmt) || sendAmt <= 0) throw new Error("Invalid amount");

    const gasFee = "0.000100";
    const gasFeeAmt = parseFloat(gasFee);

    const sender = await this.getOrCreateAccount(network, from);
    const senderBalance = parseFloat(sender.balance);

    if (senderBalance < sendAmt + gasFeeAmt) {
      throw new Error("Insufficient balance");
    }

    const newSenderBalance = (senderBalance - sendAmt - gasFeeAmt).toFixed(4);
    const newNonce = (sender.nonce ?? 0) + 1;

    await db.update(dbAccounts)
      .set({ balance: newSenderBalance, nonce: newNonce })
      .where(and(eq(dbAccounts.network, network), eq(dbAccounts.address, from)));

    const recipient = await this.getOrCreateAccount(network, to);
    const recipientBalance = parseFloat(recipient.balance);
    await db.update(dbAccounts)
      .set({ balance: (recipientBalance + sendAmt).toFixed(4) })
      .where(and(eq(dbAccounts.network, network), eq(dbAccounts.address, to)));

    // Create new block
    const latestBlock = await db.select({ height: dbBlocks.height, hash: dbBlocks.hash })
      .from(dbBlocks).where(eq(dbBlocks.network, network))
      .orderBy(desc(dbBlocks.height)).limit(1);
    const prevHeight = latestBlock[0]?.height ?? 1;
    const prevHash = latestBlock[0]?.hash ?? "0".repeat(64);
    const newHeight = prevHeight + 1;
    const now = new Date().toISOString();

    const activeValidators = await db.select()
      .from(dbValidators)
      .where(and(eq(dbValidators.network, network), eq(dbValidators.status, "active")))
      .orderBy(dbValidators.rank).limit(18);

    const validatorIdx = newHeight % activeValidators.length;
    const blockValidator = activeValidators[validatorIdx];

    await db.insert(dbBlocks).values({
      network,
      height: newHeight,
      hash: hexHash(`block-${network}-${newHeight}-${Date.now()}`),
      previousHash: prevHash,
      timestamp: now,
      validator: blockValidator.address,
      validatorName: blockValidator.name,
      transactionCount: 1,
      gasUsed: "21000",
      gasLimit: "10000000",
      stateRoot: hexHash(`state-${network}-${newHeight}`),
      size: 256,
      reward: "2.000000000000000000",
    });

    await db.update(dbValidators)
      .set({ blocksProduced: sql`blocks_produced + 1` })
      .where(and(eq(dbValidators.network, network), eq(dbValidators.address, blockValidator.address)));

    const txHash = hexHash(`tx-${network}-${from}-${to}-${newNonce}-${Date.now()}`);

    await db.insert(dbTransactions).values({
      network,
      hash: txHash,
      blockHeight: newHeight,
      fromAddress: from,
      toAddress: to,
      amount,
      gasFee,
      nonce: newNonce,
      timestamp: now,
      status: "success",
      type: "transfer",
    });

    return {
      hash: txHash,
      blockHeight: newHeight,
      from,
      to,
      amount,
      gasFee,
      nonce: newNonce,
      timestamp: now,
      status: "success",
      type: "transfer",
    };
  }

  // ── Search ────────────────────────────────────────────────────────────────

  async search(network: string, query: string): Promise<{ type: "block" | "tx" | "address" | "not_found"; data: unknown }> {
    if (query.startsWith("zth")) {
      return { type: "address", data: await this.getAddressInfo(network, query) };
    }
    const normalised = query.toUpperCase();
    if (/^[0-9A-F]{64}$/.test(normalised)) {
      const tx = await this.getTransaction(network, normalised);
      if (tx) return { type: "tx", data: tx };
      const block = await this.getBlockByHash(network, normalised);
      if (block) return { type: "block", data: block };
    }
    const height = parseInt(query);
    if (!isNaN(height)) {
      const block = await this.getBlock(network, height);
      if (block) return { type: "block", data: block };
    }
    return { type: "not_found", data: null };
  }

  getGenesisConfig(network: string) {
    return network === "testnet" ? GENESIS_CONFIG.testnet : GENESIS_CONFIG.mainnet;
  }
}

// ── Row mappers ────────────────────────────────────────────────────────────

function dbBlockToBlock(row: typeof dbBlocks.$inferSelect): Block {
  return {
    height: row.height,
    hash: row.hash,
    previousHash: row.previousHash,
    timestamp: row.timestamp,
    validator: row.validator,
    validatorName: row.validatorName,
    transactionCount: row.transactionCount,
    gasUsed: row.gasUsed,
    gasLimit: row.gasLimit,
    stateRoot: row.stateRoot,
    size: row.size,
    reward: row.reward,
  };
}

function dbTxToTx(row: typeof dbTransactions.$inferSelect): Transaction {
  return {
    hash: row.hash,
    blockHeight: row.blockHeight,
    from: row.fromAddress,
    to: row.toAddress,
    amount: row.amount,
    gasFee: row.gasFee,
    nonce: row.nonce,
    timestamp: row.timestamp,
    status: row.status as "success" | "failed" | "pending",
    type: row.type as "transfer" | "stake" | "unstake" | "contract" | "delegate",
  };
}

function dbValToVal(row: typeof dbValidators.$inferSelect): Validator {
  return {
    address: row.address,
    name: row.name,
    region: row.region as "Americas" | "Europe" | "Asia" | "Africa",
    stake: row.stake,
    delegatedStake: row.delegatedStake,
    commission: row.commission,
    uptime: row.uptime,
    blocksProduced: row.blocksProduced,
    status: row.status as "active" | "inactive" | "jailed",
    rank: row.rank,
    latency: row.latency,
  };
}

export const blockchainStorage = new BlockchainStorage();
