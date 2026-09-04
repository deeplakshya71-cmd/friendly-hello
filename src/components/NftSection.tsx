import { NftCard } from "@/components/NftCard";
import { useOwnedNfts } from "@/hooks/useLitdex";
import { useWallet } from "@/hooks/useWallet";

export function NftSection() {
  const { address } = useWallet();
  const { data, isLoading } = useOwnedNfts();

  if (!address) return null;

  return (
    <section id="champions" className="mt-16 scroll-mt-8 space-y-6">
      <h2 className="btn-text text-center text-black">
        My <span className="text-[#0038FF]">champions</span>
      </h2>
      {isLoading && <p className="btn-text text-center text-black/50">Scanning token IDs…</p>}
      {!isLoading && (!data || data.length === 0) && (
        <div className="btn-text rounded-[2rem] border-2 border-dashed border-black/15 bg-[#F4F4F2] p-8 text-center text-black/50">
          You don't own any Litdex champions yet. Mint one above.
        </div>
      )}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {data?.map((nft) => <NftCard key={nft.tokenId.toString()} nft={nft} />)}
      </div>
    </section>
  );
}
