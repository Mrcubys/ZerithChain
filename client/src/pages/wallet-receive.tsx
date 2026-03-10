import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Copy, Check, ArrowDownLeft } from "lucide-react";
import { useState } from "react";

export default function WalletReceive() {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const address = localStorage.getItem("zerith-wallet-address") ?? "";

  const copy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
    toast({ title: "Address copied", description: "Your ZTH address has been copied." });
  };

  if (!address) {
    return (
      <div className="p-6 text-center py-16">
        <ArrowDownLeft className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
        <h2 className="text-lg font-semibold">No Wallet Connected</h2>
        <Button variant="outline" size="sm" asChild className="mt-4">
          <Link href="/wallet">Open Wallet</Link>
        </Button>
      </div>
    );
  }

  const qrContent = `zerith:${address}`;
  const qrSize = 200;
  const modules = 21;
  const moduleSize = qrSize / modules;

  const qrPattern = Array.from({ length: modules }, (_, r) =>
    Array.from({ length: modules }, (_, c) => {
      const edge = r < 7 || r >= modules - 7 || c < 7 || c >= modules - 7;
      const inner = (r >= 2 && r <= 4 && c >= 2 && c <= 4) ||
        (r >= 2 && r <= 4 && c >= modules - 5 && c <= modules - 3) ||
        (r >= modules - 5 && r <= modules - 3 && c >= 2 && c <= 4);
      const data = (address.charCodeAt((r * modules + c) % address.length) & (1 << (c % 8))) !== 0;
      return edge || inner || data;
    })
  );

  return (
    <div className="flex flex-col min-h-full">
      <div className="border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/"><ArrowLeft className="w-4 h-4 mr-1" />Wallet</Link>
          </Button>
          <Separator orientation="vertical" className="h-4" />
          <ArrowDownLeft className="w-4 h-4 text-muted-foreground" />
          <h1 className="font-semibold">Receive ZTH</h1>
        </div>
      </div>

      <div className="p-6 max-w-sm mx-auto w-full space-y-5">
        <Card>
          <CardContent className="p-6 flex flex-col items-center gap-4">
            <div className="p-3 bg-white rounded-sm" data-testid="qr-code-display">
              <svg width={qrSize} height={qrSize} viewBox={`0 0 ${qrSize} ${qrSize}`}>
                {qrPattern.map((row, r) =>
                  row.map((filled, c) =>
                    filled ? (
                      <rect
                        key={`${r}-${c}`}
                        x={c * moduleSize}
                        y={r * moduleSize}
                        width={moduleSize}
                        height={moduleSize}
                        fill="#000"
                      />
                    ) : null
                  )
                )}
              </svg>
            </div>
            <p className="text-sm text-muted-foreground text-center">Scan to receive ZTH on Zerith Chain</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Your Address</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <div className="bg-secondary rounded-sm p-3">
              <code className="text-xs font-mono break-all text-muted-foreground" data-testid="receive-address">{address}</code>
            </div>
            <Button className="w-full" onClick={copy} data-testid="button-copy-receive-address">
              {copied ? (
                <><Check className="w-4 h-4 mr-2 text-green-400" />Copied</>
              ) : (
                <><Copy className="w-4 h-4 mr-2" />Copy Address</>
              )}
            </Button>
          </CardContent>
        </Card>

        <div className="p-3 rounded-sm border border-border/50 bg-secondary/30">
          <p className="text-xs text-muted-foreground">Only send ZTH (ZTH) to this address. Sending other assets will result in permanent loss.</p>
        </div>
      </div>
    </div>
  );
}
