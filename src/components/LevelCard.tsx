import { useBasePoints } from "@/hooks/useLitdex";
import { formatPoints } from "@/lib/litdex";

export function LevelCard() {
  const { data, isLoading } = useBasePoints();

  return (
    <div id="levels" className="flex scroll-mt-8 flex-col rounded-[2rem] bg-[#F4F4F2] p-6 md:p-8">
      <h3 className="btn-heading text-center text-black">
        Level up & rise
      </h3>
      <p className="btn-text mt-2 text-center text-black/50">
        Spend points to grow Common to Legend.
      </p>

      <div className="mt-auto flex flex-col items-center gap-3 pt-8">
        <div className="rounded-full bg-[#0038FF] px-6 py-3 shadow-lg">
          <p className="btn-text font-bold text-white">
            {isLoading ? "…" : formatPoints(data ?? 0n)}{" "}
            <span className="text-white/70">Base pts</span>
          </p>
        </div>
        <a
          href="#champions"
          className="btn fx-9 btn-pill btn-lime w-full text-center"
        >
          <span className="btn-label">Level a champion</span>
        </a>
      </div>
    </div>
  );
}
