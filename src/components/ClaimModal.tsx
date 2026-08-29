import { useQuery } from "@tanstack/react-query";
import { ethers } from "ethers";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useRefreshAll } from "@/hooks/useLitdex";
import { useWallet } from "@/hooks/useWallet";
import {
  API_BASE,
  POINTS_ABI,
  POINTS_ADDRESS,
  formatPoints,
  parseWalletError,
} from "@/lib/litdex";

type ClaimStep = "idle" | "burning" | "signing" | "confirming";

export function ClaimModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { address, getSigner, correctNetwork } = useWallet();
  const refreshAll = useRefreshAll();
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState<ClaimStep>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setAmount("");
      setStep("idle");
      setError(null);
    }
  }, [open]);

  const litvm = useQuery({
    queryKey: ["litvmBalance", address],
    enabled: open && !!address,
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/points/balance/${address}`);
      if (!res.ok) throw new Error("Could not load LitVM balance");
      return (await res.json()) as { litvmAvailable: string; baseBalance: string };
    },
  });

  const available = litvm.data ? BigInt(litvm.data.litvmAvailable || "0") : null;
  let amountValid = false;
  try {
    if (amount.trim() !== "" && /^\d+$/.test(amount.trim())) {
      const a = BigInt(amount.trim());
      amountValid = a > 0n && (available === null || a <= available);
    }
  } catch {
    amountValid = false;
  }

  const busy = step !== "idle";

  async function handleConvert() {
    if (!address || !amountValid) return;
    setError(null);
    setStep("burning");
    try {
      const res = await fetch(`${API_BASE}/points/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, amount: amount.trim() }),
      });
      const body = (await res.json().catch(() => null)) as
        | { totalEarned: string; expiry: string; signature: string; error?: string; message?: string }
        | null;
      if (!res.ok) {
        setError(body?.error || body?.message || "Claim request failed. Try again.");
        setStep("idle");
        return;
      }
      if (!body) throw new Error("bad response");

      setStep("signing");
      const signer = await getSigner();
      const contract = new ethers.Contract(POINTS_ADDRESS, POINTS_ABI, signer);
      const tx = await contract.claim(body.totalEarned, body.expiry, body.signature);
      setStep("confirming");
      await tx.wait();
      await refreshAll();
      toast.success("Points claimed on Base");
      onOpenChange(false);
    } catch (err) {
      setError(parseWalletError(err, "Claim failed, try again."));
    } finally {
      setStep("idle");
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => (busy ? null : onOpenChange(v))}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Claim from LitVM</DialogTitle>
          <DialogDescription>
            Burn points on LitVM and mint them as spendable points on Base Sepolia.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-md border border-border bg-muted/40 p-3 text-sm">
            {litvm.isLoading && <span className="text-muted-foreground">Loading LitVM balance…</span>}
            {litvm.isError && <span className="text-destructive">Could not load LitVM balance.</span>}
            {litvm.data && (
              <span>
                You have{" "}
                <span className="font-mono font-semibold text-primary">
                  {formatPoints(litvm.data.litvmAvailable)}
                </span>{" "}
                points on LitVM.
              </span>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="claim-amount" className="text-sm text-muted-foreground">
              Amount to convert
            </label>
            <Input
              id="claim-amount"
              inputMode="numeric"
              placeholder="0"
              value={amount}
              disabled={busy}
              onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))}
              className="font-mono"
            />
            {available !== null && (
              <button
                type="button"
                className="text-xs text-primary hover:underline"
                disabled={busy}
                onClick={() => setAmount(available.toString())}
              >
                Max: {formatPoints(available)}
              </button>
            )}
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            className="w-full"
            disabled={!amountValid || busy || !correctNetwork}
            onClick={() => void handleConvert()}
          >
            {busy && <Loader2 className="animate-spin" />}
            {step === "burning"
              ? "Burning on LitVM…"
              : step === "signing"
                ? "Confirm in wallet…"
                : step === "confirming"
                  ? "Confirming on Base…"
                  : "Convert"}
          </Button>
          {!correctNetwork && (
            <p className="text-center text-xs text-destructive">Switch to Base Sepolia first.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
