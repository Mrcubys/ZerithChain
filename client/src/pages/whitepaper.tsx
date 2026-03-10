import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BookOpen, Zap, Shield, Globe, Coins, Code2, Clock, TrendingUp } from "lucide-react";

const sections = [
  {
    id: "introduction",
    title: "1. Introduction",
    icon: BookOpen,
    content: `Zerith Chain is a high-performance, decentralized Layer-1 blockchain designed to enable fast, secure, and developer-friendly decentralized applications at global scale.

The blockchain ecosystem faces a fundamental trilemma: balancing security, decentralization, and scalability. Zerith Chain addresses this through its Zerith Proof of Stake (ZPoS) consensus mechanism, enabling up to 5,000 transactions per second with 2-second block finality while maintaining a fully decentralized validator network of 100 global nodes.`,
  },
  {
    id: "overview",
    title: "2. Zerith Chain Overview",
    icon: Globe,
    content: `Zerith Chain is architected as a sovereign Layer-1 blockchain with native smart contract capabilities, a cross-chain bridge protocol, and a developer SDK.

Key differentiators compared to existing blockchains:
• 2-second block time with instant finality via ZPoS
• Native account abstraction for improved UX
• Built-in fee delegation for gasless transactions
• bech32-encoded addresses for improved readability
• BIP39/BIP44-compatible key derivation
• Modular architecture enabling protocol upgrades without hard forks`,
  },
  {
    id: "features",
    title: "3. Core Features",
    icon: Zap,
    content: `Fast Block Time: Zerith Chain targets a 2-second average block time, compared to Ethereum's 12 seconds and Bitcoin's 10 minutes. This enables near-instant transaction confirmation for end users.

High TPS: The network is designed for 5,000 TPS under normal conditions, with burst capacity up to 10,000 TPS using block-size optimization.

Developer SDK: A comprehensive SDK supporting JavaScript/TypeScript, Python, and Rust enables rapid dApp development. The SDK includes wallet libraries, smart contract templates, and testing frameworks.

Web3 Compatibility: Full EVM compatibility allows Ethereum dApps to deploy on Zerith Chain with minimal code changes.`,
  },
  {
    id: "tokenomics",
    title: "4. Zerith Token (ZTH)",
    icon: Coins,
    content: `Symbol: ZTH
Decimals: 18
Initial Supply: 1,000,000,000 ZTH
Genesis Date: March 10, 2026

Token Distribution:
• 35% — Circulating Supply (ecosystem, community)
• 25% — Foundation Reserve (long-term development)
• 20% — Validator Rewards (staking incentives over 10 years)
• 10% — Ecosystem Fund (grants, partnerships)
• 10% — Team & Advisors (4-year vesting, 1-year cliff)

Token Utility:
• Gas fees for transactions and smart contract execution
• Staking for validator participation (minimum 50,000 ZTH)
• Governance voting on protocol proposals
• Delegation to validators for passive staking rewards`,
  },
  {
    id: "consensus",
    title: "5. Consensus — ZPoS",
    icon: Shield,
    content: `Zerith Proof of Stake (ZPoS) is a delegated proof-of-stake mechanism with Byzantine Fault Tolerance (BFT) finality.

Validator Selection: Up to 100 validators are selected based on total staked ZTH (own stake + delegated stake). The top 100 stakers form the active validator set, rotated each epoch (every 1,000 blocks).

Block Production: Block proposers are selected using a weighted round-robin algorithm based on stake weight. Each block is signed by the proposer and confirmed by 2/3+ of the active validator set.

Fast Finality: Blocks are finalized within 2 block times (~4 seconds) once the BFT threshold is reached, providing guaranteed irreversibility.

Slashing: Validators face stake slashing for:
• Double signing: 5% slash
• Downtime (>5% missed blocks in epoch): 1% slash and temporary jailing
• Malicious behavior: Up to 100% slash and permanent ban`,
  },
  {
    id: "architecture",
    title: "6. Network Architecture",
    icon: Code2,
    content: `Zerith Chain operates a multi-tier node architecture:

Validator Nodes (100 max): Full consensus participants. Requirements: 8-core CPU, 32GB RAM, 1TB NVMe SSD, 1Gbps bandwidth. Must stake minimum 50,000 ZTH.

Full Nodes: Maintain a complete copy of the blockchain state. No staking required. Used by exchanges, wallets, and developers for reliable RPC access.

RPC Nodes: API gateway nodes serving wallet and dApp requests. Optimized for high read throughput with caching layers.

Archive Nodes: Store complete historical state at every block. Used for analytics, block explorers (ZenithScan), and audit tools.

P2P Network: Nodes communicate via libp2p with Kademlia DHT for peer discovery and gossipsub for block/transaction propagation.`,
  },
  {
    id: "security",
    title: "7. Security Model",
    icon: Shield,
    content: `Cryptographic Foundation: All signatures use Ed25519 (faster and more secure than ECDSA). Transaction hashes are SHA256 of concatenated fields: from_address + to_address + amount + nonce + timestamp.

Address Security: Addresses are bech32-encoded with a checksum, preventing typo-induced fund loss. All addresses share the "zth1" prefix on both mainnet and testnet.

Network Security: The network tolerates up to 33% Byzantine validators (f < n/3). An attacker would need to control >33% of all staked ZTH to disrupt consensus.

Smart Contract Security: All contracts are deployed through a secure sandbox with gas limits and execution timeouts. An automated auditing tool flags common vulnerabilities before deployment.

Key Management: Hardware wallet support (Ledger, Trezor) via standard BIP44 derivation paths. Multi-signature wallet support for institutional custody.`,
  },
  {
    id: "roadmap",
    title: "8. Roadmap",
    icon: TrendingUp,
    content: `Phase 1 — Development (Q1 2026): Core blockchain, consensus engine, wallet SDK, developer documentation, internal testnet.

Phase 2 — Public Testnet (Q2 2026): Open testnet launch, faucet, ZenithScan explorer, developer grants program, security audit.

Phase 3 — Validator Network (Q3 2026): Validator onboarding, staking platform, delegation support, cross-chain bridge (Ethereum, BNB Chain).

Phase 4 — Mainnet (Q4 2026): Mainnet genesis block, ZTH token launch, DEX integration, institutional custody support.

Phase 5 — Ecosystem Expansion (2027+): Smart contract marketplace, NFT standards, DAO governance framework, Layer-2 rollup support, additional cross-chain bridges.`,
  },
];

