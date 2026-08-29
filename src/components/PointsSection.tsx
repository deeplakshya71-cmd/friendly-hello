import { Sparkles } from "lucide-react";
import { useState } from "react";
import { ClaimModal } from "@/components/ClaimModal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useBasePoints } from "@/hooks/useLitdex";
import { formatPoints } from "@/lib/litdex";

export function PointsSection() {
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useBasePoints();

  return (
    <Card className="flex flex-col gap-6 border-border bg-card p-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
          Base points balance
        </p>
        <p className="mt-2 font-mono text-5xl leading-none font-bold text-primary">
          {isLoading ? "…" : formatPoints(data ?? 0n)}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">Spendable on level ups.</p>
      </div>
      <Button size="lg" onClick={() => setOpen(true)}>
        <Sparkles /> Claim from LitVM
      </Button>
      <ClaimModal open={open} onOpenChange={setOpen} />
    </Card>
  );
}
