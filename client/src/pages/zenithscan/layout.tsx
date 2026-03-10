import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Layers, ArrowRightLeft, Shield, Wallet, Menu, X } from "lucide-react";

function ZenithScanHeader() {
  const [query, setQuery] = useState("");
  const [, navigate] = useLocation();
  const network = localStorage.getItem("zerith-network") ?? "mainnet";

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    if (/^\d+$/.test(q)) {
      navigate(`/scan/block/${q}`);
    } else if (q.length === 64 && /^[0-9A-Fa-f]+$/.test(q)) {
      navigate(`/scan/tx/${q}`);
    } else {
      navigate(`/scan/address/${q}`);
    }
    setQuery("");
  };

  return (
    <header className="bg-white border-b border-border/60 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-4 h-14">
          <Link href="/scan" className="flex items-center gap-2 flex-shrink-0" data-testid="link-zenithscan-home">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Search className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-base text-foreground tracking-tight hidden sm:block">
              ZenithScan
            </span>
          </Link>

          <form onSubmit={handleSearch} className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search by block / tx hash / address…"
                className="pl-9 h-9 text-sm rounded-xl bg-muted/40 border-border/60 focus-visible:ring-primary/30"
                data-testid="input-scan-search"
              />
            </div>
          </form>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge
              variant="outline"
              className={`text-[10px] font-semibold capitalize hidden sm:flex ${network === "mainnet" ? "border-green-300 text-green-700 bg-green-50" : "border-yellow-300 text-yellow-700 bg-yellow-50"}`}
              data-testid="badge-scan-network"
            >
              {network}
            </Badge>
            <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground text-xs h-8 px-2.5">
              <Link href="/" data-testid="link-open-wallet">
                <Wallet className="w-3.5 h-3.5 mr-1" />
                <span className="hidden sm:inline">Wallet</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="border-t border-border/40 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <nav className="flex items-center gap-1 h-10 overflow-x-auto scrollbar-hide">
            <ScanNavLink href="/scan" exact icon={<Search className="w-3.5 h-3.5" />} label="Home" testId="nav-scan-home" />
            <ScanNavLink href="/scan/blocks" icon={<Layers className="w-3.5 h-3.5" />} label="Blocks" testId="nav-scan-blocks" />
            <ScanNavLink href="/scan/txs" icon={<ArrowRightLeft className="w-3.5 h-3.5" />} label="Transactions" testId="nav-scan-txs" />
            <ScanNavLink href="/scan/validators" icon={<Shield className="w-3.5 h-3.5" />} label="Validators" testId="nav-scan-validators" />
          </nav>
        </div>
      </div>
    </header>
  );
}

function ScanNavLink({ href, icon, label, exact, testId }: { href: string; icon: React.ReactNode; label: string; exact?: boolean; testId?: string }) {
  const [location] = useLocation();
  const active = exact ? location === href : location.startsWith(href);
  return (
    <Link
      href={href}
      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/60"}`}
      data-testid={testId}
    >
      {icon}
      {label}
    </Link>
  );
}

interface ZenithScanLayoutProps {
  children: React.ReactNode;
}

export function ZenithScanLayout({ children }: ZenithScanLayoutProps) {
  return (
    <div className="min-h-screen bg-muted/20 flex flex-col">
      <ZenithScanHeader />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">
        {children}
      </main>
      <footer className="border-t border-border/40 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs text-muted-foreground">ZenithScan — Zerith Chain Block Explorer</span>
          <span className="text-xs text-muted-foreground font-mono">Zerith Chain v1.0</span>
        </div>
      </footer>
    </div>
  );
}
