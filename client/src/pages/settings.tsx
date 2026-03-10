import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/theme";
import { useToast } from "@/hooks/use-toast";
import { shortAddress } from "@/lib/chain-utils";
import {
  Sun, Moon, Globe, Shield, Info, ChevronRight, Copy, LogOut,
  Bell, Lock, Wallet, Check,
} from "lucide-react";

const WALLET_KEY = "zerith-wallet-address";
const NETWORK_KEY = "zerith-network";

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const [network, setNetwork] = useState(() => localStorage.getItem(NETWORK_KEY) ?? "mainnet");
  const address = localStorage.getItem(WALLET_KEY);

  const switchNetwork = (n: string) => {
    setNetwork(n);
    localStorage.setItem(NETWORK_KEY, n);
    toast({ title: `Switched to ${n}` });
  };

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast({ title: "Address copied" });
    }
  };

  const disconnect = () => {
    localStorage.removeItem(WALLET_KEY);
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-background border-b border-border px-5 pt-10 pb-4 sticky top-0 z-10">
        <h1 className="text-xl font-semibold">Settings</h1>
      </div>

      <div className="px-4 py-5 space-y-5">
        {address && (
          <section>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">Wallet</p>
            <Card className="rounded-2xl border-card-border shadow-sm">
              <CardContent className="p-0">
                <div className="flex items-center gap-3 px-4 py-4 border-b border-border/50">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Wallet className="w-4.5 h-4.5 text-primary" style={{ width: "18px", height: "18px" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">Connected Wallet</p>
                    <p className="text-xs text-muted-foreground font-mono truncate" data-testid="settings-address">{shortAddress(address, 8)}</p>
                  </div>
                  <button onClick={copyAddress} className="p-1.5 rounded-lg hover:bg-muted transition-colors" data-testid="settings-copy-address">
                    <Copy className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
                <button onClick={disconnect} className="w-full flex items-center gap-3 px-4 py-4 text-destructive hover:bg-destructive/5 transition-colors rounded-b-2xl" data-testid="button-disconnect-settings">
                  <LogOut className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm font-medium">Disconnect Wallet</span>
                </button>
              </CardContent>
            </Card>
          </section>
        )}

        <section>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">Network</p>
          <Card className="rounded-2xl border-card-border shadow-sm">
            <CardContent className="p-0">
              {["mainnet", "testnet"].map((n, i) => (
                <button key={n} onClick={() => switchNetwork(n)} className={`w-full flex items-center gap-3 px-4 py-4 hover:bg-muted/50 transition-colors ${i === 0 ? "border-b border-border/50" : ""} ${i === 0 ? "rounded-t-2xl" : "rounded-b-2xl"}`} data-testid={`settings-network-${n}`}>
                  <Globe className="w-4.5 h-4.5 text-muted-foreground flex-shrink-0" style={{ width: "18px", height: "18px" }} />
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium capitalize">{n}</p>
                    <p className="text-xs text-muted-foreground">zerith-{n}-1</p>
                  </div>
                  {network === n && <Check className="w-4 h-4 text-primary flex-shrink-0" />}
                </button>
              ))}
            </CardContent>
          </Card>
        </section>

        <section>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">Appearance</p>
          <Card className="rounded-2xl border-card-border shadow-sm">
            <CardContent className="p-0">
              <button onClick={toggleTheme} className="w-full flex items-center gap-3 px-4 py-4 hover:bg-muted/50 transition-colors rounded-2xl" data-testid="settings-theme-toggle">
                {theme === "light" ? (
                  <Moon className="w-4.5 h-4.5 text-muted-foreground flex-shrink-0" style={{ width: "18px", height: "18px" }} />
                ) : (
                  <Sun className="w-4.5 h-4.5 text-muted-foreground flex-shrink-0" style={{ width: "18px", height: "18px" }} />
                )}
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium">{theme === "light" ? "Dark Mode" : "Light Mode"}</p>
                  <p className="text-xs text-muted-foreground">Currently {theme}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            </CardContent>
          </Card>
        </section>

        <section>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">Security</p>
          <Card className="rounded-2xl border-card-border shadow-sm">
            <CardContent className="p-0">
              <div className="flex items-center gap-3 px-4 py-4 border-b border-border/50">
                <Lock className="w-4.5 h-4.5 text-muted-foreground flex-shrink-0" style={{ width: "18px", height: "18px" }} />
                <div className="flex-1">
                  <p className="text-sm font-medium">Auto-Lock</p>
                  <p className="text-xs text-muted-foreground">5 minutes of inactivity</p>
                </div>
                <span className="text-xs text-primary font-medium">5 min</span>
              </div>
              <div className="flex items-center gap-3 px-4 py-4 rounded-b-2xl">
                <Shield className="w-4.5 h-4.5 text-muted-foreground flex-shrink-0" style={{ width: "18px", height: "18px" }} />
                <div className="flex-1">
                  <p className="text-sm font-medium">ZPoS Consensus</p>
                  <p className="text-xs text-muted-foreground">Ed25519 signatures, SHA256 tx hashes</p>
                </div>
                <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">About</p>
          <Card className="rounded-2xl border-card-border shadow-sm">
            <CardContent className="p-0">
              {[
                { icon: Info, label: "Version", value: "v1.2.0" },
                { icon: Globe, label: "Chain ID", value: "zerith-mainnet-1" },
                { icon: Shield, label: "Consensus", value: "ZPoS" },
              ].map((row, i) => (
                <div key={i} className={`flex items-center gap-3 px-4 py-4 ${i < 2 ? "border-b border-border/50" : ""}`}>
                  <row.icon className="w-4.5 h-4.5 text-muted-foreground flex-shrink-0" style={{ width: "18px", height: "18px" }} />
                  <span className="flex-1 text-sm text-muted-foreground">{row.label}</span>
                  <span className="text-sm font-medium text-foreground">{row.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
