import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { SUPPORTED_NETWORKS, type CustomToken, formatTokenBalance } from "@/lib/chain-utils";
import { Search, AlertCircle, CheckCircle2, ChevronDown } from "lucide-react";

interface TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  contractAddress: string;
  network: string;
  networkLabel: string;
  logoUrl: string | null;
  price: number | null;
}

interface Props {
  open: boolean;
  onClose: () => void;
  walletAddress: string;
  evmAddress: string;
  solanaAddress: string;
  onAdd: (token: CustomToken) => void;
}

export function AddTokenModal({ open, onClose, walletAddress, evmAddress, solanaAddress, onAdd }: Props) {
  const { toast } = useToast();
  const [network, setNetwork] = useState("ethereum");
  const [contract, setContract] = useState("");
  const [looking, setLooking] = useState(false);
  const [preview, setPreview] = useState<TokenInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [networkOpen, setNetworkOpen] = useState(false);

  const selectedNetwork = SUPPORTED_NETWORKS.find(n => n.id === network) ?? SUPPORTED_NETWORKS[0];

  const handleLookup = async () => {
    const addr = contract.trim();
    if (!addr) return;
    setLooking(true);
    setPreview(null);
    setError(null);
    try {
      const res = await fetch(`/api/token/lookup?network=${encodeURIComponent(network)}&contract=${encodeURIComponent(addr)}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Token not found");
      } else {
        setPreview(data as TokenInfo);
      }
    } catch {
      setError("Network error — please try again");
    } finally {
      setLooking(false);
    }
  };

  const handleAdd = async () => {
    if (!preview) return;
    const walletForBalance = network === "solana" ? solanaAddress : evmAddress;
    let balance = "0";
    let balanceFormatted = "0";
    try {
      const r = await fetch(`/api/token/balance?network=${network}&contract=${encodeURIComponent(preview.contractAddress)}&wallet=${encodeURIComponent(walletForBalance)}`);
      if (r.ok) {
        const d = await r.json();
        balance = d.balance ?? "0";
        balanceFormatted = formatTokenBalance(balance, preview.decimals);
      }
    } catch {}

    const token: CustomToken = {
      id: `${network}:${preview.contractAddress.toLowerCase()}`,
      name: preview.name,
      symbol: preview.symbol,
      decimals: preview.decimals,
      contractAddress: preview.contractAddress,
      network: preview.network,
      networkLabel: preview.networkLabel,
      logoUrl: preview.logoUrl,
      price: preview.price,
      balance,
      balanceFormatted,
      addedAt: Date.now(),
    };
    onAdd(token);
    toast({ title: `${token.symbol} added`, description: `${token.name} on ${token.networkLabel}` });
    setContract("");
    setPreview(null);
    setError(null);
    onClose();
  };

  const handleClose = () => {
    setContract("");
    setPreview(null);
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={o => !o && handleClose()}>
      <DialogContent className="max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle>Add Custom Token</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Network</Label>
            <div className="relative">
              <button
                onClick={() => setNetworkOpen(v => !v)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-border bg-background hover:bg-muted/40 transition-colors text-sm"
                data-testid="select-network"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ background: selectedNetwork.color }}
                  />
                  <span>{selectedNetwork.label}</span>
                  <span className="text-muted-foreground text-xs">({selectedNetwork.symbol})</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${networkOpen ? "rotate-180" : ""}`} />
              </button>
              {networkOpen && (
                <div className="absolute top-full mt-1 left-0 right-0 bg-background border border-border rounded-xl shadow-lg z-50 overflow-hidden max-h-56 overflow-y-auto">
                  {SUPPORTED_NETWORKS.map(n => (
                    <button
                      key={n.id}
                      onClick={() => { setNetwork(n.id); setNetworkOpen(false); setPreview(null); setError(null); }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-muted/50 transition-colors ${n.id === network ? "bg-muted/50 font-medium" : ""}`}
                      data-testid={`option-network-${n.id}`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: n.color }} />
                      <span>{n.label}</span>
                      <span className="text-muted-foreground text-xs ml-auto">{n.symbol}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">
              {network === "solana" ? "Token Mint Address" : "Contract Address"}
            </Label>
            <div className="flex gap-2">
              <input
                className="flex-1 px-3 py-2.5 text-xs font-mono rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground"
                placeholder={network === "solana" ? "EPjFWdd5Auf..." : "0xa0b869..."}
                value={contract}
                onChange={e => { setContract(e.target.value); setPreview(null); setError(null); }}
                data-testid="input-contract-address"
                onKeyDown={e => e.key === "Enter" && handleLookup()}
              />
              <Button
                variant="outline"
                className="px-3 rounded-xl border-border flex-shrink-0"
                onClick={handleLookup}
                disabled={!contract.trim() || looking}
                data-testid="button-lookup-token"
              >
                {looking ? (
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              {network === "solana" ? "Solana SPL token mint address" : "ERC-20 contract address on " + selectedNetwork.label}
            </p>
          </div>

          {looking && (
            <div className="rounded-xl border border-border p-3 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-32" />
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-red-700">Token not found</p>
                <p className="text-[10px] text-red-600 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {preview && (
            <div className="rounded-xl border border-green-200 bg-green-50/50 p-3 space-y-2" data-testid="token-preview">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                <p className="text-xs font-medium text-green-700">Token found</p>
              </div>
              <div className="flex items-center gap-3 pt-1">
                {preview.logoUrl ? (
                  <img src={preview.logoUrl} alt={preview.symbol} className="w-10 h-10 rounded-full object-cover border border-border flex-shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-bold flex-shrink-0" style={{ background: selectedNetwork.color + "20", color: selectedNetwork.color }}>
                    {preview.symbol.slice(0, 2)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{preview.name}</p>
                  <p className="text-xs text-muted-foreground">{preview.symbol} · {preview.networkLabel} · {preview.decimals} decimals</p>
                  {preview.price != null && (
                    <p className="text-xs text-green-700 font-medium">${preview.price.toFixed(4)} USD</p>
                  )}
                </div>
              </div>
              <p className="text-[10px] font-mono text-muted-foreground break-all">{preview.contractAddress}</p>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <Button variant="outline" onClick={handleClose} className="flex-1 rounded-xl border-border">
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={!preview} className="flex-1 rounded-xl" data-testid="button-confirm-add-token">
              Add Token
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
