import { useRef, useState, useCallback, useEffect } from "react";
import { useLocation } from "wouter";
import { ChevronLeft, ChevronRight, RotateCw, X, Lock, Copy, Check, Globe2 } from "lucide-react";

const BROWSER_TABS = [
  { label: "Explorer", href: "/explorer", url: "https://zerithscan.replit.com" },
  { label: "Validators", href: "/validators", url: "https://zerith-validator.replit.com" },
  { label: "Stake", href: "/stake", url: "https://zerith-stake.replit.com" },
  { label: "Whitepaper", href: "/whitepaper", url: "https://zerithwhitepaper.replit.com" },
];

export default function BrowserPage() {
  const [location, navigate] = useLocation();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [copied, setCopied] = useState(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const activeTab = BROWSER_TABS.find(t => location.startsWith(t.href)) ?? BROWSER_TABS[0];
  const displayUrl = activeTab.url;

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const startLoading = useCallback(() => {
    clearTimers();
    setIframeError(false);
    setProgress(0);
    setLoading(true);
    const t1 = setTimeout(() => setProgress(20), 30);
    const t2 = setTimeout(() => setProgress(55), 200);
    const t3 = setTimeout(() => setProgress(80), 600);
    timersRef.current = [t1, t2, t3];
  }, [clearTimers]);

  const finishLoading = useCallback(() => {
    clearTimers();
    setProgress(100);
    const t = setTimeout(() => {
      setLoading(false);
      setProgress(0);
    }, 350);
    timersRef.current = [t];
  }, [clearTimers]);

  useEffect(() => {
    startLoading();
    return clearTimers;
  }, [activeTab.url]);

  const handleIframeLoad = () => {
    finishLoading();
  };

  const handleIframeError = () => {
    finishLoading();
    setIframeError(true);
  };

  const handleRefresh = () => {
    setIframeError(false);
    startLoading();
    if (iframeRef.current) {
      iframeRef.current.src = activeTab.url;
    }
  };

  const handleBack = () => {
    try {
      iframeRef.current?.contentWindow?.history.back();
    } catch {
      window.history.back();
    }
  };

  const handleForward = () => {
    try {
      iframeRef.current?.contentWindow?.history.forward();
    } catch {}
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(displayUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-4rem)] md:h-dvh overflow-hidden bg-background">
      <div className="flex-shrink-0 bg-background border-b border-border">
        <div className="px-4 pt-8 pb-1.5 flex items-center gap-2">
          <Globe2 className="w-4 h-4 text-primary flex-shrink-0" />
          <h1 className="text-base font-semibold">Browser</h1>
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
              onClick={handleForward}
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground"
              data-testid="browser-forward"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleRefresh}
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground"
              data-testid="browser-refresh"
            >
              {loading
                ? <X className="w-3.5 h-3.5" />
                : <RotateCw className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="flex-1 flex items-center gap-2 bg-muted/60 hover:bg-muted border border-border/60 rounded-xl px-3 py-1.5 min-w-0 transition-colors group cursor-default">
            <Lock className="w-3 h-3 text-green-600 flex-shrink-0" />
            <span
              className="text-xs font-mono flex-1 truncate text-foreground/80 select-all"
              data-testid="browser-url"
            >
              {displayUrl}
            </span>
            <button
              onClick={copyUrl}
              className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
              data-testid="browser-copy-url"
            >
              {copied
                ? <Check className="w-3 h-3 text-green-500" />
                : <Copy className="w-3 h-3" />}
            </button>
          </div>
        </div>

        <div className="h-0.5 mx-3 rounded-full overflow-hidden bg-transparent mb-0">
          {loading && (
            <div
              className="h-full bg-primary rounded-full transition-all ease-out"
              style={{
                width: `${progress}%`,
                transitionDuration:
                  progress === 0 ? "0ms"
                  : progress <= 20 ? "80ms"
                  : progress <= 55 ? "220ms"
                  : "400ms",
              }}
            />
          )}
        </div>

        <div className="flex overflow-x-auto border-t border-border/40">
          {BROWSER_TABS.map((tab) => {
            const active = location.startsWith(tab.href);
            return (
              <button
                key={tab.label}
                onClick={() => navigate(tab.href)}
                className={`px-4 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors flex-shrink-0 ${
                  active
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
                data-testid={`browser-tab-${tab.label.toLowerCase()}`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 min-h-0 relative">
        {iframeError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background px-6 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <Globe2 className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-sm text-foreground">Site can't be reached</p>
              <p className="text-xs text-muted-foreground max-w-xs">{displayUrl}</p>
            </div>
            <button
              onClick={handleRefresh}
              className="flex items-center gap-1.5 text-xs text-primary hover:underline"
              data-testid="browser-retry"
            >
              <RotateCw className="w-3.5 h-3.5" />
              Try again
            </button>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            key={activeTab.url}
            src={activeTab.url}
            className="w-full h-full border-0"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
            data-testid="browser-iframe"
            title={activeTab.label}
          />
        )}
      </div>
    </div>
  );
}
