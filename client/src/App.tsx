import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { NetworkFooter } from "@/components/network-footer";
import { ThemeProvider, useTheme } from "@/lib/theme";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
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

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <Button size="icon" variant="ghost" onClick={toggleTheme} data-testid="button-theme-toggle">
      {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </Button>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/explorer" component={Explorer} />
      <Route path="/explorer/block/:identifier" component={BlockDetail} />
      <Route path="/explorer/tx/:hash" component={TxDetail} />
      <Route path="/explorer/address/:address" component={AddressDetail} />
      <Route path="/validators" component={Validators} />
      <Route path="/wallet" component={WalletPage} />
      <Route path="/wallet/send" component={WalletSend} />
      <Route path="/wallet/receive" component={WalletReceive} />
      <Route path="/whitepaper" component={Whitepaper} />
      <Route component={NotFound} />
    </Switch>
  );
}

const sidebarStyle = {
  "--sidebar-width": "17rem",
  "--sidebar-width-icon": "3.5rem",
};

function AppLayout() {
  const network = (localStorage.getItem("zerith-network") || "mainnet") as string;

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full overflow-hidden">
        <AppSidebar />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <header className="flex items-center justify-between px-4 py-2 border-b border-border/50 bg-background/95 backdrop-blur-sm sticky top-0 z-50 flex-shrink-0">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-auto min-h-0">
            <Router />
          </main>
          <NetworkFooter network={network} />
        </div>
      </div>
    </SidebarProvider>
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
