import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Copy, Check, ArrowDownLeft } from "lucide-react";
import { useState, useEffect } from "react";
import QRCode from "react-qr-code";
import { getSeedPhrase } from "@/lib/pin-security";
import { deriveEvmFromSeed, deriveSolanaFromSeed } from "@/lib/bip44";
import { deriveEvmAddress, deriveSolanaAddress } from "@/lib/chain-utils";
import { SiEthereum, SiSolana } from "react-icons/si";

const zerithLogoPath = "/zerith-logo.png";

type Chain = "zerith" | "evm" | "solana";

export default function WalletReceive() {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [chain, setChain] = useState<Chain>("zerith");
  const zthAddress = localStorage.getItem("zerith-wallet-address") ?? "";

  const [evmAddress, setEvmAddress] = useState("");
  const [solanaAddress, setSolanaAddress] = useState("");

  useEffect(() => {
    if (!zthAddress) return;
    const sp = getSeedPhrase(zthAddress);
    if (sp) {
      setEvmAddress(deriveEvmFromSeed(sp));
      setSolanaAddress(deriveSolanaFromSeed(sp));
    } else {
      setEvmAddress(deriveEvmAddress(zthAddress));
      setSolanaAddress(deriveSolanaAddress(zthAddress));
    }
  }, [zthAddress]);

  const activeAddress =
    chain === "evm" ? evmAddress :
    chain === "solana" ? solanaAddress :
    zthAddress;

  const chainLabel =
    chain === "evm" ? "EVM (Ethereum)" :
    chain === "solana" ? "Solana" :
    "Zerith Chain";

  const qrValue = activeAddress || " ";

  const copy = () => {
    if (!activeAddress) return;
    navigator.clipboard.writeText(activeAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
    toast({ title: "Address copied", description: `${chainLabel} address copied.` });
  };

  if (!zthAddress) {
    return (
      <div className="p-6 text-center py-16">
        <ArrowDownLeft className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
        <h2 className="text-lg font-semibold">No Wallet Connected</h2>
        <Button variant="outline" size="sm" asChild className="mt-4">
          <Link href="/">Open Wallet</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full bg-background">
      <div className="border-b border-border px-4 py-3 flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild className="p-1">
          <Link href="/"><ArrowLeft className="w-4 h-4" /></Link>
        </Button>
        <ArrowDownLeft className="w-4 h-4 text-muted-foreground" />
        <h1 className="font-semibold">Receive</h1>
      </div>

      <div className="p-4 max-w-sm mx-auto w-full space-y-4">
        <div className="flex rounded-xl bg-secondary p-1 gap-1">
          <button
            onClick={() => setChain("zerith")}
            data-testid="tab-receive-zerith"
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all ${chain === "zerith" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}
          >
            <img src={zerithLogoPath} alt="ZTH" className="w-3.5 h-3.5 rounded-full" />
            Zerith
          </button>
          <button
            onClick={() => setChain("evm")}
            data-testid="tab-receive-evm"
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all ${chain === "evm" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}
          >
            <SiEthereum className="w-3 h-3" style={{ color: "#627EEA" }} />
            EVM
          </button>
          <button
            onClick={() => setChain("solana")}
            data-testid="tab-receive-solana"
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all ${chain === "solana" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}
          >
            <SiSolana className="w-3 h-3" style={{ color: "#9945FF" }} />
            Solana
          </button>
        </div>

        <div className="flex flex-col items-center bg-card border border-card-border rounded-2xl p-5 gap-4 shadow-sm">
          <p className="text-sm font-medium text-foreground">{chainLabel}</p>
          <div className="p-3 bg-white rounded-xl" data-testid="qr-code-display">
            <QRCode
              value={qrValue}
              size={200}
              bgColor="#ffffff"
              fgColor="#000000"
              level="M"
            />
          </div>
          <p className="text-xs text-muted-foreground text-center">
            {chain === "zerith" && "Scan to receive ZTH on Zerith Chain"}
            {chain === "evm" && "Scan to receive tokens on Ethereum / EVM chains"}
            {chain === "solana" && "Scan to receive tokens on Solana"}
          </p>
        </div>

        <div className="bg-card border border-card-border rounded-2xl p-4 space-y-3 shadow-sm">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your Address</p>
          <div className="bg-secondary rounded-xl p-3">
            <code className="text-xs font-mono break-all text-foreground/80" data-testid="receive-address">
              {activeAddress || "Deriving address…"}
            </code>
          </div>
          <Button className="w-full rounded-xl" onClick={copy} data-testid="button-copy-receive-address">
            {copied ? (
              <><Check className="w-4 h-4 mr-2 text-green-400" />Copied</>
            ) : (
              <><Copy className="w-4 h-4 mr-2" />Copy Address</>
            )}
          </Button>
        </div>

        <div className="p-3 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
          <p className="text-xs text-amber-700 dark:text-amber-400">
            {chain === "zerith" && "Only send ZTH to this address. Sending other assets may result in permanent loss."}
            {chain === "evm" && "Only send EVM-compatible tokens (ETH, BNB, MATIC, etc.) to this address."}
            {chain === "solana" && "Only send SOL and SPL tokens to this address."}
          </p>
        </div>
      </div>
    </div>
  );
}
