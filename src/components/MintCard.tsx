import { ethers } from "ethers";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useMintInfo, useRefreshAll, usdtRead, readProvider } from "@/hooks/useLitdex";
import { useWallet } from "@/hooks/useWallet";
import {
  NFT_ABI,
  NFT_ADDRESS,
  USDT_ABI,
  USDT_ADDRESS,
  formatUsdt,
  parseWalletError,
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
      const allowance = (await usdtRead(readProvider()).allowance(address, NFT_ADDRESS)) as bigint;
      const signer = await getSigner();
      if (allowance < data.price) {
        setStatus("Approving USDT…");
        const usdt = new ethers.Contract(USDT_ADDRESS, USDT_ABI, signer);
        const approveTx = await usdt.approve(NFT_ADDRESS, data.price);
        await approveTx.wait();
      }
      setStatus("Minting…");
      const nft = new ethers.Contract(NFT_ADDRESS, NFT_ABI, signer);
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
    <Card className="flex flex-col gap-4 border-border bg-card p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Mint a Litdex NFT</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Common rarity · paid in MockUSDT on Base Sepolia
          </p>
        </div>
        <p className="font-mono text-2xl font-bold text-primary">
          {isLoading || !data ? "…" : `$${formatUsdt(data.price)} USDT`}
        </p>
      </div>

      <p className="font-mono text-sm text-muted-foreground">
        {data ? `${data.minted.toString()} / ${data.cap.toString()} minted` : "— / — minted"}
      </p>

      <Button
        disabled={!address || !correctNetwork || soldOut || busy || !data}
        onClick={() => void handleMint()}
      >
        {busy && <Loader2 className="animate-spin" />}
        {soldOut ? "Sold out" : (status ?? "Mint")}
      </Button>
      {!address && <p className="text-xs text-muted-foreground">Connect your wallet to mint.</p>}
    </Card>
  );
}
