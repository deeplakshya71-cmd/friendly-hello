import { createFileRoute } from "@tanstack/react-router";
import { LevelCard } from "@/components/LevelCard";
import { MintCard } from "@/components/MintCard";
import { NftSection } from "@/components/NftSection";
import { PointsSection } from "@/components/PointsSection";
import { Component as Hero } from "@/components/ui/hero";
import { Toaster } from "@/components/ui/sonner";
import { WalletProvider, useWallet } from "@/hooks/useWallet";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Litdex Champions — Testnet Points & NFT Progression" },
      {
        name: "description",
        content:
          "Connect your wallet on Base Sepolia to claim LitVM points, mint a Litdex champion, and level it up to Legend.",
      },
      { property: "og:title", content: "Litdex Champions" },
      {
        property: "og:description",
        content:
          "Claim LitVM points on Base Sepolia, mint Litdex champions, and level up, repair, promote and transfer them.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Dashboard() {
  const { address, correctNetwork, switchNetwork, connect } = useWallet();

  const scrollToMint = () =>
    document.getElementById("mint")?.scrollIntoView({ behavior: "smooth", block: "center" });

  return (
    <div className="min-h-screen bg-[#0038FF]">
      <Hero onMintClick={scrollToMint} />

      <section className="relative z-20 -mt-10 rounded-t-[2.5rem] bg-white px-4 py-16 md:rounded-t-[4rem]">
        <div className="mx-auto max-w-6xl">
          {!address ? (
            <div className="rounded-[2rem] border-2 border-dashed border-black/15 bg-[#F4F4F2] p-10 text-center">
              <p className="btn-text text-black">
                Connect your wallet to get started
              </p>
              <p className="btn-text mt-2 text-black/50">
                Litdex runs on Base Sepolia (chain 84532).
              </p>
              <button
                onClick={() => void connect()}
                className="btn fx-9 btn-pill btn-lime mt-6"
              >
                <span className="btn-label">Connect wallet</span>
              </button>
            </div>
          ) : (
            <>
              {!correctNetwork && (
                <button
                  onClick={() => void switchNetwork()}
                  className="btn fx-9 btn-pill btn-blue mb-8 w-full"
                >
                  <span className="btn-label">switch to base</span>
                </button>
              )}
              <MintCard />
              <div id="points" className="mt-6 grid scroll-mt-24 gap-6 md:grid-cols-2">
                <PointsSection />
                <LevelCard />
              </div>
              <NftSection />
            </>
          )}
        </div>
      </section>
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
