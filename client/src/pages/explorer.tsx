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
    <div className="flex flex-col min-h-full">
      <div className="border-b border-border px-6 py-6">
        <h1 className="text-xl font-semibold text-foreground">Block Explorer</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Browse blocks, transactions, and addresses on Zerith Chain</p>
        <div className="mt-4 max-w-2xl">
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
