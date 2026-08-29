import { ethers } from "ethers";
import { ExternalLink, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  usdtRead,
  useBasePoints,
  useGameConfig,
  useLevelCost,
  useRefreshAll,
} from "@/hooks/useLitdex";
import { useWallet } from "@/hooks/useWallet";
import {
  MAX_LEVEL,
  NFT_ADDRESS,
  RARITY_CLASS,
  RARITY_NAMES,
  formatPoints,
  formatUsdt,
  nftContract,
  openSeaUrl,
  parseWalletError,
  usdtContract,
  type OwnedNft,
} from "@/lib/litdex";

export function NftCard({ nft }: { nft: OwnedNft }) {
  const { address, getSigner, correctNetwork } = useWallet();
  const refreshAll = useRefreshAll();
  const { data: points } = useBasePoints();
  const { data: config } = useGameConfig();
  const { data: levelCost } = useLevelCost(nft.level);
  const [busy, setBusy] = useState<string | null>(null);
  const [recipient, setRecipient] = useState("");

  const atMax = nft.level >= MAX_LEVEL;
  const canAfford = levelCost !== undefined && points !== undefined && points >= levelCost;
  const gamesRequired = config?.gamesRequired ?? null;
  const promoteReady =
    gamesRequired !== null && BigInt(nft.gamesAtMaxLevel) >= gamesRequired && atMax;

  async function run(label: string, fn: (signer: ethers.Signer) => Promise<void>, fallback: string) {
    if (!address) return;
    setBusy(label);
    try {
      const signer = await getSigner();
      await fn(signer);
      await refreshAll();
      toast.success(`${label} complete`);
    } catch (err) {
      toast.error(parseWalletError(err, fallback));
    } finally {
      setBusy(null);
    }
  }

  const nftWith = (signer: ethers.Signer) => nftContract(signer);

  const handleLevelUp = () =>
    run(
      "Level up",
      async (signer) => {
        const tx = await nftWith(signer).levelUp(nft.tokenId);
        await tx.wait();
      },
      "Level up failed, try again.",
    );

  const handlePromote = () =>
    run(
      "Promote",
      async (signer) => {
        const tx = await nftWith(signer).promote(nft.tokenId);
        await tx.wait();
      },
      "Promote failed, try again.",
    );

  const handleRepair = () =>
    run(
      "Repair",
      async (signer) => {
        const cost = config?.repairCost ?? 0n;
        const allowance = await usdtRead().allowance(address!, NFT_ADDRESS);
        if (allowance < cost) {
          const usdt = usdtContract(signer);
          const approveTx = await usdt.approve(NFT_ADDRESS, cost);
          await approveTx.wait();
        }
        const tx = await nftWith(signer).repair(nft.tokenId);
        await tx.wait();
      },
      "Repair failed, try again.",
    );

  const handleTransfer = () => {
    if (!ethers.isAddress(recipient)) {
      toast.error("Enter a valid recipient address.");
      return;
    }
    return run(
      "Transfer",
      async (signer) => {
        const tx = await nftWith(signer).transferFrom(address!, recipient, nft.tokenId);
        await tx.wait();
        setRecipient("");
      },
      "Transfer failed, try again.",
    );
  };

  const disabled = !correctNetwork || busy !== null;

  return (
    <Card className="flex flex-col gap-4 border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs text-muted-foreground">Token #{nft.tokenId.toString()}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge className={RARITY_CLASS[nft.rarity]}>
              {RARITY_NAMES[nft.rarity] ?? "Unknown"}
            </Badge>
            <Badge variant="outline" className="font-mono">
              Lv {nft.level}/{MAX_LEVEL}
            </Badge>
            {nft.damaged && <Badge variant="destructive">Damaged</Badge>}
          </div>
        </div>
        <a
          href={openSeaUrl(nft.tokenId)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          OpenSea <ExternalLink className="size-3" />
        </a>
      </div>

      <div className="space-y-2 border-t border-border pt-4">
        {atMax ? (
          <>
            <p className="text-sm text-muted-foreground">Max level — Promote instead</p>
            <p className="font-mono text-xs text-muted-foreground">
              {nft.gamesAtMaxLevel}/{gamesRequired?.toString() ?? "…"} games
              {promoteReady ? " — ready" : ""}
            </p>
            <Button
              className="w-full"
              disabled={disabled || !promoteReady}
              onClick={() => void handlePromote()}
            >
              {busy === "Promote" && <Loader2 className="animate-spin" />} Promote
            </Button>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              Level up cost:{" "}
              <span className="font-mono text-foreground">
                {levelCost !== undefined ? formatPoints(levelCost) : "…"} pts
              </span>
            </p>
            <Button
              className="w-full"
              disabled={disabled || nft.damaged || !canAfford}
              onClick={() => void handleLevelUp()}
            >
              {busy === "Level up" && <Loader2 className="animate-spin" />} Level Up
            </Button>
            {nft.damaged && <p className="text-xs text-destructive">Repair before leveling up.</p>}
            {!nft.damaged && !canAfford && (
              <p className="text-xs text-muted-foreground">Not enough Base points.</p>
            )}
          </>
        )}

        {nft.damaged && (
          <Button
            variant="secondary"
            className="w-full"
            disabled={disabled}
            onClick={() => void handleRepair()}
          >
            {busy === "Repair" && <Loader2 className="animate-spin" />}
            Repair · ${config ? formatUsdt(config.repairCost) : "…"} USDT
          </Button>
        )}
      </div>

      <div className="space-y-2 border-t border-border pt-4">
        <p className="text-xs tracking-wide text-muted-foreground uppercase">Transfer</p>
        <div className="flex gap-2">
          <Input
            placeholder="0x recipient"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="font-mono text-xs"
            disabled={disabled}
          />
          <Button variant="outline" disabled={disabled} onClick={() => void handleTransfer()}>
            {busy === "Transfer" ? <Loader2 className="animate-spin" /> : "Send"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
