import { AlertTriangle, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/useWallet";
import { truncateAddress } from "@/lib/litdex";

export function Header() {
  const { address, connect, connecting, correctNetwork, switchNetwork, hasWallet, disconnect } =
    useWallet();

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-md bg-primary/15 font-mono text-sm font-bold text-primary">
            LX
          </div>
          <div>
            <p className="font-mono text-sm font-semibold tracking-widest text-foreground uppercase">
              Litdex
            </p>
            <p className="text-xs text-muted-foreground">Base Sepolia Testnet</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {address && !correctNetwork && (
            <Button variant="destructive" size="sm" onClick={() => void switchNetwork()}>
              <AlertTriangle /> Switch to Base Sepolia
            </Button>
          )}
          {address ? (
            <Button variant="secondary" size="sm" className="font-mono" onClick={disconnect}>
              {truncateAddress(address)}
            </Button>
          ) : (
            <Button size="sm" disabled={connecting} onClick={() => void connect()}>
              <Wallet />
              {connecting ? "Connecting…" : hasWallet ? "Connect Wallet" : "Install Wallet"}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
