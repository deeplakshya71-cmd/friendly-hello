import { AlertTriangle, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/useWallet";
import { truncateAddress } from "@/lib/litdex";

export function Header() {
  const { address, connect, connecting, correctNetwork, switchNetwork, hasWallet, disconnect } =
    useWallet();

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        {/* Logo */}
        <div className="flex items-center font-display text-lg tracking-tight uppercase">
          <span className="rounded-md bg-primary px-2 py-1 text-primary-foreground">LIT</span>
          <span className="ml-1 rounded-md border border-border px-2 py-1 text-foreground">
            DEX
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <NetworkSwitcher />
          {address && !correctNetwork && (
            <span className="flex items-center gap-1 text-xs font-semibold text-destructive">
              <AlertTriangle className="size-3.5" /> On-chain actions need Base Sepolia
            </span>
          )}
          {address ? (
            <Button
              size="sm"
              onClick={disconnect}
              className="rounded-full font-mono font-bold shadow-[0_0_20px_-4px_var(--color-primary)]"
            >
              {truncateAddress(address)}
            </Button>
          ) : (
            <Button
              size="sm"
              disabled={connecting}
              onClick={() => void connect()}
              className="rounded-full font-bold shadow-[0_0_20px_-4px_var(--color-primary)]"
            >
              <Wallet />
              {connecting ? "Connecting…" : hasWallet ? "Connect wallet" : "Install Wallet"}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
