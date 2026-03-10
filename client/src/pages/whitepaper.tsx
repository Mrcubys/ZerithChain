import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BookOpen, Zap, Shield, Globe, Coins, Code2, Clock, TrendingUp } from "lucide-react";

const sections = [
  {
    id: "introduction",
    title: "1. Introduction",
    icon: <BookOpen className="w-5 h-5 text-primary" />,
    content: `Zerith Chain is a high-performance, decentralized Layer-1 blockchain protocol designed to power the next generation of decentralized applications. Built with security, scalability, and developer accessibility at its core, Zerith Chain provides the infrastructure necessary for a thriving digital economy.

Our vision is to create a blockchain ecosystem where fast transactions, secure smart contracts, and developer-friendly tools converge to enable innovation at scale. Zerith Chain targets 5,000+ TPS with ~2 second block finality, making it suitable for enterprise applications, DeFi protocols, NFT platforms, and Web3 gaming.`,
  },
  {
    id: "overview",
    title: "2. Zerith Chain Overview",
    icon: <Globe className="w-5 h-5 text-neon-cyan" />,
    content: `Zerith Chain is a Layer-1 blockchain that operates its own independent consensus mechanism, validator network, and native token economy. Unlike Layer-2 solutions that rely on Ethereum or other base chains for security, Zerith Chain is entirely self-sovereign.

Key differentiators:
• ZPoS Consensus: Zerith Proof of Stake with fast finality and slashing protection
• Developer SDK: First-class support for Rust, Go, and TypeScript smart contracts  
• bech32 Addresses: Human-readable addresses with zth1 prefix for clarity
• EVM Compatibility: Support for Ethereum tooling and existing smart contracts
• Built-in Governance: On-chain proposals and voting for protocol upgrades`,
  },
  {
    id: "features",
    title: "3. Core Features",
    icon: <Zap className="w-5 h-5 text-neon-blue" />,
    features: [
      { icon: "⚡", title: "Fast Block Time", desc: "~2 second block finality ensures near-instant transaction confirmation" },
      { icon: "📈", title: "High Throughput", desc: "5,000+ TPS with horizontal sharding capabilities for future scaling" },
      { icon: "🔒", title: "ZPoS Security", desc: "Validator staking with slashing ensures honest behavior across the network" },
      { icon: "🛠️", title: "Developer SDK", desc: "Comprehensive APIs, CLI tools, and smart contract frameworks" },
      { icon: "🌐", title: "Web3 Compatible", desc: "Full compatibility with MetaMask and existing Web3 wallet infrastructure" },
      { icon: "📱", title: "Mobile Ready", desc: "Native mobile SDKs for iOS and Android integration" },
    ],
  },
  {
    id: "token",
    title: "4. Zerith Token (ZTH)",
    icon: <Coins className="w-5 h-5 text-neon-green" />,
    tokenomics: [
      { label: "Token Symbol", value: "ZTH" },
      { label: "Decimals", value: "18" },
      { label: "Initial Supply", value: "1,000,000,000 ZTH" },
      { label: "Circulating Supply", value: "350,000,000 ZTH (35%)" },
      { label: "Staking Rewards", value: "7-15% APY" },
      { label: "Minimum Validator Stake", value: "50,000 ZTH" },
    ],
    allocation: [
      { label: "Ecosystem & Developer Fund", pct: 30, color: "bg-blue-500" },
      { label: "Staking Rewards", pct: 25, color: "bg-purple-500" },
      { label: "Foundation Reserve", pct: 15, color: "bg-cyan-500" },
      { label: "Public Sale", pct: 15, color: "bg-green-500" },
      { label: "Team & Advisors (4yr vest)", pct: 10, color: "bg-orange-500" },
      { label: "Seed & Private", pct: 5, color: "bg-red-500" },
    ],
    content: `ZTH serves multiple utility functions within the Zerith Chain ecosystem:

Gas Fees: Every transaction on Zerith Chain requires ZTH for gas payment, creating constant demand and ensuring spam prevention.

Staking: Validators and delegators stake ZTH to participate in consensus and earn rewards proportional to their contribution.

Governance: ZTH holders can propose and vote on protocol upgrades, parameter changes, and treasury allocations.

Ecosystem Rewards: Developers, validators, and early adopters receive ZTH incentives for contributing to network growth.`,
  },
  {
    id: "consensus",
    title: "5. Consensus Mechanism — ZPoS",
    icon: <Shield className="w-5 h-5 text-neon-purple" />,
    content: `Zerith Proof of Stake (ZPoS) is Zerith Chain's proprietary consensus mechanism, combining the energy efficiency of Proof of Stake with Byzantine Fault Tolerance (BFT) for fast finality.

Block Proposer Rotation: Every 2 seconds, a validator is selected as block proposer using a Verifiable Random Function (VRF). Selection probability is weighted by staked ZTH amount.

Finality: Blocks achieve instant finality once 2/3+ of validators sign the block. Unlike Bitcoin's probabilistic finality, ZPoS provides deterministic finality within one block.

Slashing: Validators face financial penalties (slashing) for:
• Double signing: Signing two different blocks at the same height (-5% stake)
• Extended downtime: Offline for >1% of blocks in an epoch (-0.01% stake per missed block)
• Malicious behavior: Attempting Byzantine attacks (-100% stake, permanent jail)

Delegation: Token holders who cannot run full validator nodes can delegate their stake to trusted validators and share in staking rewards minus commission.`,
  },
  {
    id: "architecture",
    title: "6. Network Architecture",
    icon: <Code2 className="w-5 h-5 text-blue-400" />,
    nodeTypes: [
      { type: "Validator Nodes", count: "Up to 100", desc: "Participate in consensus, produce blocks, earn staking rewards. Require 50,000+ ZTH stake.", icon: Shield },
      { type: "Full Nodes", count: "Unlimited", desc: "Store complete blockchain history, validate transactions, relay data. No staking required.", icon: Globe },
      { type: "RPC Nodes", count: "Unlimited", desc: "Serve API requests from wallets and dApps. Can be run by any developer.", icon: Code2 },
      { type: "Archive Nodes", count: "Unlimited", desc: "Store complete historical state. Required for block explorers and analytics.", icon: BookOpen },
    ],
    content: `Zerith Chain implements a layered node architecture to ensure resilience, accessibility, and decentralization:

Validator Node Requirements:
• CPU: 8+ cores (3.0+ GHz)
• RAM: 32 GB minimum
• Storage: 1 TB NVMe SSD
• Bandwidth: 1 Gbps symmetric
• Uptime: 99%+ required to avoid slashing`,
  },
  {
    id: "security",
    title: "7. Security Model",
    icon: <Shield className="w-5 h-5 text-red-400" />,
    content: `Zerith Chain employs multiple layers of security to protect the network and its participants:

Cryptographic Foundations:
• Ed25519 signatures for validator key operations (fast and secure)
• BLS12-381 for aggregate signature verification (enables efficient multi-sig)
• SHA-256 for block hashing and Merkle tree construction
• AES-256-GCM for encrypted P2P communications

Validator Security:
• Hardware Security Module (HSM) support for key protection
• Remote signing capability to separate key storage from node operation
• Multi-party computation (MPC) for institutional validators

Network Validation:
• All transactions validated by proposer and 2/3+ of active validators
• Mempool spam protection via minimum gas price enforcement
• Rate limiting on RPC endpoints to prevent DDoS attacks
• Peer reputation system to isolate malicious nodes`,
  },
  {
    id: "roadmap",
    title: "8. Roadmap",
    icon: <TrendingUp className="w-5 h-5 text-orange-400" />,
    roadmap: [
      { phase: "Phase 1", title: "Core Development", date: "Q1 2025 — Completed", status: "completed", items: ["Blockchain core implementation in Rust/Go", "ZPoS consensus engine", "P2P networking with libp2p", "Developer CLI tools", "Initial smart contract VM"] },
      { phase: "Phase 2", title: "Testnet Launch", date: "Q2 2025 — Completed", status: "completed", items: ["Public testnet with faucet", "Block explorer deployment", "Web wallet release", "Developer documentation", "Bug bounty program"] },
      { phase: "Phase 3", title: "Validator Network", date: "Q3 2025 — Active", status: "active", items: ["21 genesis validators onboarded", "Staking protocol live", "Governance system launch", "Security audit completion", "Validator incentives program"] },
      { phase: "Phase 4", title: "Mainnet Launch", date: "Q1 2026", status: "upcoming", items: ["Full mainnet deployment", "ZTH token generation event", "DEX and DeFi protocols", "Cross-chain bridge (ETH)", "Mobile wallet apps"] },
      { phase: "Phase 5", title: "Ecosystem Expansion", date: "2026+", status: "upcoming", items: ["100 validator network", "NFT marketplace integration", "Enterprise partnerships", "Layer-2 rollup support", "DAO governance migration"] },
    ],
  },
];

