import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Block, Transaction } from "@shared/schema";
import { BlockRow } from "@/components/block-row";
import { TxRow } from "@/components/tx-row";
import { SearchBar } from "@/components/search-bar";
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
    <div className="flex flex-col h-full overflow-auto">
      <div className="border-b border-border/50 px-6 py-6 bg-grid-pattern bg-grid">
        <div className="absolute inset-0 bg-hero-gradient pointer-events-none" />
        <h1 className="font-display text-2xl font-bold text-foreground">Block Explorer</h1>
        <p className="text-muted-foreground text-sm mt-1">Browse blocks, transactions, and addresses on Zerith Chain</p>
        <div className="mt-4 max-w-2xl">
          <SearchBar />
        </div>
      </div>

      <div className="p-6 flex-1">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-4" data-testid="tabs-explorer">
            <TabsTrigger value="blocks" data-testid="tab-blocks">
              <Layers className="w-4 h-4 mr-1.5" />
              Blocks
            </TabsTrigger>
            <TabsTrigger value="transactions" data-testid="tab-transactions">
              <ArrowRightLeft className="w-4 h-4 mr-1.5" />
              Transactions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="blocks">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-display flex items-center gap-2">
                  <Layers className="w-4 h-4 text-primary" />
                  Latest Blocks
                  <span className="ml-auto text-xs font-normal text-muted-foreground font-sans">Auto-refreshing</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {blocksLoading
                  ? Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="h-14 mb-2" />)
                  : blocks?.map((block) => <BlockRow key={block.height} block={block} />)
                }
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-display flex items-center gap-2">
                  <ArrowRightLeft className="w-4 h-4 text-neon-purple" />
                  Latest Transactions
                  <span className="ml-auto text-xs font-normal text-muted-foreground font-sans">Auto-refreshing</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {txLoading
                  ? Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="h-14 mb-2" />)
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
