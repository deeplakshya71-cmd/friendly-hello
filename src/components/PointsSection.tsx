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

      <div className="mt-auto flex flex-col items-center gap-3 pt-8">
        <div className="rounded-full bg-[#0038FF] px-6 py-3 shadow-lg">
          <p className="btn-text font-bold text-white">
            {litvm.isLoading
              ? "…"
              : litvm.isError
                ? "—"
                : formatPoints(litvm.data?.litvmAvailable ?? "0")}{" "}
            <span className="text-white/70">LitVM available</span>
          </p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="btn fx-9 btn-pill btn-lime w-full text-center"
        >
          <span className="btn-label">Claim</span>
        </button>
      </div>

      <ClaimModal open={open} onOpenChange={setOpen} />
    </div>
  );
}
