import { useRef, useState, useCallback, useEffect, KeyboardEvent } from "react";
import { useLocation } from "wouter";
import {
  ChevronLeft, ChevronRight, RotateCw, X, Lock,
  Globe2, Search, Star, Clock, ExternalLink, Plus
} from "lucide-react";

const ZERITH_TABS = [
  { label: "Explorer", href: "/explorer", url: "https://zerithscan.replit.com", icon: "🔍" },
  { label: "Validators", href: "/validators", url: "https://zerith-validator.replit.com", icon: "🛡️" },
  { label: "Stake", href: "/stake", url: "https://zerith-stake.replit.com", icon: "⚡" },
  { label: "Whitepaper", href: "/whitepaper", url: "https://zerithwhitepaper.replit.com", icon: "📄" },
];

const QUICK_LINKS = [
  { label: "Google", url: "https://www.google.com", color: "#4285F4" },
  { label: "Wikipedia", url: "https://www.wikipedia.org", color: "#000000" },
  { label: "GitHub", url: "https://github.com", color: "#24292f" },
  { label: "CoinGecko", url: "https://www.coingecko.com", color: "#8DC63F" },
  { label: "CoinMarketCap", url: "https://coinmarketcap.com", color: "#17C784" },
  { label: "DefiLlama", url: "https://defillama.com", color: "#2172E5" },
  { label: "DuckDuckGo", url: "https://duckduckgo.com", color: "#DE5833" },
  { label: "Reddit", url: "https://www.reddit.com", color: "#FF4500" },
];

function toProxyUrl(url: string) {
  return `/api/proxy?url=${encodeURIComponent(url)}`;
}

function resolveInput(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  if (/^localhost(:\d+)?/.test(trimmed)) return `http://${trimmed}`;
  if (/^[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})(\/.*)?$/.test(trimmed) && !trimmed.includes(" ")) {
    return `https://${trimmed}`;
  }
  return `https://duckduckgo.com/?q=${encodeURIComponent(trimmed)}`;
}

function getDisplayUrl(url: string) {
  try {
    const u = new URL(url);
    return u.hostname + (u.pathname !== "/" ? u.pathname : "") + (u.search ? u.search : "");
  } catch {
    return url;
  }
}

function FaviconImg({ url }: { url: string }) {
  const [ok, setOk] = useState(true);
  const faviconUrl = (() => {
    try {
      return `https://www.google.com/s2/favicons?sz=32&domain=${new URL(url).hostname}`;
    } catch {
      return "";
    }
  })();
  if (!ok || !faviconUrl) return <Globe2 className="w-4 h-4 text-muted-foreground" />;
  return (
    <img
      src={faviconUrl}
      className="w-4 h-4 rounded-sm object-contain"
      onError={() => setOk(false)}
      alt=""
    />
  );
}

