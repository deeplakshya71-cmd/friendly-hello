import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { MintCard } from "@/components/MintCard";
import { NftSection } from "@/components/NftSection";
import { PointsSection } from "@/components/PointsSection";
import { Component as Hero } from "@/components/ui/hero";
import { Toaster } from "@/components/ui/sonner";
import { WalletProvider, useWallet } from "@/hooks/useWallet";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Litdex Testnet Dashboard — Points & NFT Progression" },
      {
        name: "description",
        content:
          "Connect your wallet on Base Sepolia to claim LitVM points, mint a Litdex NFT, and level it up.",
      },
      { property: "og:title", content: "Litdex Testnet Dashboard" },
      {
        property: "og:description",
        content:
          "Claim LitVM points on Base Sepolia, mint Litdex NFTs, and level up, repair, promote and transfer them.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Dashboard() {
  const { address, correctNetwork, switchNetwork } = useWallet();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-6xl space-y-8 px-4 py-8">
        <h1 className="sr-only">Litdex Testnet Dashboard</h1>

        <Hero />

        {!address ? (
          <div className="rounded-3xl border border-dashed border-border bg-card/50 p-10 text-center">
            <p className="font-display text-xl uppercase">Connect your wallet to get started</p>
            <p className="mt-2 font-mono text-sm text-muted-foreground">
              Litdex runs on Base Sepolia (chain 84532).
            </p>
          </div>
        ) : (
          <>
            {!correctNetwork && (
              <button
                onClick={() => void switchNetwork()}
                className="w-full rounded-2xl border border-destructive/50 bg-destructive/10 px-4 py-3 text-left text-sm text-destructive"
              >
                Wrong network — click to switch to Base Sepolia.
              </button>
            )}
            <PointsSection />
            <MintCard />
            <NftSection />
          </>
        )}
      </main>
      <Toaster />
    </div>
  );
}

function Page() {
  return (
    <WalletProvider>
      <Dashboard />
    </WalletProvider>
  );
}
