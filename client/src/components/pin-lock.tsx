import { useState, useEffect, useRef } from "react";
import { verifyPin, setPin } from "@/lib/pin-security";
import { Lock, Delete } from "lucide-react";

const zerithLogoPath = "/zerith-logo.png";

interface PinLockProps {
  mode: "lock" | "setup" | "verify";
  onSuccess: () => void;
  onCancel?: () => void;
  setupTitle?: string;
}

export function PinLock({ mode, onSuccess, onCancel, setupTitle }: PinLockProps) {
  const [digits, setDigits] = useState<string[]>([]);
  const [confirmDigits, setConfirmDigits] = useState<string[]>([]);
  const [step, setStep] = useState<"enter" | "confirm">(mode === "setup" ? "enter" : "enter");
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleDigit = (d: string) => {
    setError(null);
    if (mode === "setup" && step === "confirm") {
      if (confirmDigits.length >= 6) return;
      const next = [...confirmDigits, d];
      setConfirmDigits(next);
      if (next.length === 6) handleConfirmComplete(next);
    } else {
      if (digits.length >= 6) return;
      const next = [...digits, d];
      setDigits(next);
      if (next.length === 6) handleDigitComplete(next, mode);
    }
  };

  const handleDelete = () => {
    setError(null);
    if (mode === "setup" && step === "confirm") {
      setConfirmDigits(prev => prev.slice(0, -1));
    } else {
      setDigits(prev => prev.slice(0, -1));
    }
  };

  const handleDigitComplete = async (d: string[], m: string) => {
    const pin = d.join("");
    if (m === "setup") {
      setStep("confirm");
    } else {
      const ok = await verifyPin(pin);
      if (ok) {
        onSuccess();
      } else {
        setError("Incorrect passkey. Try again.");
        triggerShake();
        setTimeout(() => setDigits([]), 600);
      }
    }
  };

  const handleConfirmComplete = async (d: string[]) => {
    const pin = digits.join("");
    const confirmPin = d.join("");
    if (pin !== confirmPin) {
      setError("PINs don't match. Start over.");
      triggerShake();
      setTimeout(() => {
        setDigits([]);
        setConfirmDigits([]);
        setStep("enter");
      }, 700);
    } else {
      await setPin(pin);
      onSuccess();
    }
  };

  const currentDots = mode === "setup" && step === "confirm" ? confirmDigits : digits;

  const title = mode === "lock"
    ? "Wallet Locked"
    : mode === "verify"
    ? "Enter Passkey"
    : setupTitle ?? "Set Up Passkey";

  const subtitle = mode === "lock"
    ? "Enter your 6-digit passkey to unlock"
    : mode === "verify"
    ? "Enter your passkey to continue"
    : step === "enter"
    ? "Create a 6-digit passkey to secure your wallet"
    : "Confirm your passkey";

  return (
    <div className="fixed inset-0 bg-background z-[100] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-xs flex flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-2xl overflow-hidden border border-border/40 shadow-sm">
            <img src={zerithLogoPath} alt="Zerith" className="w-full h-full object-cover" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold">{title}</h2>
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          </div>
        </div>

        <div className={`flex gap-3 ${shake ? "animate-[shake_0.5s_ease-in-out]" : ""}`}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full border-2 transition-all ${
                i < currentDots.length
                  ? "bg-primary border-primary scale-110"
                  : "border-muted-foreground/30 bg-transparent"
              }`}
            />
          ))}
        </div>

        {error && (
          <p className="text-xs text-destructive text-center -mt-4">{error}</p>
        )}

        <div className="grid grid-cols-3 gap-3 w-full">
          {["1","2","3","4","5","6","7","8","9"].map(d => (
            <button
              key={d}
              onClick={() => handleDigit(d)}
              className="h-16 rounded-2xl bg-secondary/80 hover:bg-secondary text-xl font-semibold transition-all active:scale-95 border border-border/40"
              data-testid={`pin-digit-${d}`}
            >
              {d}
            </button>
          ))}
          <div />
          <button
            onClick={() => handleDigit("0")}
            className="h-16 rounded-2xl bg-secondary/80 hover:bg-secondary text-xl font-semibold transition-all active:scale-95 border border-border/40"
            data-testid="pin-digit-0"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="h-16 rounded-2xl hover:bg-secondary/60 transition-all active:scale-95 flex items-center justify-center"
            data-testid="pin-delete"
          >
            <Delete className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {onCancel && (
          <button onClick={onCancel} className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="pin-cancel">
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