export default function BrowserPage() {
  const [location, navigate] = useLocation();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const activeZerithTab = ZERITH_TABS.find(t => location.startsWith(t.href));
  const initialUrl = activeZerithTab?.url ?? "";

  const [currentUrl, setCurrentUrl] = useState(initialUrl);
  const [addressInput, setAddressInput] = useState(getDisplayUrl(initialUrl));
  const [addressFocused, setAddressFocused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<string[]>(initialUrl ? [initialUrl] : []);
  const [historyIdx, setHistoryIdx] = useState(0);

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const addressRef = useRef<HTMLInputElement>(null);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const startLoading = useCallback(() => {
    clearTimers();
    setProgress(0);
    setLoading(true);
    const t1 = setTimeout(() => setProgress(18), 40);
    const t2 = setTimeout(() => setProgress(52), 250);
    const t3 = setTimeout(() => setProgress(78), 700);
    timersRef.current = [t1, t2, t3];
  }, [clearTimers]);

  const finishLoading = useCallback(() => {
    clearTimers();
    setProgress(100);
    const t = setTimeout(() => { setLoading(false); setProgress(0); }, 380);
    timersRef.current = [t];
  }, [clearTimers]);

  const loadUrl = useCallback((url: string, pushHistory = true) => {
    if (!url) return;
    setCurrentUrl(url);
    setAddressInput(getDisplayUrl(url));
    startLoading();
    if (pushHistory) {
      setHistory(prev => {
        const trimmed = prev.slice(0, historyIdx + 1);
        return [...trimmed, url];
      });
      setHistoryIdx(prev => prev + 1);
    }
  }, [historyIdx, startLoading]);

  useEffect(() => {
    const newZerith = ZERITH_TABS.find(t => location.startsWith(t.href));
    if (newZerith && newZerith.url !== currentUrl) {
      loadUrl(newZerith.url);
    }
  }, [location]);

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data && e.data.zerithBrowser === true && e.data.type === "NAVIGATE") {
        const url = e.data.url as string;
        if (url) loadUrl(url);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [loadUrl]);

  const canGoBack = historyIdx > 0;
  const canGoForward = historyIdx < history.length - 1;

  const goBack = () => {
    if (!canGoBack) return;
    const newIdx = historyIdx - 1;
    setHistoryIdx(newIdx);
    const url = history[newIdx];
    setCurrentUrl(url);
    setAddressInput(getDisplayUrl(url));
    startLoading();
  };

  const goForward = () => {
    if (!canGoForward) return;
    const newIdx = historyIdx + 1;
    setHistoryIdx(newIdx);
    const url = history[newIdx];
    setCurrentUrl(url);
    setAddressInput(getDisplayUrl(url));
    startLoading();
  };

  const refresh = () => {
    if (!currentUrl) return;
    startLoading();
    if (iframeRef.current) {
      iframeRef.current.src = toProxyUrl(currentUrl);
    }
  };

  const stopLoading = () => {
    finishLoading();
    if (iframeRef.current) {
      try { iframeRef.current.contentWindow?.stop(); } catch {}
    }
  };

  const handleAddressKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const url = resolveInput(addressInput);
      if (url) {
        addressRef.current?.blur();
        loadUrl(url);
      }
    } else if (e.key === "Escape") {
      setAddressInput(getDisplayUrl(currentUrl));
      addressRef.current?.blur();
    }
  };

  const proxyUrl = currentUrl ? toProxyUrl(currentUrl) : "";

  const isHttps = currentUrl.startsWith("https://");

  const zerithTabForUrl = ZERITH_TABS.find(t => t.url === currentUrl);

  return (
    <div
      className="flex flex-col overflow-hidden bg-[#f0f2f5] dark:bg-[#1a1a1a]"
      style={{ height: "calc(100dvh - 4rem)" }}
    >
      <div className="flex-shrink-0 bg-white dark:bg-[#202124] border-b border-[#e0e0e0] dark:border-[#3c4043] shadow-sm">
        <div className="flex items-center gap-0 px-2 pt-2 pb-1">
          <button
            onClick={goBack}
            disabled={!canGoBack}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-default text-[#5f6368]"
            data-testid="browser-back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goForward}
            disabled={!canGoForward}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-default text-[#5f6368]"
            data-testid="browser-forward"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <button
            onClick={loading ? stopLoading : refresh}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-[#5f6368]"
            data-testid="browser-refresh"
          >
            {loading ? <X className="w-4 h-4" /> : <RotateCw className="w-4 h-4" />}
          </button>

          <div
            className={`flex-1 mx-2 flex items-center gap-1.5 h-8 rounded-full border px-3 transition-all cursor-text ${
              addressFocused
                ? "bg-white dark:bg-[#303134] border-primary shadow-[0_0_0_2px_rgba(90,200,250,0.3)]"
                : "bg-[#f1f3f4] dark:bg-[#303134] border-transparent hover:border-[#dadce0]"
            }`}
            onClick={() => { addressRef.current?.focus(); addressRef.current?.select(); }}
          >
            <span className="flex-shrink-0">
              {currentUrl ? (
                isHttps
                  ? <Lock className="w-3 h-3 text-[#188038]" />
                  : <Globe2 className="w-3 h-3 text-[#5f6368]" />
              ) : (
                <Search className="w-3 h-3 text-[#5f6368]" />
              )}
            </span>
            <input
              ref={addressRef}
              className="flex-1 min-w-0 text-xs bg-transparent outline-none text-[#202124] dark:text-white placeholder:text-[#5f6368] font-mono"
              value={addressFocused ? addressInput : (addressInput || "")}
              onChange={e => setAddressInput(e.target.value)}
              onFocus={() => { setAddressFocused(true); setTimeout(() => addressRef.current?.select(), 0); }}
              onBlur={() => { setAddressFocused(false); if (currentUrl) setAddressInput(getDisplayUrl(currentUrl)); }}
              onKeyDown={handleAddressKeyDown}
              placeholder="Search or enter website URL"
              spellCheck={false}
              autoComplete="off"
              data-testid="browser-url"
            />
          </div>

          <a
            href={currentUrl || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className={`w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-[#5f6368] ${!currentUrl ? "opacity-30 pointer-events-none" : ""}`}
            data-testid="browser-open-external"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        <div className="h-[3px] relative overflow-hidden">
          {loading && (
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-primary transition-all ease-out"
              style={{
                width: `${progress}%`,
                transitionDuration: progress <= 18 ? "100ms" : progress <= 52 ? "250ms" : "500ms",
              }}
            />
          )}
        </div>

        <div className="flex overflow-x-auto border-t border-[#e8eaed] dark:border-[#3c4043]">
          {ZERITH_TABS.map(tab => {
            const active = location.startsWith(tab.href);
            return (
              <button
                key={tab.label}
                onClick={() => { navigate(tab.href); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium whitespace-nowrap border-b-2 transition-colors flex-shrink-0 ${
                  active
                    ? "border-primary text-primary"
                    : "border-transparent text-[#5f6368] dark:text-[#9aa0a6] hover:text-[#202124] dark:hover:text-white hover:bg-black/4"
                }`}
                data-testid={`browser-tab-${tab.label.toLowerCase()}`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 min-h-0 relative bg-white dark:bg-[#202124]">
        {!currentUrl ? (
          <NewTabPage onNavigate={loadUrl} />
        ) : (
          <iframe
            ref={iframeRef}
            key={currentUrl}
            src={proxyUrl}
            className="w-full h-full border-0"
            onLoad={finishLoading}
            onError={finishLoading}
            title="browser"
            data-testid="browser-iframe"
            referrerPolicy="no-referrer"
          />
        )}
      </div>
    </div>
  );
}

function NewTabPage({ onNavigate }: { onNavigate: (url: string) => void }) {
  const [q, setQ] = useState("");

  const handleSearch = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && q.trim()) {
      onNavigate(resolveInput(q));
      setQ("");
    }
  };

  return (
    <div className="flex flex-col items-center pt-10 px-6 pb-6 h-full bg-white dark:bg-[#202124] overflow-y-auto">
      <div className="w-full max-w-lg">
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
              <Globe2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-lg font-semibold text-[#202124] dark:text-white">Zerith Browser</div>
              <div className="text-xs text-[#5f6368]">Search the web or enter a URL</div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-[#f1f3f4] dark:bg-[#303134] rounded-full px-4 py-2.5 mb-6 border border-transparent focus-within:border-primary focus-within:bg-white dark:focus-within:bg-[#303134] focus-within:shadow-[0_0_0_2px_rgba(90,200,250,0.3)] transition-all">
          <Search className="w-4 h-4 text-[#5f6368] flex-shrink-0" />
          <input
            autoFocus
            className="flex-1 text-sm bg-transparent outline-none text-[#202124] dark:text-white placeholder:text-[#5f6368]"
            placeholder="Search with DuckDuckGo or enter address"
            value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={handleSearch}
            data-testid="newtab-search"
          />
        </div>

        <div className="mb-5">
          <div className="flex items-center gap-1.5 mb-3">
            <Star className="w-3.5 h-3.5 text-[#5f6368]" />
            <span className="text-xs font-semibold text-[#5f6368] uppercase tracking-wider">Zerith Sites</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {ZERITH_TABS.map(tab => (
              <button
                key={tab.label}
                onClick={() => onNavigate(tab.url)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-[#f1f3f4] dark:hover:bg-[#303134] transition-colors group"
                data-testid={`newtab-zerith-${tab.label.toLowerCase()}`}
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-xl group-hover:bg-primary/20 transition-colors">
                  {tab.icon}
                </div>
                <span className="text-[10px] text-[#5f6368] font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1.5 mb-3">
            <Clock className="w-3.5 h-3.5 text-[#5f6368]" />
            <span className="text-xs font-semibold text-[#5f6368] uppercase tracking-wider">Quick Access</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {QUICK_LINKS.map(link => (
              <button
                key={link.label}
                onClick={() => onNavigate(link.url)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-[#f1f3f4] dark:hover:bg-[#303134] transition-colors"
                data-testid={`newtab-quick-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold"
                  style={{ backgroundColor: link.color }}
                >
                  {link.label[0]}
                </div>
                <span className="text-[10px] text-[#5f6368] font-medium">{link.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
