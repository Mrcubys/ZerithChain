import { z } from "zod";

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
