import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Transaction } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ArrowLeft, Send, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { formatZTH, shortHash, DEMO_WALLET_ADDRESS } from "@/lib/chain-utils";
import { useToast } from "@/hooks/use-toast";

const sendSchema = z.object({
  to: z.string().min(10, "Enter a valid ZTH address").startsWith("zth1", "Address must start with zth1"),
  amount: z.string().refine(v => !isNaN(parseFloat(v)) && parseFloat(v) > 0, "Amount must be greater than 0"),
  memo: z.string().optional(),
});

type SendForm = z.infer<typeof sendSchema>;

export default function WalletSend() {
  const [, setLocation] = useLocation();
  const [txResult, setTxResult] = useState<Transaction | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const address = localStorage.getItem("zerith-wallet-address") || DEMO_WALLET_ADDRESS;
  const network = localStorage.getItem("zerith-network") || "mainnet";

  const form = useForm<SendForm>({
    resolver: zodResolver(sendSchema),
    defaultValues: { to: "", amount: "", memo: "" },
  });

  const sendMutation = useMutation({
    mutationFn: async (data: SendForm) => {
      const result = await apiRequest("POST", "/api/wallet/send", {
        from: address,
        to: data.to,
        amount: data.amount,
        network,
      });
      return result.json() as Promise<Transaction>;
    },
    onSuccess: (tx) => {
      setTxResult(tx);
      queryClient.invalidateQueries({ queryKey: ["/api/wallet"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
    },
    onError: (err: Error) => {
      toast({ title: "Transaction failed", description: err.message, variant: "destructive" });
    },
  });

  const onSubmit = (data: SendForm) => {
    sendMutation.mutate(data);
  };

  if (txResult) {
    return (
      <div className="flex flex-col h-full overflow-auto">
        <div className="border-b border-border/50 px-6 py-5">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/"><ArrowLeft className="w-4 h-4 mr-1" />Wallet</Link>
            </Button>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="max-w-md w-full text-center">
            <CardContent className="p-8">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-10 h-10 text-green-400" />
              </div>
              <h2 className="font-display text-2xl font-bold mb-2">Transaction Sent!</h2>
              <p className="text-muted-foreground text-sm mb-4">Your transaction has been broadcast to the network</p>

              <div className="rounded-md border border-border/50 bg-card p-4 text-left space-y-2 mb-6">
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Amount</span>
                  <span className="text-sm font-semibold text-primary" data-testid="send-result-amount">{formatZTH(txResult.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Gas Fee</span>
                  <span className="text-sm font-mono">{formatZTH(txResult.gasFee, 6)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">TX Hash</span>
                  <span className="text-sm font-mono text-muted-foreground" data-testid="send-result-hash">{shortHash(txResult.hash)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Status</span>
                  <Badge className="bg-green-500/10 text-green-400 border-green-500/20">Success</Badge>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" asChild className="flex-1">
                  <Link href={`/explorer/tx/${txResult.hash}`} data-testid="button-view-tx">View Transaction</Link>
                </Button>
                <Button asChild className="flex-1">
                  <Link href="/" data-testid="button-back-to-wallet">Back to Wallet</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const watchedTo = form.watch("to");
  const watchedAmount = form.watch("amount");

  return (
    <div className="flex flex-col h-full overflow-auto">
      <div className="border-b border-border/50 px-6 py-5">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/"><ArrowLeft className="w-4 h-4 mr-1" />Wallet</Link>
          </Button>
          <Separator orientation="vertical" className="h-4" />
          <Send className="w-5 h-5 text-primary" />
          <h1 className="font-display text-xl font-bold">Send ZTH</h1>
          <Badge variant="secondary" className="ml-auto capitalize text-xs">{network}</Badge>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-lg mx-auto space-y-5">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <Card>
                <CardContent className="p-5 space-y-4">
                  <FormField
                    control={form.control}
                    name="to"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Recipient Address</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="zth1..."
                            className="font-mono"
                            data-testid="input-recipient"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount (ZTH)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              type="number"
                              step="0.0001"
                              min="0"
                              placeholder="0.0000"
                              className="pr-16 font-mono"
                              data-testid="input-amount"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-semibold">ZTH</span>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="memo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Memo (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Optional message" data-testid="input-memo" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {watchedTo && watchedAmount && parseFloat(watchedAmount) > 0 && (
                <Card className="animate-fade-in">
                  <CardHeader className="pb-2 pt-4">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Transaction Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="px-5 pb-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Amount</span>
                      <span className="font-semibold font-mono">{formatZTH(watchedAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Estimated Gas</span>
                      <span className="font-mono text-muted-foreground">~0.001 ZTH</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Total</span>
                      <span className="font-semibold font-mono">{formatZTH((parseFloat(watchedAmount) + 0.001).toFixed(4))}</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={sendMutation.isPending}
                data-testid="button-submit-send"
              >
                {sendMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Broadcasting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Transaction
                  </>
                )}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
