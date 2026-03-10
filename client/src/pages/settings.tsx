import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTheme } from "@/lib/theme";
import { useToast } from "@/hooks/use-toast";
import { shortAddress } from "@/lib/chain-utils";
import { getSeedPhrase, isPinSet, clearPin } from "@/lib/pin-security";
import { PinLock } from "@/components/pin-lock";
import {
  Sun, Moon, Globe, Shield, Info, ChevronRight, Copy, LogOut,
  Lock, Wallet, Check, Eye, EyeOff, Download, RefreshCw,
  Plug,
} from "lucide-react";

const WALLET_KEY = "zerith-wallet-address";
const NETWORK_KEY = "zerith-network";

const ZERITH_TESTNET = {
  name: "Zerith Testnet",
  chainId: "zerith-testnet-1",
  rpc: "https://rpc.zerith-testnet.io",
  explorer: "https://testnet.zerithscan.io",
  currency: "ZTH",
};

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const [network, setNetwork] = useState(() => localStorage.getItem(NETWORK_KEY) ?? "mainnet");
  const address = localStorage.getItem(WALLET_KEY);

  const [showPinVerify, setShowPinVerify] = useState<"seed" | "change-pin" | null>(null);
  const [seedRevealed, setSeedRevealed] = useState(false);
  const [seedVisible, setSeedVisible] = useState(false);
  const [changePinStep, setChangePinStep] = useState<"new" | null>(null);
  const [connectOpen, setConnectOpen] = useState(false);
  const [connected, setConnected] = useState(false);

  const seedPhrase = address ? getSeedPhrase(address) : null;

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

  const handleRevealSeed = () => {
    if (isPinSet()) {
      setShowPinVerify("seed");
    } else {
      setSeedRevealed(true);
    }
  };

  const handleChangePin = () => {
    if (isPinSet()) {
      setShowPinVerify("change-pin");
    } else {
      setChangePinStep("new");
    }
  };

  const handleConnect = () => setConnectOpen(true);

  const approveConnect = () => {
    setConnected(true);
    setConnectOpen(false);
    toast({ title: "Connected to Zerith Testnet", description: "zerith-testnet-1" });
  };

  const words = seedPhrase?.split(" ") ?? [];

  return (
    <div className="min-h-screen bg-background">
      {showPinVerify && (
        <PinLock
          mode="verify"
          onSuccess={() => {
            if (showPinVerify === "seed") { setSeedRevealed(true); }
            if (showPinVerify === "change-pin") { setChangePinStep("new"); }
            setShowPinVerify(null);
          }}
          onCancel={() => setShowPinVerify(null)}
        />
      )}

      {changePinStep === "new" && (
        <PinLock
          mode="setup"
          setupTitle="Set New Passkey"
          onSuccess={() => {
            setChangePinStep(null);
            toast({ title: "Passkey updated" });
          }}
          onCancel={() => setChangePinStep(null)}
        />
      )}

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
                    <Wallet className="text-primary" style={{ width: "18px", height: "18px" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">Connected Wallet</p>
                    <p className="text-xs text-muted-foreground font-mono truncate" data-testid="settings-address">{shortAddress(address, 8)}</p>
                  </div>
                  <button onClick={copyAddress} className="p-1.5 rounded-lg hover:bg-muted transition-colors" data-testid="settings-copy-address">
                    <Copy style={{ width: "16px", height: "16px" }} className="text-muted-foreground" />
                  </button>
                </div>
                <button onClick={disconnect} className="w-full flex items-center gap-3 px-4 py-4 text-destructive hover:bg-destructive/5 transition-colors rounded-b-2xl" data-testid="button-disconnect-settings">
                  <LogOut style={{ width: "18px", height: "18px" }} className="flex-shrink-0" />
                  <span className="text-sm font-medium">Disconnect Wallet</span>
                </button>
              </CardContent>
            </Card>
          </section>
        )}

        {address && (
          <section>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">Backup</p>
            <Card className="rounded-2xl border-card-border shadow-sm">
              <CardContent className="p-0">
                {!seedRevealed ? (
                  <button
                    onClick={handleRevealSeed}
                    className="w-full flex items-center gap-3 px-4 py-4 hover:bg-muted/50 transition-colors rounded-2xl"
                    data-testid="button-reveal-seed"
                  >
                    <Download style={{ width: "18px", height: "18px" }} className="text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium">Backup Seed Phrase</p>
                      <p className="text-xs text-muted-foreground">Tap to reveal your recovery phrase</p>
                    </div>
                    <ChevronRight style={{ width: "16px", height: "16px" }} className="text-muted-foreground" />
                  </button>
                ) : (
                  <div className="px-4 py-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium">Your Seed Phrase</p>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setSeedVisible(v => !v)} className="p-1.5 rounded-lg hover:bg-muted transition-colors" data-testid="button-toggle-seed-visibility">
                          {seedVisible ? <EyeOff style={{ width: "16px", height: "16px" }} className="text-muted-foreground" /> : <Eye style={{ width: "16px", height: "16px" }} className="text-muted-foreground" />}
                        </button>
                        <button
                          onClick={() => { navigator.clipboard.writeText(seedPhrase ?? ""); toast({ title: "Seed phrase copied" }); }}
                          className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                          data-testid="button-copy-seed"
                        >
                          <Copy style={{ width: "16px", height: "16px" }} className="text-muted-foreground" />
                        </button>
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 mb-3">
                      <p className="text-xs text-amber-700 font-medium">Never share this with anyone. Store it safely offline.</p>
                    </div>
                    {seedPhrase ? (
                      <div className="grid grid-cols-3 gap-1.5" data-testid="backup-seed-grid">
                        {words.map((word, i) => (
                          <div key={i} className="flex items-center gap-1.5 bg-secondary rounded-lg px-2 py-1.5">
                            <span className="text-[10px] text-muted-foreground w-4 text-right flex-shrink-0">{i + 1}</span>
                            <span className={`text-xs font-mono font-medium ${seedVisible ? "" : "blur-sm select-none"}`}>{word}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground text-center py-2">Seed phrase not stored for this wallet. Import or recreate to generate a backup.</p>
                    )}
                    <button onClick={() => setSeedRevealed(false)} className="mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors" data-testid="button-hide-seed">
                      Hide seed phrase
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        )}

        {address && (
          <section>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">Connect</p>
            <Card className="rounded-2xl border-card-border shadow-sm">
              <CardContent className="p-0">
                <button
                  onClick={handleConnect}
                  className="w-full flex items-center gap-3 px-4 py-4 hover:bg-muted/50 transition-colors rounded-2xl"
                  data-testid="button-connect-wallet"
                >
                  <Plug style={{ width: "18px", height: "18px" }} className={`flex-shrink-0 ${connected ? "text-green-500" : "text-muted-foreground"}`} />
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium">Connect to dApp</p>
                    <p className="text-xs text-muted-foreground">
                      {connected ? "Connected to zerith-testnet-1" : "Connect to Zerith Testnet dApps"}
                    </p>
                  </div>
                  {connected ? (
                    <span className="text-xs font-medium text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">Connected</span>
                  ) : (
                    <ChevronRight style={{ width: "16px", height: "16px" }} className="text-muted-foreground" />
                  )}
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
                  <Globe style={{ width: "18px", height: "18px" }} className="text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium capitalize">{n}</p>
                    <p className="text-xs text-muted-foreground">zerith-{n}-1</p>
                  </div>
                  {network === n && <Check style={{ width: "16px", height: "16px" }} className="text-primary flex-shrink-0" />}
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
                  <Moon style={{ width: "18px", height: "18px" }} className="text-muted-foreground flex-shrink-0" />
                ) : (
                  <Sun style={{ width: "18px", height: "18px" }} className="text-muted-foreground flex-shrink-0" />
                )}
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium">{theme === "light" ? "Dark Mode" : "Light Mode"}</p>
                  <p className="text-xs text-muted-foreground">Currently {theme}</p>
                </div>
                <ChevronRight style={{ width: "16px", height: "16px" }} className="text-muted-foreground" />
              </button>
            </CardContent>
          </Card>
        </section>

        <section>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">Security</p>
          <Card className="rounded-2xl border-card-border shadow-sm">
            <CardContent className="p-0">
              <div className="flex items-center gap-3 px-4 py-4 border-b border-border/50">
                <Lock style={{ width: "18px", height: "18px" }} className="text-muted-foreground flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Auto-Lock</p>
                  <p className="text-xs text-muted-foreground">Locks after 5 minutes of inactivity</p>
                </div>
                <span className="text-xs text-primary font-medium">5 min</span>
              </div>
              <button
                onClick={handleChangePin}
                className="w-full flex items-center gap-3 px-4 py-4 border-b border-border/50 hover:bg-muted/50 transition-colors"
                data-testid="button-change-pin"
              >
                <RefreshCw style={{ width: "18px", height: "18px" }} className="text-muted-foreground flex-shrink-0" />
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium">{isPinSet() ? "Change Passkey" : "Set Up Passkey"}</p>
                  <p className="text-xs text-muted-foreground">6-digit security PIN</p>
                </div>
                <ChevronRight style={{ width: "16px", height: "16px" }} className="text-muted-foreground" />
              </button>
              <div className="flex items-center gap-3 px-4 py-4 rounded-b-2xl">
                <Shield style={{ width: "18px", height: "18px" }} className="text-muted-foreground flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium">ZPoS Consensus</p>
                  <p className="text-xs text-muted-foreground">Ed25519 signatures, SHA256 tx hashes</p>
                </div>
                <Check style={{ width: "16px", height: "16px" }} className="text-green-500 flex-shrink-0" />
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
                  <row.icon style={{ width: "18px", height: "18px" }} className="text-muted-foreground flex-shrink-0" />
                  <span className="flex-1 text-sm text-muted-foreground">{row.label}</span>
                  <span className="text-sm font-medium text-foreground">{row.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </div>

      <Dialog open={connectOpen} onOpenChange={setConnectOpen}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plug className="w-4 h-4 text-primary" />
              Connect to dApp
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Network</span>
                <span className="text-xs font-medium">{ZERITH_TESTNET.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Chain ID</span>
                <span className="text-xs font-mono">{ZERITH_TESTNET.chainId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">RPC</span>
                <span className="text-xs font-mono truncate ml-4 text-right">{ZERITH_TESTNET.rpc}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Currency</span>
                <span className="text-xs font-medium">{ZERITH_TESTNET.currency}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Wallet</span>
                <span className="text-xs font-mono">{address ? shortAddress(address, 6) : "—"}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Allow this connection to sign transactions on Zerith Testnet?
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setConnectOpen(false)} className="flex-1 rounded-xl" data-testid="button-connect-cancel">
                Reject
              </Button>
              <Button onClick={approveConnect} className="flex-1 rounded-xl" data-testid="button-connect-approve">
                Approve
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
