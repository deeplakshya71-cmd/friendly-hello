import { motion } from "motion/react";
import type { ReactNode } from "react";
import { useBasePoints, useMintInfo } from "@/hooks/useLitdex";
import { useWallet } from "@/hooks/useWallet";
import { formatPoints, truncateAddress } from "@/lib/litdex";

// --- Custom SVG Components for Hand-Drawn Accents ---

export const ArrowGreenLeft = () => (
  <svg
    width="120"
    height="90"
    viewBox="0 0 120 90"
    fill="none"
    className="text-primary"
    aria-hidden="true"
  >
    <path
      d="M110 12 C 80 30, 55 45, 30 62"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
    />
    <path
      d="M42 52 L 28 64 L 44 72"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

export const ArrowGreenRight = () => (
  <svg
    width="120"
    height="90"
    viewBox="0 0 120 90"
    fill="none"
    className="text-primary"
    aria-hidden="true"
  >
    <path
      d="M10 14 C 42 32, 68 46, 92 60"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
    />
    <path
      d="M78 52 L 94 62 L 80 74"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

export const ArrowBlack1 = () => (
  <svg
    width="90"
    height="70"
    viewBox="0 0 90 70"
    fill="none"
    className="text-foreground"
    aria-hidden="true"
  >
    <path
      d="M8 10 C 30 26, 52 38, 74 52"
      stroke="currentColor"
      strokeWidth="3.5"
      strokeLinecap="round"
    />
    <path
      d="M60 46 L 76 54 L 62 62"
      stroke="currentColor"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

export const ArrowBlack2 = () => (
  <svg
    width="90"
    height="70"
    viewBox="0 0 90 70"
    fill="none"
    className="text-foreground"
    aria-hidden="true"
  >
    <path
      d="M82 10 C 60 26, 38 38, 16 52"
      stroke="currentColor"
      strokeWidth="3.5"
      strokeLinecap="round"
    />
    <path
      d="M30 46 L 14 54 L 28 62"
      stroke="currentColor"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

export const CircularBadge = ({ text }: { text: string }) => (
  <div className="relative size-28 md:size-36">
    <motion.svg
      viewBox="0 0 200 200"
      className="size-full"
      animate={{ rotate: 360 }}
      transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
      aria-hidden="true"
    >
      <defs>
        <path
          id="badge-circle"
          d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0"
        />
      </defs>
      <circle cx="100" cy="100" r="98" className="fill-primary" />
      <text className="fill-primary-foreground font-mono text-[15px] font-bold tracking-[0.22em] uppercase">
        <textPath href="#badge-circle">{text}</textPath>
      </text>
    </motion.svg>
    <svg
      viewBox="0 0 24 24"
      className="absolute inset-0 m-auto size-8 text-primary-foreground"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M7 17 L17 7" />
      <path d="M8 7 h9 v9" />
    </svg>
  </div>
);

function GlassPill({ title, value }: { title: string; value: ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-full border border-border/60 bg-card/70 py-2 pr-6 pl-2 shadow-lg backdrop-blur-md">
      <div className="grid size-9 place-items-center rounded-full bg-primary font-mono text-xs font-bold text-primary-foreground">
        LX
      </div>
      <div className="leading-tight">
        <p className="font-mono text-xs text-muted-foreground">{title}</p>
        <p className="font-mono text-sm font-bold text-foreground">{value}</p>
      </div>
    </div>
  );
}

export const Component = () => {
  const { address } = useWallet();
  const { data: points } = useBasePoints();
  const { data: mintInfo } = useMintInfo();

  return (
    <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/40">
      {/* Background Grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--color-border) 1px, transparent 1px), linear-gradient(to bottom, var(--color-border) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
        aria-hidden="true"
      />

      <div className="relative px-6 pt-14 pb-20 md:pt-20 md:pb-28">
        {/* Massive Typography & Elements Container */}
        <div className="relative mx-auto max-w-3xl">
          {/* Text Stack */}
          <div className="font-display text-center leading-[0.85] tracking-tight uppercase select-none">
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-[17vw] text-primary md:text-8xl lg:text-9xl"
            >
              #LITDEX
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.12 }}
              className="text-[15vw] text-foreground md:text-7xl lg:text-8xl"
            >
              TESTNET
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.24 }}
              className="text-[15vw] md:text-7xl lg:text-8xl"
              style={{
                WebkitTextStroke: "2px var(--color-foreground)",
                color: "transparent",
              }}
            >
              SEASON
            </motion.p>
          </div>

          {/* Absolute Overlays (Cards, Arrows, Badge) */}
          <div className="pointer-events-none absolute inset-0 hidden md:block">
            {/* Floating Glass Card 1 (Bottom Left) */}
            <motion.div
              className="absolute bottom-2 -left-24"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              <GlassPill
                title={address ? truncateAddress(address) : "base points"}
                value={`${formatPoints(points ?? 0n)} pts`}
              />
            </motion.div>

            {/* Floating Glass Card 2 (Top Right) */}
            <motion.div
              className="absolute -top-6 -right-24"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <GlassPill
                title="commons minted"
                value={
                  mintInfo ? `${mintInfo.minted.toString()} / ${mintInfo.cap.toString()}` : "— / —"
                }
              />
            </motion.div>

            {/* Decorative Arrows */}
            <div className="absolute top-6 -left-32 rotate-6">
              <ArrowGreenLeft />
            </div>
            <div className="absolute -right-32 bottom-16 -rotate-6">
              <ArrowGreenRight />
            </div>

            {/* Circular Badge */}
            <div className="absolute -bottom-10 right-4">
              <CircularBadge text="MINT • LEVEL UP • PROMOTE • MINT • LEVEL UP • " />
            </div>
          </div>
        </div>

        <p className="relative mx-auto mt-10 max-w-md text-center font-mono text-xs leading-relaxed tracking-widest text-muted-foreground uppercase">
          Claim LitVM points · Mint your NFT · Level it to Legend
        </p>
      </div>
    </section>
  );
};
