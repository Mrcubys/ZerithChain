import { Link, useLocation } from "wouter";
import { Blocks, ArrowLeftRight, Users, Home, Search, Wallet } from "lucide-react";
import { useState } from "react";
import zerithLogo from "@assets/zerith-logo_1773195626329.png";

function SearchBar() {
  const [query, setQuery] = useState("");
  const [, setLocation] = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    if (/^\d+$/.test(q)) {
      setLocation(`/block/${q}`);
    } else if (q.startsWith("zth")) {
      setLocation(`/address/${q}`);
    } else if (q.startsWith("0x") && q.length === 42) {
      setLocation(`/address/${q}`);
    } else if ((q.startsWith("0x") && q.length === 66) || /^[0-9a-fA-F]{64}$/.test(q)) {
      setLocation(`/tx/${q}`);
    } else {
      setLocation(`/address/${q}`);
    }
    setQuery("");
  };

  return (
    <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1 max-w-xl">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          data-testid="input-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search block, tx hash, ZTH address…"
          className="w-full pl-9 pr-4 h-9 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
        />
      </div>
      <button
        data-testid="button-search-submit"
        type="submit"
        className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        Search
      </button>
    </form>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/wallet", label: "Wallet", icon: Wallet },
    { href: "/blocks", label: "Blocks", icon: Blocks },
    { href: "/txs", label: "Txs", icon: ArrowLeftRight },
    { href: "/validators", label: "Validators", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-6">
          <Link href="/" data-testid="link-home-logo">
            <div className="flex items-center gap-2 shrink-0">
              <img src={zerithLogo} alt="ZerithChain" className="h-8 w-auto" />
              <span className="font-bold text-foreground text-sm tracking-tight">ZerithWallet</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const isActive = href === "/" ? location === "/" : location.startsWith(href);
              return (
                <Link key={href} href={href}>
                  <span
                    data-testid={`link-nav-${label.toLowerCase()}`}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                      isActive
                        ? "bg-primary/15 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="flex-1 flex justify-end md:justify-start">
            <SearchBar />
          </div>
        </div>

        <div className="md:hidden border-t border-border bg-card">
          <div className="max-w-7xl mx-auto px-4 flex items-center gap-0 overflow-x-auto">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const isActive = href === "/" ? location === "/" : location.startsWith(href);
              return (
                <Link key={href} href={href}>
                  <span
                    className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium whitespace-nowrap transition-colors cursor-pointer border-b-2 ${
                      isActive
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {children}
      </main>

      <footer className="border-t border-border bg-card/50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <img src={zerithLogo} alt="ZerithChain" className="h-4 w-auto" />
            <span>ZerithWallet — Zerith Chain Wallet & Explorer</span>
          </div>
          <span>Zerith Chain v1.0.0</span>
        </div>
      </footer>
    </div>
  );
}
