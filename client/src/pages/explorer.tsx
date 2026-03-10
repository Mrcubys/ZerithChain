import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Block, Transaction } from "@shared/schema";
import { BlockRow } from "@/components/block-row";
import { TxRow } from "@/components/tx-row";
import { SearchBar } from "@/components/search-bar";
import { BrowserSubNav } from "@/components/wallet-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Layers, ArrowRightLeft } from "lucide-react";

export default function Explorer() {
  const [tab, setTab] = useState("blocks");

  const { data: blocks, isLoading: blocksLoading } = useQuery<Block[]>({
    queryKey: ["/api/blocks", "explorer"],
    queryFn: async () => {
      const res = await fetch("/api/blocks?limit=25");
      return res.json();
    },
    refetchInterval: 4000,
  });

  const { data: transactions, isLoading: txLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions", "explorer"],
    queryFn: async () => {
      const res = await fetch("/api/transactions?limit=25");
      return res.json();
    },
    refetchInterval: 4000,
  });

  return (
    <div className="flex flex-col min-h-full">
      <div className="bg-background border-b border-border px-5 pt-10 pb-0 sticky top-0 z-10">
        <h1 className="text-xl font-semibold mb-4">Browser</h1>
        <BrowserSubNav />
      </div>
      <div className="border-b border-border px-5 py-4">
        <h2 className="text-sm font-semibold text-foreground">Block Explorer</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Browse blocks, transactions, and addresses</p>
        <div className="mt-3 max-w-2xl">
          <SearchBar />
        </div>
      </div>

      <div className="p-6">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-4" data-testid="tabs-explorer">
            <TabsTrigger value="blocks" data-testid="tab-blocks">
              <Layers className="w-3.5 h-3.5 mr-1.5" />
              Blocks
            </TabsTrigger>
            <TabsTrigger value="transactions" data-testid="tab-transactions">
              <ArrowRightLeft className="w-3.5 h-3.5 mr-1.5" />
              Transactions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="blocks">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Layers className="w-4 h-4 text-muted-foreground" />
                    Latest Blocks
                  </CardTitle>
                  <span className="text-xs text-muted-foreground">Auto-refreshing</span>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {blocksLoading
                  ? Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="h-14 mb-1" />)
                  : blocks?.map((block) => <BlockRow key={block.height} block={block} />)
                }
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <ArrowRightLeft className="w-4 h-4 text-muted-foreground" />
                    Latest Transactions
                  </CardTitle>
                  <span className="text-xs text-muted-foreground">Auto-refreshing</span>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {txLoading
                  ? Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="h-14 mb-1" />)
                  : transactions?.map((tx) => <TxRow key={tx.hash} tx={tx} />)
                }
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
