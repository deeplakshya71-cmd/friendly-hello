import { useState } from "react";
import { toast } from "sonner";
import { ImageLightbox } from "@/components/ImageLightbox";
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
      try {
        const next = await nftRead().nextTokenId();
        if (next > 1n) setMintedId(next - 1n);
      } catch {
        // artwork is optional
      }
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

      {mintedId !== null && (
        <div className="mt-6 flex flex-col items-center gap-2">
          {mintedArtLoading ? (
            <div className="aspect-square w-full max-w-56 animate-pulse rounded-3xl bg-black/10" />
          ) : mintedArt ? (
            <ImageLightbox
              src={mintedArt}
              alt={`Minted champion #${mintedId.toString()}`}
            >
              <img
                src={mintedArt}
                alt={`Minted champion #${mintedId.toString()}`}
                className="w-full max-w-56 rounded-3xl border-[3px] border-white object-contain shadow-lg"
              />
            </ImageLightbox>
          ) : null}
          <p className="font-mono text-xs font-bold text-black/60">
            Champion #{mintedId.toString()} minted!
          </p>
        </div>
      )}

      <div className="mt-auto flex flex-col items-center gap-3 pt-8">
        <div className="rounded-full bg-[#CCFF00] px-6 py-3 shadow-lg">
          <p className="btn-text font-bold text-black">
            {isLoading || !data
              ? "…"
              : `$${formatUsdt(data.price)} · ${data.minted.toString()}/${data.cap.toString()} minted`}
          </p>
        </div>
        <button
          disabled={!address || !correctNetwork || soldOut || busy || !data}
          onClick={() => void handleMint()}
          className="btn fx-9 btn-pill btn-blue w-full"
        >
          <span className="btn-label">{soldOut ? "Sold out" : (status ?? "Mint champion")}</span>
        </button>
        {!address && (
          <p className="text-xs text-black/50">Connect your wallet to mint.</p>
        )}
      </div>
    </div>
  );
}
