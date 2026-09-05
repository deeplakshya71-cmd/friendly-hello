import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/reui-spinner";
import {
  nftRead,
  useMintStatus,
  useNftArtwork,
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

const WALLET_LIMIT = 2;

function formatCountdown(msLeft: number) {
  const total = Math.max(0, Math.floor(msLeft / 1000));
  const d = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return d > 0 ? `${d}d ${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export function MintCard() {
  const { address, getSigner, correctNetwork } = useWallet();
  const { data: mintStatus, isLoading, refetch: refetchStatus } = useMintStatus();
  const refreshAll = useRefreshAll();
  const [status, setStatus] = useState<string | null>(null);
  const [mintedId, setMintedId] = useState<bigint | null>(null);
  const { data: mintedArt, isLoading: mintedArtLoading } = useNftArtwork(
    mintedId ?? undefined,
  );

  const [passIndex, setPassIndex] = useState(0);
  const [loadedPasses, setLoadedPasses] = useState<string[]>([]);
  const passesReady = loadedPasses.length >= PASS_CARD_IMAGES.length;
  useEffect(() => {
    if (!passesReady) return;
    const timer = setInterval(
      () => setPassIndex((i) => (i + 1) % PASS_CARD_IMAGES.length),
      2600,
    );
    return () => clearInterval(timer);
  }, [passesReady]);
  const activePass =
    PASS_CARD_IMAGES[passIndex] ?? PASS_CARD_IMAGES[0] ?? null;

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const started = mintStatus?.publicMintStarted ?? false;
  const startsAt = (mintStatus?.publicMintStart ?? 0) * 1000;
  const countdown =
    startsAt > 0 ? formatCountdown(startsAt - now) : null;
  const price = mintStatus ? BigInt(mintStatus.priceUSDT) : null;
  const soldOut =
    !!mintStatus && mintStatus.supplyCap > 0 && mintStatus.totalMinted >= mintStatus.supplyCap;
  const busy = status !== null;
  const ownedCount = mintStatus?.walletPublicMintCount ?? 0;
  const limitReached = mintStatus?.walletLimitReached ?? false;
  const progress =
    mintStatus && mintStatus.supplyCap > 0
      ? (mintStatus.totalMinted / mintStatus.supplyCap) * 100
      : 0;

  async function handleMint() {
    if (!address || price === null) return;
    try {
      const allowance = await usdtRead().allowance(address, NFT_ADDRESS);
      const signer = await getSigner();
      if (allowance < price) {
        setStatus("Approving…");
        const usdt = usdtContract(signer);
        const approveTx = await usdt.approve(NFT_ADDRESS, price);
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
      await refetchStatus();
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
        <div className="relative aspect-square w-full overflow-hidden rounded-[1.5rem] border-[3px] border-white bg-black/5 shadow-xl">
          {PASS_CARD_IMAGES.map((pass, i) => (
            <img
              key={pass.label}
              src={pass.src}
              alt={`Litdex pass card — ${pass.label}`}
              onLoad={() =>
                setLoadedPasses((prev) =>
                  prev.includes(pass.label) ? prev : [...prev, pass.label],
                )
              }
              onError={() =>
                setLoadedPasses((prev) =>
                  prev.includes(pass.label) ? prev : [...prev, pass.label],
                )
              }
              className={`absolute inset-0 size-full object-cover transition-opacity duration-[900ms] ease-in-out ${
                i === passIndex && passesReady ? "z-10 opacity-100" : "z-0 opacity-0"
              }`}
            />
          ))}
          {!passesReady && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-[#F4F4F2]">
              <Spinner className="size-8 text-[#0038FF]" />
              <p className="btn-text text-black/50">Loading pass cards…</p>
            </div>
          )}
        </div>
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
            {activePass?.label}
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
              {isLoading || !mintStatus
                ? "…"
                : `${mintStatus.totalMinted} / ${mintStatus.supplyCap}`}
            </p>
...
              <p className="mt-1 font-mono text-sm font-bold text-black">
                ${price !== null ? formatUsdt(price) : "…"} USDT
              </p>
              <p className="mt-1 flex items-center gap-1.5 font-mono text-[11px] font-bold text-[#0038FF]">
                <span className="inline-block size-2 rounded-full bg-[#CCFF00] ring-2 ring-[#0038FF]/30" />
                {started ? "MINTING NOW" : "NOT STARTED"}
              </p>
            </div>
            <button
              disabled={
                !address ||
                !correctNetwork ||
                soldOut ||
                busy ||
                !mintStatus ||
                !started ||
                limitReached
              }
              onClick={() => void handleMint()}
              className="btn fx-9 btn-pill btn-blue"
            >
              <span className="btn-label">
                {soldOut
                  ? "Sold out"
                  : !started
                    ? countdown
                      ? `Starts in ${countdown}`
                      : "Not started"
                    : limitReached
                      ? "Limit reached"
                      : (status ??
                        `Mint now · $${price !== null ? formatUsdt(price) : "…"} USDT`)}
              </span>
            </button>
          </div>
          <p className="mt-3 text-right font-mono text-[11px] font-bold tracking-wide text-black/40">
            LIMIT {WALLET_LIMIT} PER WALLET · YOU OWN {ownedCount}
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
