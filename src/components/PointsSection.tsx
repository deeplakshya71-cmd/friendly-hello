import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ClaimModal } from "@/components/ClaimModal";
import { useWallet } from "@/hooks/useWallet";
import { API_BASE, formatPoints } from "@/lib/litdex";

export function PointsSection() {
  const [open, setOpen] = useState(false);
  const { address } = useWallet();

  const litvm = useQuery({
    queryKey: ["litvmBalance", address],
    enabled: !!address,
    refetchInterval: 20000,
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/points/balance/${address}`);
      if (!res.ok) throw new Error("Could not load LitVM balance");
      return (await res.json()) as { litvmAvailable: string; baseBalance: string };
    },
  });

  return (
    <div className="flex flex-col rounded-[2rem] bg-[#F4F4F2] p-6 md:p-8">
      <h3 className="btn-heading heading-ul text-center text-black">
        Claim your points
      </h3>
      <p className="btn-text mt-2 text-center text-black/50">
        Points earned on LitVM convert to Base.
      </p>

      <div className="mt-auto flex items-center justify-center pt-8">
        <div className="flex items-center gap-2 rounded-full bg-[#0038FF] p-1.5 pr-2 shadow-lg">
          <div className="rounded-full bg-white/15 px-4 py-2">
            <p className="btn-text font-bold text-white">
              {litvm.isLoading
                ? "…"
                : litvm.isError
                  ? "—"
                  : formatPoints(litvm.data?.litvmAvailable ?? "0")}
            </p>
            <p className="btn-text text-[10px] font-semibold text-white/70">
              LitVM available
            </p>
          </div>
          <button
            onClick={() => setOpen(true)}
            className="btn fx-9 btn-pill btn-lime"
          >
            <span className="btn-label">Claim</span>
          </button>
        </div>
      </div>

      <ClaimModal open={open} onOpenChange={setOpen} />
    </div>
  );
}
