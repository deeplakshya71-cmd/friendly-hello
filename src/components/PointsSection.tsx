import { Sparkles } from "lucide-react";
import { useState } from "react";
import { ClaimModal } from "@/components/ClaimModal";
import { ArrowBlack1 } from "@/components/ui/hero";
import { Button } from "@/components/ui/button";
import { useBasePoints } from "@/hooks/useLitdex";
import { formatPoints } from "@/lib/litdex";

export function PointsSection() {
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useBasePoints();

  return (
    <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/60 p-6 backdrop-blur-sm md:p-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
            Base points balance
          </p>
          <p className="mt-2 font-display text-6xl leading-none text-primary md:text-7xl">
            {isLoading ? "…" : formatPoints(data ?? 0n)}
          </p>
          <p className="mt-3 font-mono text-xs tracking-widest text-muted-foreground uppercase">
            Spendable on level ups
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden -rotate-12 md:block" aria-hidden="true">
            <ArrowBlack1 />
          </div>
          <Button
            size="lg"
            onClick={() => setOpen(true)}
            className="rounded-full font-bold shadow-[0_0_24px_-6px_var(--color-primary)]"
          >
            <Sparkles /> Claim from LitVM
          </Button>
        </div>
      </div>
      <ClaimModal open={open} onOpenChange={setOpen} />
    </section>
  );
}
