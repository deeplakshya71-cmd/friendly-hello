import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowBlack2 } from "@/components/ui/hero";
import { Button } from "@/components/ui/button";
import { useMintInfo, useRefreshAll, usdtRead } from "@/hooks/useLitdex";
import { useWallet } from "@/hooks/useWallet";
import {
  NFT_ADDRESS,
  formatUsdt,
  nftContract,
  parseWalletError,
  usdtContract,
} from "@/lib/litdex";

export function MintCard() {
  const { address, getSigner, correctNetwork } = useWallet();
  const { data, isLoading } = useMintInfo();
  const refreshAll = useRefreshAll();
  const [status, setStatus] = useState<string | null>(null);

  const soldOut = !!data && data.minted >= data.cap;
  const busy = status !== null;

  async function handleMint() {
    if (!address || !data) return;
    try {
      const allowance = await usdtRead().allowance(address, NFT_ADDRESS);
      const signer = await getSigner();
      if (allowance < data.price) {
        setStatus("Approving USDT…");
        const usdt = usdtContract(signer);
        const approveTx = await usdt.approve(NFT_ADDRESS, data.price);
        await approveTx.wait();
      }
      setStatus("Minting…");
      const nft = nftContract(signer);
      const tx = await nft.mint();
      await tx.wait();
      await refreshAll();
      toast.success("NFT minted");
    } catch (err) {
      toast.error(parseWalletError(err, "Mint failed, try again."));
    } finally {
      setStatus(null);
    }
  }

  return (
    <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/60 p-6 backdrop-blur-sm md:p-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-2xl uppercase md:text-3xl">Mint a Litdex NFT</h2>
          <p className="mt-2 font-mono text-xs tracking-widest text-muted-foreground uppercase">
            Common rarity · paid in MockUSDT on Base Sepolia
          </p>
          <p className="mt-4 font-mono text-sm text-muted-foreground">
            {data ? `${data.minted.toString()} / ${data.cap.toString()} minted` : "— / — minted"}
          </p>
        </div>
        <div className="flex flex-col items-start gap-4 sm:items-end">
          <p className="font-display text-4xl text-primary md:text-5xl">
            {isLoading || !data ? "…" : `$${formatUsdt(data.price)}`}
          </p>
          <div className="flex items-center gap-4">
            <div className="hidden rotate-12 md:block" aria-hidden="true">
              <ArrowBlack2 />
            </div>
            <Button
              size="lg"
              className="rounded-full font-bold shadow-[0_0_24px_-6px_var(--color-primary)]"
              disabled={!address || !correctNetwork || soldOut || busy || !data}
              onClick={() => void handleMint()}
            >
              {busy && <Loader2 className="animate-spin" />}
              {soldOut ? "Sold out" : (status ?? "Mint")}
            </Button>
          </div>
          {!address && (
            <p className="font-mono text-xs text-muted-foreground">Connect your wallet to mint.</p>
          )}
        </div>
      </div>
    </section>
  );
}
