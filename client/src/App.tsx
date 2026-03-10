import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme";
import { WalletBottomNav, WalletSidebar } from "@/components/wallet-nav";
import { PinLock } from "@/components/pin-lock";
import { isPinSet, isSessionExpired, updateActivity, LOCK_TIMEOUT_MS } from "@/lib/pin-security";
import { ZenithScanLayout } from "@/pages/zenithscan/layout";
import NotFound from "@/pages/not-found";
import WalletPage from "@/pages/wallet";
import WalletSend from "@/pages/wallet-send";
import WalletReceive from "@/pages/wallet-receive";
import Transactions from "@/pages/transactions";
import BrowserPage from "@/pages/browser-page";
import SettingsPage from "@/pages/settings";
import TxDetail from "@/pages/tx-detail";
import ScanHome from "@/pages/zenithscan/scan-home";
import ScanBlocks from "@/pages/zenithscan/scan-blocks";
import ScanTxs from "@/pages/zenithscan/scan-txs";
import ScanTx from "@/pages/zenithscan/scan-tx";
import ScanBlock from "@/pages/zenithscan/scan-block";
import ScanAddress from "@/pages/zenithscan/scan-address";
import ScanValidators from "@/pages/zenithscan/scan-validators";
import { useState, useEffect, useCallback } from "react";

function ScanRouter() {
  return (
    <ZenithScanLayout>
      <Switch>
        <Route path="/scan" component={ScanHome} />
        <Route path="/scan/blocks" component={ScanBlocks} />
        <Route path="/scan/txs" component={ScanTxs} />
        <Route path="/scan/tx/:hash" component={ScanTx} />
        <Route path="/scan/block/:identifier" component={ScanBlock} />
        <Route path="/scan/address/:address" component={ScanAddress} />
        <Route path="/scan/validators" component={ScanValidators} />
      </Switch>
    </ZenithScanLayout>
  );
}

function WalletRouter() {
  return (
    <Switch>
      <Route path="/" component={WalletPage} />
      <Route path="/history" component={Transactions} />
      <Route path="/explorer" component={BrowserPage} />
      <Route path="/validators" component={BrowserPage} />
      <Route path="/stake" component={BrowserPage} />
      <Route path="/whitepaper" component={BrowserPage} />
      <Route path="/wallet/send" component={WalletSend} />
      <Route path="/wallet/receive" component={WalletReceive} />
      <Route path="/explorer/tx/:hash" component={TxDetail} />
      <Route path="/settings" component={SettingsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppLayout() {
  const [location] = useLocation();
  const isScan = location.startsWith("/scan");

  const [locked, setLocked] = useState(() => isPinSet() && isSessionExpired());

  const activity = useCallback(() => {
    if (isPinSet()) updateActivity();
  }, []);

  useEffect(() => {
    const events = ["mousedown", "keydown", "touchstart", "scroll"];
    events.forEach(e => window.addEventListener(e, activity, { passive: true }));
    return () => events.forEach(e => window.removeEventListener(e, activity));
  }, [activity]);

  useEffect(() => {
    if (!isPinSet()) return;
    updateActivity();
    const id = setInterval(() => {
      if (isSessionExpired()) setLocked(true);
    }, 30_000);
    return () => clearInterval(id);
  }, []);

  if (locked) {
    return (
      <PinLock
        mode="lock"
        onSuccess={() => {
          updateActivity();
          setLocked(false);
        }}
      />
    );
  }

  if (isScan) {
    return <ScanRouter />;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <WalletSidebar />
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        <main className="flex-1 overflow-auto">
          <WalletRouter />
        </main>
      </div>
      <WalletBottomNav />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <AppLayout />
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
