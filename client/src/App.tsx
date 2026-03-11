import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/pages/layout";
import ScanHome from "@/pages/scan-home";
import ScanBlocks from "@/pages/scan-blocks";
import ScanBlock from "@/pages/scan-block";
import ScanTxs from "@/pages/scan-txs";
import ScanTx from "@/pages/scan-tx";
import ScanAddress from "@/pages/scan-address";
import ScanValidators from "@/pages/scan-validators";
import WalletPage from "@/pages/wallet";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={ScanHome} />
        <Route path="/wallet" component={WalletPage} />
        <Route path="/wallet/:addr" component={WalletPage} />
        <Route path="/blocks" component={ScanBlocks} />
        <Route path="/block/:id" component={ScanBlock} />
        <Route path="/txs" component={ScanTxs} />
        <Route path="/tx/:hash" component={ScanTx} />
        <Route path="/address/:addr" component={ScanAddress} />
        <Route path="/validators" component={ScanValidators} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
