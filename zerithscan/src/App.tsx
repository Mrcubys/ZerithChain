import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { ZenithScanLayout } from "@/pages/layout";
import Home from "@/pages/home";
import Blocks from "@/pages/blocks";
import Txs from "@/pages/txs";
import TxDetail from "@/pages/tx-detail";
import BlockDetail from "@/pages/block-detail";
import AddressDetail from "@/pages/address-detail";
import Validators from "@/pages/validators";

function NotFound() {
  return (
    <div className="text-center py-20">
      <h2 className="text-lg font-semibold">Page Not Found</h2>
      <a href="/" className="text-primary text-sm mt-3 inline-block hover:underline">← Back to Explorer</a>
    </div>
  );
}

function Router() {
  return (
    <ZenithScanLayout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/blocks" component={Blocks} />
        <Route path="/txs" component={Txs} />
        <Route path="/tx/:hash" component={TxDetail} />
        <Route path="/block/:identifier" component={BlockDetail} />
        <Route path="/address/:address" component={AddressDetail} />
        <Route path="/validators" component={Validators} />
        <Route component={NotFound} />
      </Switch>
    </ZenithScanLayout>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
    </QueryClientProvider>
  );
}