export default function Whitepaper() {
  return (
    <div className="flex flex-col min-h-full">
      <div className="border-b border-border px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-sm bg-secondary flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-muted-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Technical Whitepaper</h1>
            <p className="text-sm text-muted-foreground">Zerith Chain v1.0 — March 2026</p>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-4xl mx-auto w-full space-y-5">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-2xl font-display font-bold mb-2">Zerith Chain</h2>
            <p className="text-sm text-muted-foreground mb-4">A High-Performance Layer-1 Blockchain with ZPoS Consensus</p>
            <Separator className="mb-4" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              {[
                { icon: Zap, label: "5,000 TPS", sub: "Peak throughput" },
                { icon: Clock, label: "~2s", sub: "Block time" },
                { icon: Shield, label: "100", sub: "Max validators" },
                { icon: Coins, label: "1B ZTH", sub: "Total supply" },
              ].map((stat, i) => (
                <div key={i} className="p-3 rounded-sm bg-secondary/60">
                  <stat.icon className="w-4 h-4 text-muted-foreground mx-auto mb-1.5" />
                  <div className="font-semibold text-sm">{stat.label}</div>
                  <div className="text-xs text-muted-foreground">{stat.sub}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-3 sm:grid-cols-4">
          <div className="sm:col-span-1 space-y-1">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Contents</div>
            {sections.map(s => (
              <a key={s.id} href={`#${s.id}`} className="block text-xs text-muted-foreground hover:text-foreground py-1 transition-colors">
                {s.title}
              </a>
            ))}
          </div>
          <div className="sm:col-span-3 space-y-4">
            {sections.map((section) => (
              <Card key={section.id} id={section.id}>
                <CardContent className="p-5">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-7 h-7 rounded-sm bg-secondary flex items-center justify-center flex-shrink-0">
                      <section.icon className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                    <h2 className="font-semibold text-base">{section.title}</h2>
                  </div>
                  <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                    {section.content}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
