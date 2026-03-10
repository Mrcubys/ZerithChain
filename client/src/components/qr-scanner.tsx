import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Camera, AlertCircle } from "lucide-react";

interface QrScannerProps {
  onScan: (address: string) => void;
  onClose: () => void;
}

function parseQrAddress(raw: string): string {
  raw = raw.trim();
  if (raw.startsWith("zerith:")) return raw.slice(7).split("?")[0];
  if (raw.startsWith("ethereum:")) return raw.slice(9).split("?")[0];
  if (raw.startsWith("solana:")) return raw.slice(7).split("?")[0];
  return raw.split("?")[0];
}

function safeStop(scanner: any) {
  try {
    const p = scanner.stop();
    if (p && typeof p.catch === "function") p.catch(() => {});
  } catch {
    // ignore — scanner may already be stopped or not started
  }
}

export function QrScanner({ onScan, onClose }: QrScannerProps) {
  const readerRef = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<any>(null);
  const scannedRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const startScanner = async () => {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        if (cancelled || !readerRef.current) return;

        const scanner = new Html5Qrcode("zerith-qr-reader");
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 220, height: 220 } },
          (decodedText: string) => {
            if (scannedRef.current) return;
            scannedRef.current = true;
            const addr = parseQrAddress(decodedText);
            safeStop(scanner);
            onScan(addr);
          },
          () => {}
        );

        if (cancelled) {
          safeStop(scanner);
          return;
        }

        setStarting(false);
      } catch (e: any) {
        if (!cancelled) {
          const msg: string = e?.message ?? "";
          if (msg.toLowerCase().includes("permission")) {
            setError("Camera permission denied. Please allow camera access and try again.");
          } else if (msg.toLowerCase().includes("no camera") || msg.toLowerCase().includes("not found")) {
            setError("No camera found on this device.");
          } else {
            setError("Could not start camera. Make sure no other app is using it.");
          }
          setStarting(false);
        }
      }
    };

    startScanner();

    return () => {
      cancelled = true;
      if (scannerRef.current) {
        safeStop(scannerRef.current);
      }
    };
  }, []);

  const handleClose = () => {
    if (scannerRef.current) safeStop(scannerRef.current);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/90"
      data-testid="qr-scanner-overlay"
    >
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <p className="text-white font-semibold text-base">Scan QR Code</p>
        <button
          onClick={handleClose}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          data-testid="button-close-qr-scanner"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4">
        {error ? (
          <div className="flex flex-col items-center gap-3 text-center max-w-xs">
            <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center">
              <AlertCircle className="w-7 h-7 text-red-400" />
            </div>
            <p className="text-white text-sm">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Close
            </Button>
          </div>
        ) : (
          <>
            <div className="relative">
              <div
                id="zerith-qr-reader"
                ref={readerRef}
                className="rounded-2xl overflow-hidden"
                style={{ width: 280, height: 280 }}
              />
              {starting && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-2xl">
                  <div className="flex flex-col items-center gap-2">
                    <Camera className="w-8 h-8 text-white/70 animate-pulse" />
                    <p className="text-white/70 text-xs">Starting camera…</p>
                  </div>
                </div>
              )}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-[#5AC8FA] rounded-tl-lg" />
                <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-[#5AC8FA] rounded-tr-lg" />
                <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-[#5AC8FA] rounded-bl-lg" />
                <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-[#5AC8FA] rounded-br-lg" />
              </div>
            </div>
            <p className="text-white/60 text-sm text-center">
              Point at a Zerith / EVM / Solana QR code
            </p>
          </>
        )}
      </div>
    </div>
  );
}
