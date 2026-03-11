import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Layers, ArrowRightLeft, Shield, ExternalLink } from "lucide-react";

const WALLET_URL = import.meta.env.VITE_WALLET_URL ?? "https://zerithwallet.vercel.app";
const MAINNET_URL = import.meta.env.VITE_MAINNET_URL ?? "https://zerithscan.vercel.app";

function TestnetScanHeader() {
  const [query, setQuery] = useState("");
  const [, navigate] = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    if (/^\d+$/.test(q)) navigate(`/block/${q}`);
    else if (q.length === 64 && /^[0-9A-Fa-f]+$/.test(q)) navigate(`/tx/${q}`);
    else navigate(`/address/${q}`);
    setQuery("");
  };

  return (
    <header className="bg-white border-b border-amber-200/60 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-4 h-14">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0" data-testid="link-home">
            <img src="/zerith-logo.png" alt="ZerithScan Testnet" className="h-8 w-auto" />
            <div>
              <span className="font-bold text-base text-foreground tracking-tight hidden sm:block">ZerithScan</span>
              <span className="text-[10px] text-amber-600 font-semibold hidden sm:block">Testnet</span>
            </div>
          </Link>

          <form onSubmit={handleSearch} className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search block / tx hash / address…"
                className="pl-9 h-9 text-sm rounded-xl bg-amber-50/40 border-amber-200/60 focus-visible:ring-amber-400/30"
                data-testid="input-search"
              />
            </div>
          </form>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge variant="outline" className="text-[10px] font-semibold capitalize hidden sm:flex border-amber-300 text-amber-700 bg-amber-50">
              ⚗ Testnet
            </Badge>
            <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground text-xs h-8 px-2.5">
              <a href={MAINNET_URL} target="_blank" rel="noopener noreferrer" data-testid="link-mainnet">
                <span className="hidden sm:inline">Mainnet</span>
              </a>
            </Button>
            <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground text-xs h-8 px-2.5">
              <a href={WALLET_URL} target="_blank" rel="noopener noreferrer" data-testid="link-wallet">
                <ExternalLink className="w-3.5 h-3.5 mr-1" />
                <span className="hidden sm:inline">Wallet</span>
              </a>
            </Button>
          </div>
        </div>
      </div>

      <div className="border-t border-amber-200/40 bg-amber-50/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <nav className="flex items-center gap-1 h-10 overflow-x-auto">
            <ScanNavLink href="/" exact icon={<Search className="w-3.5 h-3.5" />} label="Home" testId="nav-home" />
            <ScanNavLink href="/blocks" icon={<Layers className="w-3.5 h-3.5" />} label="Blocks" testId="nav-blocks" />
            <ScanNavLink href="/txs" icon={<ArrowRightLeft className="w-3.5 h-3.5" />} label="Transactions" testId="nav-txs" />
            <ScanNavLink href="/validators" icon={<Shield className="w-3.5 h-3.5" />} label="Validators" testId="nav-validators" />
          </nav>
        </div>
      </div>
    </header>
  );
}

function ScanNavLink({ href, icon, label, exact, testId }: { href: string; icon: React.ReactNode; label: string; exact?: boolean; testId?: string }) {
  const [location] = useLocation();
  const active = exact ? location === href : location.startsWith(href) && href !== "/";
  const isHome = href === "/" && location === "/";
  return (
    <Link
      href={href}
      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${(active || isHome) ? "bg-amber-500/10 text-amber-700" : "text-muted-foreground hover:text-foreground hover:bg-muted/60"}`}
      data-testid={testId}
    >
      {icon}
      {label}
    </Link>
  );
}

export function ZenithScanLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-amber-50/10 flex flex-col">
      <TestnetScanHeader />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">
        {children}
      </main>
      <footer className="border-t border-amber-200/40 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <img src="/zerith-logo.png" alt="ZerithScan" className="h-4 w-auto" />
            <span className="text-xs text-muted-foreground">ZerithScan — Zerith Testnet Explorer</span>
          </div>
          <span className="text-xs text-muted-foreground font-mono">Chain ID: zerith-testnet-1</span>
        </div>
      </footer>
    </div>
  );
}
