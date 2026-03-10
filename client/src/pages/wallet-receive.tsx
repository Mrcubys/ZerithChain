import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ArrowDownLeft, Copy, Share2 } from "lucide-react";
import { shortAddress, DEMO_WALLET_ADDRESS } from "@/lib/chain-utils";
import { useToast } from "@/hooks/use-toast";

export default function WalletReceive() {
  const { toast } = useToast();
  const address = localStorage.getItem("zerith-wallet-address") || DEMO_WALLET_ADDRESS;
  const network = localStorage.getItem("zerith-network") || "mainnet";

  const copy = () => {
    navigator.clipboard.writeText(address);
    toast({ title: "Copied", description: "Wallet address copied to clipboard." });
  };

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(address)}&bgcolor=000000&color=00d4ff&margin=10`;

  return (
    <div className="flex flex-col h-full overflow-auto">
      <div className="border-b border-border/50 px-6 py-5">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/wallet"><ArrowLeft className="w-4 h-4 mr-1" />Wallet</Link>
          </Button>
          <Separator orientation="vertical" className="h-4" />
          <ArrowDownLeft className="w-5 h-5 text-neon-cyan" />
          <h1 className="font-display text-xl font-bold">Receive ZTH</h1>
          <Badge variant="secondary" className="ml-auto capitalize text-xs">{network}</Badge>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-sm mx-auto space-y-5">
          <Card>
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="p-3 rounded-md bg-white mb-4">
                <img
                  src={qrUrl}
                  alt="Wallet QR Code"
                  className="w-48 h-48"
                  data-testid="img-qr-code"
                />
              </div>
              <p className="text-sm text-muted-foreground mb-2">Scan to send ZTH to this address</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Your {network} address</CardTitle>
            </CardHeader>
            <CardContent className="pb-5">
              <div className="flex gap-2">
                <Input
                  value={address}
                  readOnly
                  className="font-mono text-xs bg-muted"
                  data-testid="input-wallet-address"
                />
                <Button size="icon" variant="secondary" onClick={copy} data-testid="button-copy-address">
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Only send ZTH tokens to this address. Sending other tokens may result in permanent loss.
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="secondary" onClick={copy} data-testid="button-copy-address-2">
              <Copy className="w-4 h-4 mr-1.5" />
              Copy Address
            </Button>
            <Button variant="outline" data-testid="button-share">
              <Share2 className="w-4 h-4 mr-1.5" />
              Share
            </Button>
          </div>

          <div className="rounded-md border border-border/50 bg-card p-4 space-y-2">
            <p className="text-xs font-semibold text-foreground">Network Information</p>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Chain ID</span>
                <span className="font-mono">zerith-{network}-1</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Symbol</span>
                <span className="font-semibold text-primary">ZTH</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">RPC URL</span>
                <span className="font-mono text-muted-foreground truncate max-w-[140px]">
                  {network === "mainnet" ? "rpc.zerith.replit.com" : "testnet-rpc.zerith.replit.com"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
