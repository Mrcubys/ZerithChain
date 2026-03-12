import { Switch, Route } from "wouter";
  import { queryClient } from "./lib/queryClient";
  import { QueryClientProvider } from "@tanstack/react-query";
  import { Toaster } from "@/components/ui/toaster";
  import { TooltipProvider } from "@/components/ui/tooltip";
  import Layout from "@/pages/layout";
  import WalletPage from "@/pages/wallet";
  import NotFound from "@/pages/not-found";

  function Router() {
    return (
      <Layout>
        <Switch>
          <Route path="/" component={WalletPage} />
          <Route path="/wallet" component={WalletPage} />
          <Route path="/wallet/:addr" component={WalletPage} />
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
  