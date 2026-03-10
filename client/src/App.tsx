import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme";
import { WalletBottomNav, WalletSidebar } from "@/components/wallet-nav";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Explorer from "@/pages/explorer";
import BlockDetail from "@/pages/block-detail";
import TxDetail from "@/pages/tx-detail";
import AddressDetail from "@/pages/address-detail";
import Validators from "@/pages/validators";
import WalletPage from "@/pages/wallet";
import WalletSend from "@/pages/wallet-send";
import WalletReceive from "@/pages/wallet-receive";
import Whitepaper from "@/pages/whitepaper";
import Transactions from "@/pages/transactions";
import Stake from "@/pages/stake";
import SettingsPage from "@/pages/settings";

function Router() {
  return (
    <Switch>
      <Route path="/" component={WalletPage} />
      <Route path="/history" component={Transactions} />
      <Route path="/explorer" component={Explorer} />
      <Route path="/explorer/block/:identifier" component={BlockDetail} />
      <Route path="/explorer/tx/:hash" component={TxDetail} />
      <Route path="/explorer/address/:address" component={AddressDetail} />
      <Route path="/validators" component={Validators} />
      <Route path="/stake" component={Stake} />
      <Route path="/whitepaper" component={Whitepaper} />
      <Route path="/wallet/send" component={WalletSend} />
      <Route path="/wallet/receive" component={WalletReceive} />
      <Route path="/settings" component={SettingsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppLayout() {
  return (
    <div className="flex min-h-screen bg-background">
      <WalletSidebar />
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        <main className="flex-1 overflow-auto">
          <Router />
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
