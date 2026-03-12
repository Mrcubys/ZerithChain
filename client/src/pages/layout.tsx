import { Link, useLocation } from "wouter";
  import { Wallet, ExternalLink } from "lucide-react";
  import zerithLogo from "@assets/zerith-logo_1773200744409.png";

  export default function Layout({ children }: { children: React.ReactNode }) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white flex flex-col">
        <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3" data-testid="link-home">
              <img src={zerithLogo} alt="Zerith" className="h-9 w-9 rounded-full" />
              <div>
                <span className="font-bold text-lg tracking-tight text-white">ZerithWallet</span>
                <span className="block text-[10px] text-emerald-400 font-medium -mt-0.5">Multi-Chain Wallet</span>
              </div>
            </Link>
            <div className="flex items-center gap-3">
              <a
                href="https://zerithscan.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
                data-testid="link-explorer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Explorer
              </a>
              <a
                href="https://testnet-zerithscan.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
                data-testid="link-testnet"
              >
                Testnet Explorer
              </a>
            </div>
          </div>
        </header>
        <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8">
          {children}
        </main>
        <footer className="border-t border-white/5 py-4 mt-auto">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src={zerithLogo} alt="Zerith" className="h-4 w-4 rounded-full opacity-60" />
              <span className="text-xs text-slate-500">ZerithWallet — Multi-Chain Web Wallet</span>
            </div>
            <span className="text-xs text-slate-600">Powered by Zerith Chain</span>
          </div>
        </footer>
      </div>
    );
  }
  