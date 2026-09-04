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
              <p
                className="text-2xl font-black tracking-tight text-black uppercase"
                style={{ fontFamily: '"Arial Black", Impact, sans-serif' }}
              >
                Connect your wallet to get started
              </p>
              <p className="mt-2 text-sm text-black/50">
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
                  className="mb-8 w-full rounded-[2rem] border-2 border-[#FF4D4D]/40 bg-[#FF4D4D]/10 px-6 py-4 text-left text-sm font-semibold text-[#D43232]"
                >
                  Wrong network — click to switch to Base Sepolia.
                </button>
              )}
              <div id="points" className="grid scroll-mt-24 gap-6 md:grid-cols-3">
                <PointsSection />
                <MintCard />
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
