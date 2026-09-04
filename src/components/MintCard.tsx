import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ImageLightbox } from "@/components/ImageLightbox";
import {
  nftRead,
  useMintInfo,
  useNftArtwork,
  useOwnedNfts,
  useRefreshAll,
  usdtRead,
} from "@/hooks/useLitdex";
import { useWallet } from "@/hooks/useWallet";
import { PASS_CARD_IMAGES } from "@/lib/images";
import {
  NFT_ADDRESS,
  formatUsdt,
  nftContract,
  parseWalletError,
  usdtContract,
} from "@/lib/litdex";

const WALLET_LIMIT = 10;

export function MintCard() {
  const { address, getSigner, correctNetwork } = useWallet();
  const { data, isLoading } = useMintInfo();
  const { data: owned } = useOwnedNfts();
  const refreshAll = useRefreshAll();
  const [status, setStatus] = useState<string | null>(null);
  const [mintedId, setMintedId] = useState<bigint | null>(null);
  const { data: mintedArt, isLoading: mintedArtLoading } = useNftArtwork(
    mintedId ?? undefined,
  );

  const [passIndex, setPassIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(
      () => setPassIndex((i) => (i + 1) % PASS_CARD_IMAGES.length),
      2600,
    );
    return () => clearInterval(timer);
  }, []);

  const soldOut = !!data && data.minted >= data.cap;
  const busy = status !== null;
  const ownedCount = owned?.length ?? 0;
  const limitReached = ownedCount >= WALLET_LIMIT;
  const progress =
    data && data.cap > 0n
      ? Number((data.minted * 1000n) / data.cap) / 10
      : 0;

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
    <div
      id="mint"
      className="grid scroll-mt-24 gap-6 rounded-[2rem] bg-[#F4F4F2] p-4 md:grid-cols-2 md:p-6"
    >
      <div className="relative">
        <ImageLightbox
          src={PASS_CARD_IMAGES[passIndex].src}
          alt={`Litdex pass card — ${PASS_CARD_IMAGES[passIndex].label}`}
        >
          <div className="relative aspect-square w-full overflow-hidden rounded-[1.5rem] border-[3px] border-white bg-black/5 shadow-xl">
            {PASS_CARD_IMAGES.map((pass, i) => (
              <img
                key={pass.label}
                src={pass.src}
                alt={`Litdex pass card — ${pass.label}`}
                className={`absolute inset-0 size-full object-cover transition-opacity duration-[900ms] ease-in-out ${
                  i === passIndex ? "z-10 opacity-100" : "z-0 opacity-0"
                }`}
              />
            ))}
          </div>
        </ImageLightbox>
        <div className="mt-3 flex items-center justify-center gap-2">
          {PASS_CARD_IMAGES.map((pass, i) => (
            <span
              key={pass.label}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === passIndex
                  ? "w-6 bg-[#0038FF]"
                  : "w-1.5 bg-black/20"
              }`}
            />
          ))}
          <span className="ml-2 font-mono text-[11px] font-bold uppercase tracking-wide text-black/50">
            {PASS_CARD_IMAGES[passIndex].label}
          </span>
        </div>
      </div>

      <div className="flex flex-col p-2 md:p-4">
        <h3 className="btn-heading heading-ul text-black">Mint a champion</h3>
        <p className="btn-text mt-2 text-black/50">
          Common rarity to start · Base Sepolia
        </p>

        <div className="mt-6">
          <div className="flex items-center justify-between">
            <p className="btn-text text-xs font-bold text-black/60">
              Items minted
            </p>
            <p className="btn-text text-xs font-bold text-black">
              {isLoading || !data
                ? "…"
                : `${data.minted.toString()} / ${data.cap.toString()}`}
            </p>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-black/10">
            <div
              className="h-full rounded-full bg-[#0038FF] transition-all"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>

        <div className="mt-6 rounded-[1.25rem] bg-white p-4 md:p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="btn-text font-bold text-black">Public stage</p>
              <p className="mt-1 font-mono text-sm font-bold text-black">
                ${data ? formatUsdt(data.price) : "…"} USDT
              </p>
              <p className="mt-1 flex items-center gap-1.5 font-mono text-[11px] font-bold text-[#0038FF]">
                <span className="inline-block size-2 rounded-full bg-[#CCFF00] ring-2 ring-[#0038FF]/30" />
                MINTING NOW
              </p>
            </div>
            <button
              disabled={
                !address ||
                !correctNetwork ||
                soldOut ||
                busy ||
                !data ||
                limitReached
              }
              onClick={() => void handleMint()}
              className="btn fx-9 btn-pill btn-blue"
            >
              <span className="btn-label">
                {soldOut
                  ? "Sold out"
                  : limitReached
                    ? "Limit reached"
                    : (status ?? "Mint")}
              </span>
            </button>
          </div>
          <p className="mt-3 text-right font-mono text-[11px] font-bold tracking-wide text-black/40">
            LIMIT {WALLET_LIMIT} PER WALLET
            {address ? ` · YOU OWN ${ownedCount}` : ""}
          </p>
        </div>

        {mintedId !== null && (
          <p className="mt-4 font-mono text-xs font-bold text-black/60">
            {mintedArtLoading
              ? "Loading artwork…"
              : `Champion #${mintedId.toString()} minted!`}
          </p>
        )}
        {!address && (
          <p className="mt-4 text-xs text-black/50">
            Connect your wallet to mint.
          </p>
        )}
      </div>
    </div>
  );
}
