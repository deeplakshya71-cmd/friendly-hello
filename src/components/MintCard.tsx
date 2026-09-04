import { useState } from "react";
import { toast } from "sonner";
import {
  nftRead,
  useMintInfo,
  useNftArtwork,
  useRefreshAll,
  usdtRead,
} from "@/hooks/useLitdex";
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
  const [mintedId, setMintedId] = useState<bigint | null>(null);
  const { data: mintedArt, isLoading: mintedArtLoading } = useNftArtwork(
    mintedId ?? undefined,
  );

  const soldOut = !!data && data.minted >= data.cap;
  const busy = status !== null;

  async function handleMint() {
    if (!address || !data) return;
    try {
      const allowance = await usdtRead().allowance(address, NFT_ADDRESS);
      const signer = await getSigner();
      if (allowance < data.price) {
        setStatus("Approving…");
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
    <div id="mint" className="flex scroll-mt-8 flex-col rounded-[2rem] bg-[#F4F4F2] p-6 md:p-8">
      <h3
        className="text-center text-xl font-black tracking-tight text-black uppercase md:text-2xl"
        style={{ fontFamily: '"Arial Black", Impact, sans-serif' }}
      >
        Mint a champion
      </h3>
      <p className="mt-2 text-center text-sm text-black/50">
        ${data ? formatUsdt(data.price) : "…"} USDT · Common rarity to start.
      </p>

      <div className="mt-auto flex flex-col items-center gap-3 pt-8">
        <div className="rounded-full bg-[#CCFF00] px-6 py-3 shadow-lg">
          <p className="font-mono text-sm font-bold text-black">
            {isLoading || !data
              ? "…"
              : `$${formatUsdt(data.price)} · ${data.minted.toString()}/${data.cap.toString()} minted`}
          </p>
        </div>
        <button
          disabled={!address || !correctNetwork || soldOut || busy || !data}
          onClick={() => void handleMint()}
          className="w-full rounded-full bg-[#0038FF] px-6 py-3 text-sm font-bold text-white shadow-lg transition-transform hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
        >
          {soldOut ? "Sold out" : (status ?? "Mint champion")}
        </button>
        {!address && (
          <p className="text-xs text-black/50">Connect your wallet to mint.</p>
        )}
      </div>
    </div>
  );
}
