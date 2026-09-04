import { useMemo, useState } from "react";
import { NftCard } from "@/components/NftCard";
import { useOwnedNfts } from "@/hooks/useLitdex";
import { useWallet } from "@/hooks/useWallet";
import type { OwnedNft } from "@/lib/litdex";

const PAGE_SIZE = 3;

type SortKey = "newest" | "oldest" | "level";
type RarityKey = "all" | "0" | "1" | "2" | "3";
type StatusKey = "all" | "damaged" | "healthy";

const RARITY_OPTIONS: { value: RarityKey; label: string }[] = [
  { value: "all", label: "All rarities" },
  { value: "0", label: "Common" },
  { value: "1", label: "Rare" },
  { value: "2", label: "Epic" },
  { value: "3", label: "Legend" },
];

const STATUS_OPTIONS: { value: StatusKey; label: string }[] = [
  { value: "all", label: "All status" },
  { value: "damaged", label: "Damaged" },
  { value: "healthy", label: "Repaired" },
];

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "level", label: "Highest level" },
];

function Select<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className="btn-text cursor-pointer rounded-full border border-black/20 bg-white px-4 py-2 text-black outline-none focus:border-[#0038FF]"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value} className="btn-text">
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function NftSection() {
  const { address } = useWallet();
  const { data, isLoading } = useOwnedNfts();
  const [rarity, setRarity] = useState<RarityKey>("all");
  const [status, setStatus] = useState<StatusKey>("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [page, setPage] = useState(0);

  const filtered = useMemo<OwnedNft[]>(() => {
    let list = [...(data ?? [])];
    if (rarity !== "all") list = list.filter((n) => n.rarity === Number(rarity));
    if (status === "damaged") list = list.filter((n) => n.damaged);
    if (status === "healthy") list = list.filter((n) => !n.damaged);
    list.sort((a, b) => {
      if (sort === "level") return b.level - a.level;
      const diff = a.tokenId > b.tokenId ? 1 : a.tokenId < b.tokenId ? -1 : 0;
      return sort === "newest" ? -diff : diff;
    });
    return list;
  }, [data, rarity, status, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount - 1);
  const visible = filtered.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE);

  const reset = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    setPage(0);
  };

  if (!address) return null;

  return (
    <section id="champions" className="mt-16 scroll-mt-8 space-y-6">
      <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
        <div className="md:w-1/4" />
        <h2 className="btn-heading heading-ul text-center text-black">
          My <span className="text-[#0038FF]">champions</span>
        </h2>
        <div className="flex flex-wrap justify-center gap-2 md:w-1/4 md:justify-end">
          <Select value={rarity} onChange={reset(setRarity)} options={RARITY_OPTIONS} />
          <Select value={status} onChange={reset(setStatus)} options={STATUS_OPTIONS} />
          <Select value={sort} onChange={reset(setSort)} options={SORT_OPTIONS} />
        </div>
      </div>

      {isLoading && <p className="btn-text text-center text-black/50">Scanning token IDs…</p>}
      {!isLoading && filtered.length === 0 && (
        <div className="btn-text rounded-[2rem] border-2 border-dashed border-black/15 bg-[#F4F4F2] p-8 text-center text-black/50">
          {data && data.length > 0
            ? "No champions match these filters."
            : "You don't own any Litdex champions yet. Mint one above."}
        </div>
      )}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((nft) => (
          <NftCard key={nft.tokenId.toString()} nft={nft} />
        ))}
      </div>

      {filtered.length > PAGE_SIZE && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setPage(current - 1)}
            disabled={current === 0}
            className="btn fx-9 btn-pill btn-blue"
          >
            <span className="btn-label">Prev</span>
          </button>
          <span className="btn-text text-black/60">
            Page {current + 1} / {pageCount}
          </span>
          <button
            onClick={() => setPage(current + 1)}
            disabled={current >= pageCount - 1}
            className="btn fx-9 btn-pill btn-blue"
          >
            <span className="btn-label">Next</span>
          </button>
        </div>
      )}
    </section>
  );
}
