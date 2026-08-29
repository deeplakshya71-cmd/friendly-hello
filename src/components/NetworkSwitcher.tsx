import { useState } from "react";
import { toast } from "sonner";
import { useWallet } from "@/hooks/useWallet";
import { BASE_SEPOLIA, LITVM, chainName, parseWalletError, type ChainConfig } from "@/lib/litdex";

export function NetworkSwitcher({ tone = "light" }: { tone?: "light" | "dark" }) {
  const { chainId, switchNetwork, address } = useWallet();
  const [pending, setPending] = useState<number | null>(null);

  if (!address) return null;

  const handle = async (target: ChainConfig) => {
    setPending(target.chainId);
    try {
      await switchNetwork(target);
    } catch (err) {
      toast.error(parseWalletError(err, `Could not switch to ${target.chainName}.`));
    } finally {
      setPending(null);
    }
  };

  const labelClass = tone === "dark" ? "text-white/70" : "text-black/60";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className={`text-xs font-semibold ${labelClass}`}>
        Network: {chainName(chainId)}
        {chainId !== null && ` (${chainId})`}
      </span>
      {[BASE_SEPOLIA, LITVM].map((c) => {
        const active = chainId === c.chainId;
        return (
          <button
            key={c.chainId}
            type="button"
            disabled={active || pending !== null}
            onClick={() => void handle(c)}
            className={`rounded-full px-3 py-1.5 text-xs font-bold transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 ${
              active ? "bg-[#CCFF00] text-black" : "bg-[#0038FF] text-white"
            }`}
          >
            {pending === c.chainId ? "Switching…" : `Switch to ${c.chainName}`}
          </button>
        );
      })}
    </div>
  );
}
