import { Link, useLocation } from "wouter";
import { Wallet, History, Globe, Settings } from "lucide-react";

const navItems = [
  { label: "Wallet", icon: Wallet, href: "/", match: ["/", "/wallet/send", "/wallet/receive"] },
  { label: "History", icon: History, href: "/history", match: ["/history"] },
  { label: "Browser", icon: Globe, href: "/explorer", match: ["/explorer", "/validators", "/stake", "/whitepaper"] },
  { label: "Settings", icon: Settings, href: "/settings", match: ["/settings"] },
];

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
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <span className="text-primary-foreground font-bold text-xs font-display">ZC</span>
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
              <item.icon className={`w-4.5 h-4.5 flex-shrink-0 ${active ? "text-primary" : ""}`} style={{ width: "18px", height: "18px" }} />
              <span className="text-sm">{item.label}</span>
              {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />}
            </Link>
          );
        })}
      </div>

      <div className="px-4 py-4 border-t border-border">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
          <span className="text-xs text-muted-foreground">Mainnet</span>
        </div>
      </div>
    </aside>
  );
}

const browserSubNav = [
  { label: "Explorer", href: "/explorer" },
  { label: "Validators", href: "/validators" },
  { label: "Stake", href: "/stake" },
  { label: "Whitepaper", href: "/whitepaper" },
];

export function BrowserSubNav() {
  const [location] = useLocation();
  return (
    <div className="flex items-center gap-1 px-4 border-b border-border bg-background overflow-x-auto flex-shrink-0">
      {browserSubNav.map((item) => {
        const active = location.startsWith(item.href);
        return (
          <Link key={item.label} href={item.href} className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${active ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`} data-testid={`browser-tab-${item.label.toLowerCase()}`}>
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
