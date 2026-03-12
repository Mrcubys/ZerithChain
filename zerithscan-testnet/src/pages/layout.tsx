import { useState } from "react";
  import { Link, useLocation } from "wouter";
  import { Search } from "lucide-react";

  const WALLET_URL = "https://zerithwallet.vercel.app";
  const MAINNET_URL = "https://zerithscan.vercel.app";

  function Header() {
    const [query, setQuery] = useState("");
    const [, navigate] = useLocation();
    const [loc] = useLocation();

    const handleSearch = (e: React.FormEvent) => {
      e.preventDefault();
      const q = query.trim();
      if (!q) return;
      if (/^\d+$/.test(q)) navigate(`/block/${q}`);
      else if (q.length === 64 && /^[0-9A-Fa-f]+$/.test(q)) navigate(`/tx/${q}`);
      else navigate(`/address/${q}`);
      setQuery("");
    };

    const navActive = (path: string, exact?: boolean) => {
      if (exact) return loc === path;
      return loc.startsWith(path) && path !== "/";
    };

    return (
      <>
        <div className="bg-[#21325b] text-white">
          <div className="max-w-[1400px] mx-auto px-4 flex items-center justify-between h-10 text-xs">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 text-[10px] font-bold uppercase tracking-wider">Testnet</span>
              <span>Chain ID: zerith-testnet-1</span>
            </div>
            <div className="flex items-center gap-4">
              <a href={WALLET_URL} className="hover:text-blue-300 transition-colors" data-testid="link-wallet">Wallet</a>
              <a href={MAINNET_URL} className="hover:text-blue-300 transition-colors" data-testid="link-mainnet">Mainnet</a>
            </div>
          </div>
        </div>
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-[1400px] mx-auto px-4">
            <div className="flex items-center justify-between h-[60px]">
              <Link href="/" className="flex items-center gap-2.5" data-testid="link-home">
                <img src="/zerith-logo.png" alt="ZerithScan" className="h-8 w-8" />
                <div className="leading-tight">
                  <span className="font-bold text-[17px] text-gray-900">ZerithScan</span>
                  <span className="inline-block ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-600">TESTNET</span>
                </div>
              </Link>
              <form onSubmit={handleSearch} className="flex-1 max-w-[520px] mx-6">
                <div className="relative">
                  <input
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Search by Address / Txn Hash / Block"
                    className="w-full h-[38px] pl-4 pr-10 text-[13px] rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
                    data-testid="input-search"
                  />
                  <button type="submit" className="absolute right-1 top-1 h-[30px] w-[30px] rounded-md bg-orange-500 hover:bg-orange-600 flex items-center justify-center transition-colors" data-testid="button-search">
                    <Search className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              </form>
            </div>
            <nav className="flex items-center gap-0.5 -mb-px">
              <NavLink href="/" label="Home" active={navActive("/", true)} testId="nav-home" />
              <NavLink href="/blocks" label="Blocks" active={navActive("/block")} testId="nav-blocks" />
              <NavLink href="/txs" label="Transactions" active={navActive("/tx")} testId="nav-txs" />
              <NavLink href="/validators" label="Validators" active={navActive("/validator")} testId="nav-validators" />
            </nav>
          </div>
        </header>
      </>
    );
  }

  function NavLink({ href, label, active, testId }: { href: string; label: string; active: boolean; testId: string }) {
    return (
      <Link
        href={href}
        className={`px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors ${active ? "border-orange-500 text-orange-600" : "border-transparent text-gray-600 hover:text-orange-600 hover:border-orange-300"}`}
        data-testid={testId}
      >
        {label}
      </Link>
    );
  }

  export function ZenithScanLayout({ children }: { children: React.ReactNode }) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex flex-col">
        <Header />
        <main className="flex-1 max-w-[1400px] mx-auto w-full px-4 py-6">
          {children}
        </main>
        <footer className="bg-[#21325b] text-gray-300 py-6 mt-auto">
          <div className="max-w-[1400px] mx-auto px-4 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <img src="/zerith-logo.png" alt="" className="h-4 w-4 opacity-70" />
              <span>ZerithScan &copy; 2026 | Zerith Chain Testnet Explorer</span>
            </div>
            <span className="text-gray-400">Powered by Zerith Chain v1.0.0</span>
          </div>
        </footer>
      </div>
    );
  }
  