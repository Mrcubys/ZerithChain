import { z } from "zod";
import { pgTable, serial, text, integer, numeric, real, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

// ── Drizzle ORM tables ──────────────────────────────────────────────────────

export const dbBlocks = pgTable("blocks", {
  id: serial("id").primaryKey(),
  network: text("network").notNull(),
  height: integer("height").notNull(),
  hash: text("hash").notNull(),
  previousHash: text("previous_hash").notNull(),
  timestamp: text("timestamp").notNull(),
  validator: text("validator").notNull(),
  validatorName: text("validator_name").notNull(),
  transactionCount: integer("transaction_count").notNull().default(0),
  gasUsed: text("gas_used").notNull().default("0"),
  gasLimit: text("gas_limit").notNull().default("10000000"),
  stateRoot: text("state_root").notNull(),
  size: integer("size").notNull().default(0),
  reward: text("reward").notNull().default("2.000000000000000000"),
});

export const dbTransactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  network: text("network").notNull(),
  hash: text("hash").notNull(),
  blockHeight: integer("block_height").notNull(),
  fromAddress: text("from_address").notNull(),
  toAddress: text("to_address").notNull(),
  amount: text("amount").notNull(),
  gasFee: text("gas_fee").notNull(),
  nonce: integer("nonce").notNull().default(0),
  timestamp: text("timestamp").notNull(),
  status: text("status").notNull().default("success"),
  type: text("type").notNull().default("transfer"),
});

export const dbAccounts = pgTable("accounts", {
  id: serial("id").primaryKey(),
  network: text("network").notNull(),
  address: text("address").notNull(),
  balance: text("balance").notNull().default("0"),
  stakedBalance: text("staked_balance").notNull().default("0"),
  nonce: integer("nonce").notNull().default(0),
  name: text("name"),
});

export const dbValidators = pgTable("validators", {
  id: serial("id").primaryKey(),
  network: text("network").notNull(),
  address: text("address").notNull(),
  name: text("name").notNull(),
  region: text("region").notNull(),
  stake: text("stake").notNull(),
  delegatedStake: text("delegated_stake").notNull().default("0"),
  commission: integer("commission").notNull().default(5),
  uptime: real("uptime").notNull().default(99.9),
  blocksProduced: integer("blocks_produced").notNull().default(0),
  status: text("status").notNull().default("active"),
  rank: integer("rank").notNull().default(1),
  latency: integer("latency").notNull().default(50),
});

// ── Zod schemas (API types) ─────────────────────────────────────────────────

export const blockSchema = z.object({
  height: z.number(),
  hash: z.string(),
  previousHash: z.string(),
  timestamp: z.string(),
  validator: z.string(),
  validatorName: z.string(),
  transactionCount: z.number(),
  gasUsed: z.string(),
  gasLimit: z.string(),
  stateRoot: z.string(),
  size: z.number(),
  reward: z.string(),
});

export const transactionSchema = z.object({
  hash: z.string(),
  blockHeight: z.number(),
  from: z.string(),
  to: z.string(),
  amount: z.string(),
  gasFee: z.string(),
  nonce: z.number(),
  timestamp: z.string(),
  status: z.enum(["success", "failed", "pending"]),
  type: z.enum(["transfer", "stake", "unstake", "contract", "delegate"]),
});

export const validatorSchema = z.object({
  address: z.string(),
  name: z.string(),
  region: z.enum(["Americas", "Europe", "Asia", "Africa"]),
  stake: z.string(),
  delegatedStake: z.string(),
  commission: z.number(),
  uptime: z.number(),
  blocksProduced: z.number(),
  status: z.enum(["active", "inactive", "jailed"]),
  rank: z.number(),
  latency: z.number(),
});

export const networkStatusSchema = z.object({
  chainId: z.string(),
  network: z.string(),
  blockHeight: z.number(),
  tps: z.number(),
  peakTps: z.number(),
  activeValidators: z.number(),
  totalValidators: z.number(),
  totalSupply: z.string(),
  circulatingSupply: z.string(),
  totalStaked: z.string(),
  averageBlockTime: z.number(),
  networkVersion: z.string(),
  epoch: z.number(),
  bondedRatio: z.number(),
  totalTransactions: z.number(),
});

export const walletSchema = z.object({
  address: z.string(),
  balance: z.string(),
  stakedBalance: z.string(),
  nonce: z.number(),
  transactions: z.array(transactionSchema),
  network: z.string().optional(),
});

export const sendTransactionSchema = z.object({
  from: z.string(),
  to: z.string(),
  amount: z.string(),
  network: z.string(),
});

export type Block = z.infer<typeof blockSchema>;
export type Transaction = z.infer<typeof transactionSchema>;
export type Validator = z.infer<typeof validatorSchema>;
export type NetworkStatus = z.infer<typeof networkStatusSchema>;
export type Wallet = z.infer<typeof walletSchema>;
export type SendTransaction = z.infer<typeof sendTransactionSchema>;