export default function Whitepaper() {
  return (
    <div className="flex flex-col h-full overflow-auto">
      <div className="border-b border-border/50 px-6 py-8 bg-grid-pattern bg-grid relative">
        <div className="absolute inset-0 bg-hero-gradient pointer-events-none" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="secondary">v1.2 — March 2026</Badge>
            <Badge className="bg-green-500/10 text-green-400 border-green-500/20">Published</Badge>
          </div>
          <h1 className="font-display text-4xl font-bold text-foreground">Zerith Chain</h1>
          <p className="text-xl text-muted-foreground mt-1 font-light">Technical Whitepaper</p>
          <p className="text-muted-foreground text-sm mt-3 max-w-2xl">
            A high-performance Layer-1 blockchain protocol with Zerith Proof of Stake consensus,
            built for the next generation of decentralized applications.
          </p>
        </div>
      </div>

      <div className="flex-1 p-6 max-w-4xl mx-auto w-full space-y-6">
        {sections.map((section) => (
          <Card key={section.id} id={section.id} className="animate-fade-in">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                {section.icon}
                <h2 className="font-display text-xl font-bold">{section.title}</h2>
              </div>
              <Separator className="mb-4" />

              {section.content && (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {section.content.split("\n\n").map((para, i) => (
                    <p key={i} className="text-muted-foreground leading-relaxed mb-3 last:mb-0 whitespace-pre-line">{para}</p>
                  ))}
                </div>
              )}

              {section.features && (
                <div className="grid grid-cols-2 gap-3 mt-2 lg:grid-cols-3">
                  {section.features.map((f, i) => (
                    <div key={i} className="rounded-md border border-border/50 bg-card p-3">
                      <div className="text-lg mb-1">{f.icon}</div>
                      <div className="font-semibold text-sm mb-1">{f.title}</div>
                      <div className="text-xs text-muted-foreground">{f.desc}</div>
                    </div>
                  ))}
                </div>
              )}

              {section.tokenomics && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
                    {section.tokenomics.map((t, i) => (
                      <div key={i} className="rounded-md border border-border/50 bg-card p-3">
                        <div className="text-xs text-muted-foreground">{t.label}</div>
                        <div className="font-semibold text-sm mt-0.5 text-foreground">{t.value}</div>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="text-sm font-semibold mb-3">Token Allocation</div>
                    <div className="space-y-2">
                      {section.allocation?.map((a, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-sm flex-shrink-0 ${a.color}`} />
                          <div className="flex-1 bg-muted rounded-full h-2">
                            <div className={`h-2 rounded-full ${a.color}`} style={{ width: `${a.pct}%` }} />
                          </div>
                          <span className="text-xs text-muted-foreground w-8 text-right">{a.pct}%</span>
                          <span className="text-xs w-48">{a.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {section.content && (
                    <div className="text-muted-foreground text-sm whitespace-pre-line leading-relaxed">{section.content}</div>
                  )}
                </div>
              )}

              {section.nodeTypes && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {section.nodeTypes.map((n, i) => (
                      <div key={i} className="rounded-md border border-border/50 bg-card p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <n.icon className="w-4 h-4 text-primary" />
                          <div className="font-semibold text-sm">{n.type}</div>
                        </div>
                        <Badge variant="secondary" className="text-xs mb-2">{n.count}</Badge>
                        <p className="text-xs text-muted-foreground">{n.desc}</p>
                      </div>
                    ))}
                  </div>
                  {section.content && (
                    <div className="text-muted-foreground text-sm whitespace-pre-line leading-relaxed">{section.content}</div>
                  )}
                </div>
              )}

              {section.roadmap && (
                <div className="relative space-y-4">
                  {section.roadmap.map((phase, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          phase.status === "completed" ? "bg-green-500/20 text-green-400 border border-green-500/40" :
                          phase.status === "active" ? "bg-blue-500/20 text-blue-400 border border-blue-500/40 animate-pulse" :
                          "bg-muted text-muted-foreground border border-border/50"
                        }`}>
                          {i + 1}
                        </div>
                        {i < (section.roadmap?.length ?? 0) - 1 && (
                          <div className="w-px flex-1 mt-1 bg-border/50" />
                        )}
                      </div>
                      <div className="pb-4 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-display font-bold">{phase.phase}: {phase.title}</span>
                          <Badge variant={phase.status === "completed" ? "secondary" : phase.status === "active" ? "default" : "outline"} className="text-xs capitalize">
                            {phase.status}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mb-2">{phase.date}</div>
                        <ul className="space-y-1">
                          {phase.items.map((item, j) => (
                            <li key={j} className="text-sm text-muted-foreground flex items-center gap-2">
                              <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${phase.status === "completed" ? "bg-green-400" : phase.status === "active" ? "bg-blue-400" : "bg-muted-foreground/40"}`} />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
