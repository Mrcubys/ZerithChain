import { Link, useLocation } from "wouter";
import { useEffect, useRef, useState, useCallback } from "react";
import { Wallet, History, Globe, Settings, ChevronLeft, RotateCw, X, Lock, Copy, Check, Search } from "lucide-react";
const zerithLogoPath = "/zerith-logo.png";

const navItems = [
  { label: "Wallet", icon: Wallet, href: "/", match: ["/", "/wallet/send", "/wallet/receive"] },
  { label: "History", icon: History, href: "/history", match: ["/history"] },
  { label: "Browser", icon: Globe, href: "/explorer", match: ["/explorer", "/validators", "/stake", "/whitepaper"] },
  { label: "Settings", icon: Settings, href: "/settings", match: ["/settings"] },
];

const browserSubTabs = [
  { label: "Explorer", href: "/explorer" },
  { label: "Validators", href: "/validators" },
  { label: "Stake", href: "/stake" },
  { label: "Whitepaper", href: "/whitepaper" },
];

function getZerithUrl(location: string): string {
  if (location === "/explorer") return "zerith://explorer";
  if (location === "/validators") return "zerith://validators";
  if (location === "/stake") return "zerith://stake";
  if (location === "/whitepaper") return "zerith://whitepaper";
  if (location.startsWith("/explorer/block/")) return `zerith://explorer/block/${location.split("/")[3]}`;
  if (location.startsWith("/explorer/tx/")) return `zerith://explorer/tx/${location.split("/")[3]}`;
  if (location.startsWith("/explorer/address/")) return `zerith://explorer/address/${location.split("/")[3]}`;
  return `zerith://${location.slice(1)}`;
}

export function WalletBottomNav() {
  const [location] = useLocation();
  const isActive = (item: typeof navItems[0]) => {
    return item.match.some(m => m === "/" ? location === "/" : location.startsWith(m));
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border flex md:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      {navItems.map((item) => {
        const active = isActive(item);
        return (
          <Link key={item.label} href={item.href} className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors ${active ? "text-primary" : "text-muted-foreground"}`} data-testid={`nav-bottom-${item.label.toLowerCase()}`}>
            <item.icon className={`w-5 h-5 ${active ? "text-primary" : ""}`} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function WalletSidebar() {
  const [location] = useLocation();
  const isActive = (item: typeof navItems[0]) => {
    return item.match.some(m => m === "/" ? location === "/" : location.startsWith(m));
  };

  return (
    <aside className="hidden md:flex flex-col w-56 border-r border-border bg-background flex-shrink-0 min-h-screen">
      <div className="px-5 py-5 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 border border-border/40">
            <img src={zerithLogoPath} alt="Zerith" className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="font-semibold text-sm text-foreground">Zerith Wallet</div>
            <div className="text-xs text-muted-foreground">Zerith Chain</div>
          </div>
        </div>
      </div>

      <div className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const active = isActive(item);
          return (
            <Link key={item.label} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${active ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`} data-testid={`nav-sidebar-${item.label.toLowerCase()}`}>
              <item.icon className={`flex-shrink-0 ${active ? "text-primary" : ""}`} style={{ width: "18px", height: "18px" }} />
              <span className="text-sm">{item.label}</span>
              {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />}
            </Link>
          );
        })}
      </div>

      <div className="px-4 py-4 border-t border-border space-y-3">
        <Link href="/scan" className="flex items-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all" data-testid="nav-sidebar-zenithscan">
          <Search className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm">ZenithScan</span>
        </Link>
        <div className="flex items-center gap-1.5 px-3">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
          <span className="text-xs text-muted-foreground">Mainnet</span>
        </div>
      </div>
    </aside>
  );
}

export function BrowserChrome() {
  const [location, navigate] = useLocation();
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const prevLocation = useRef<string | null>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const zerithUrl = getZerithUrl(location);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const startLoading = useCallback(() => {
    clearTimers();
    setProgress(0);
    setLoading(true);
    const t1 = setTimeout(() => setProgress(25), 20);
    const t2 = setTimeout(() => setProgress(65), 150);
    const t3 = setTimeout(() => setProgress(90), 400);
    const t4 = setTimeout(() => setProgress(100), 700);
    const t5 = setTimeout(() => setLoading(false), 950);
    timersRef.current = [t1, t2, t3, t4, t5];
  }, [clearTimers]);

  useEffect(() => {
    if (prevLocation.current === null) {
      prevLocation.current = location;
      startLoading();
      return;
    }
    if (prevLocation.current !== location) {
      prevLocation.current = location;
      startLoading();
    }
    return clearTimers;
  }, [location, startLoading, clearTimers]);

  const handleBack = () => {
    window.history.back();
  };

  const handleRefresh = () => {
    startLoading();
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(zerithUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const activeTab = browserSubTabs.find(t => location.startsWith(t.href));

  return (
    <div className="bg-background sticky top-0 z-10 border-b border-border">
      <div className="px-4 pt-8 pb-2 flex items-center gap-2">
        <h1 className="text-lg font-semibold flex-shrink-0">Browser</h1>
      </div>

      <div className="px-3 pb-2 flex items-center gap-1.5">
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <button
            onClick={handleBack}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground"
            data-testid="browser-back"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleRefresh}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground"
            data-testid="browser-refresh"
          >
            {loading
              ? <X className="w-3.5 h-3.5" />
              : <RotateCw className="w-3.5 h-3.5" />
            }
          </button>
        </div>

        <div className="flex-1 flex items-center gap-2 bg-muted/60 hover:bg-muted border border-border/60 rounded-xl px-3 py-1.5 min-w-0 transition-colors group">
          <Lock className="w-3 h-3 text-green-600 flex-shrink-0" />
          <span className="text-xs font-mono flex-1 truncate text-foreground/80 select-all" data-testid="browser-url">{zerithUrl}</span>
          <button
            onClick={copyUrl}
            className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
            data-testid="browser-copy-url"
          >
            {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
          </button>
        </div>
      </div>

      <div className="relative h-0.5 bg-transparent overflow-hidden mx-3 rounded-full mb-0">
        {loading && (
          <div
            className="absolute inset-y-0 left-0 bg-primary rounded-full transition-all ease-out"
            style={{
              width: `${progress}%`,
              transitionDuration: progress === 0 ? "0ms" : progress <= 25 ? "100ms" : progress <= 65 ? "200ms" : progress <= 90 ? "350ms" : "200ms",
            }}
          />
        )}
      </div>

      <div className="flex items-center overflow-x-auto border-t border-border/40">
        {browserSubTabs.map((tab) => {
          const active = location.startsWith(tab.href);
          return (
            <Link
              key={tab.label}
              href={tab.href}
              className={`px-4 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors flex-shrink-0 ${active ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
              data-testid={`browser-tab-${tab.label.toLowerCase()}`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function BrowserSubNav() {
  return <BrowserChrome />;
}
