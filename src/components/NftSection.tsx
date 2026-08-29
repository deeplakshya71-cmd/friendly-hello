import { NftCard } from "@/components/NftCard";
import { Card } from "@/components/ui/card";
import { useOwnedNfts } from "@/hooks/useLitdex";
import { useWallet } from "@/hooks/useWallet";

export function NftSection() {
  const { address } = useWallet();
  const { data, isLoading } = useOwnedNfts();

  if (!address) return null;

  return (
    <section className="space-y-4">
      <h2 className="font-mono text-xs tracking-widest text-muted-foreground uppercase">My NFTs</h2>
      {isLoading && <p className="text-sm text-muted-foreground">Scanning token IDs…</p>}
      {!isLoading && (!data || data.length === 0) && (
        <Card className="border-dashed border-border bg-card/50 p-6 text-sm text-muted-foreground">
          You don't own any Litdex NFTs yet. Mint one above.
        </Card>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        {data?.map((nft) => <NftCard key={nft.tokenId.toString()} nft={nft} />)}
      </div>
    </section>
  );
}
