import { motion } from "motion/react";
import { useWallet } from "@/hooks/useWallet";
import { truncateAddress } from "@/lib/litdex";

const ArrowGreenLeft = () => (
  <svg
    viewBox="0 0 100 100"
    className="h-full w-full overflow-visible stroke-current text-[#CCFF00]"
    fill="none"
    strokeWidth="6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10,90 C 10,40 40,20 60,50 C 70,65 80,75 95,70" />
    <path d="M80,55 L95,70 L85,85" />
  </svg>
);

const ArrowGreenRight = () => (
  <svg
    viewBox="0 0 100 100"
    className="h-full w-full overflow-visible stroke-current text-[#CCFF00]"
    fill="none"
    strokeWidth="6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M90,10 C 80,60 60,80 40,60 C 20,40 40,20 60,30 C 80,40 70,70 50,80" />
    <path d="M65,75 L50,80 L55,65" />
  </svg>
);

const CircularBadge = ({ onClick }: { onClick?: () => void }) => (
  <div
    onClick={onClick}
    className="relative flex h-28 w-28 rotate-12 cursor-pointer items-center justify-center rounded-full border-[3px] border-black/5 bg-[#CCFF00] shadow-xl transition-transform hover:scale-105 md:h-36 md:w-36"
  >
    <div className="absolute inset-1 animate-[spin_10s_linear_infinite]">
      <svg viewBox="0 0 100 100" className="h-full w-full">
        <path
          id="circlePath"
          d="M 50, 50 m -36, 0 a 36,36 0 1,1 72,0 a 36,36 0 1,1 -72,0"
          fill="none"
        />
        <text className="text-[11px] font-black tracking-[0.18em] uppercase" fill="black">
          <textPath href="#circlePath" startOffset="0%">
            MINT A CHAMPION • MINT A CHAMPION •
          </textPath>
        </text>
      </svg>
    </div>
    <div className="absolute inset-0 flex items-center justify-center">
      <svg
        viewBox="0 0 100 100"
        className="h-10 w-10 overflow-visible stroke-current text-black"
        fill="none"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20,80 Q 40,50 30,30 T 80,20" />
        <path d="M60,10 L80,20 L70,40" />
      </svg>
    </div>
  </div>
);

const HARD_SHADOW =
  "1px 1px 0 #001A99, 2px 2px 0 #001A99, 3px 3px 0 #001A99, 4px 4px 0 #001A99, 5px 5px 0 #001A99, 6px 6px 0 #001A99, 7px 7px 0 #001A99, 8px 8px 0 #001A99, 9px 9px 0 #001A99, 10px 10px 0 #001A99, 11px 11px 0 #001A99, 12px 12px 0 #001A99, 13px 13px 0 #001A99, 14px 14px 0 #001A99";

const NAV_LINKS: Array<[string, string]> = [
  ["Champions", "#champions"],
  ["My points", "#points"],
  ["Levels", "#levels"],
  ["Mint", "#mint"],
];

export const Component = ({ onMintClick }: { onMintClick?: () => void }) => {
  const { address, connect, connecting, hasWallet, disconnect } = useWallet();

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-[#0038FF] font-sans selection:bg-[#CCFF00] selection:text-black">
      <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(to_right,#ffffff15_1px,transparent_1px),linear-gradient(to_bottom,#ffffff15_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>

      <nav className="relative z-20 mx-auto flex w-full max-w-[1440px] items-center justify-between px-6 py-6 md:px-10 md:py-8">
        <div className="flex items-center gap-1">
          <div className="relative rounded-2xl rounded-bl-sm bg-white px-3 py-1.5 text-xs font-black tracking-tight text-black shadow-sm md:text-sm">
            LITDEX
            <div
              className="absolute -bottom-1.5 left-0 h-3 w-3 bg-white"
              style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }}
            ></div>
          </div>
          <div className="rounded-full border-[1.5px] border-white bg-[#CCFF00] px-3 py-1.5 text-xs font-black text-black shadow-sm md:text-sm">
            TESTNET
          </div>
        </div>

        <div className="hidden items-center space-x-2 md:flex">
          {NAV_LINKS.map(([item, href]) => (
            <a
              key={item}
              href={href}
              className="rounded-full border border-white/30 px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white/10"
            >
              {item}
            </a>
          ))}
        </div>

        {address ? (
          <button
            onClick={disconnect}
            className="rounded-full border border-white bg-white px-6 py-2 font-mono text-xs font-semibold text-[#0038FF] transition-colors hover:bg-[#CCFF00] hover:text-black md:text-sm"
          >
            {truncateAddress(address)}
          </button>
        ) : (
          <button
            onClick={() => void connect()}
            disabled={connecting}
            className="rounded-full border border-white px-6 py-2 text-xs font-semibold text-white transition-colors hover:bg-white hover:text-[#0038FF] md:text-sm"
          >
            {connecting ? "Connecting…" : hasWallet ? "Connect wallet" : "Install wallet"}
          </button>
        )}
      </nav>

      <main className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-1 flex-col items-center justify-center px-4 pt-8 pb-32 md:pt-12 md:pb-48">
        <div className="relative z-10 mx-auto mt-4 mb-16 flex w-full max-w-5xl flex-col items-center justify-center text-center">
          <div className="relative z-10 flex w-full flex-col items-center space-y-2 md:space-y-4">
            <div className="relative z-30 flex w-full justify-start pl-[10%] md:pl-[25%]">
              <h1
                className="m-0 p-0 text-[clamp(4.5rem,12vw,160px)] leading-[0.85] font-black tracking-tighter text-[#CCFF00] uppercase"
                style={{ fontFamily: '"Arial Black", Impact, sans-serif', textShadow: HARD_SHADOW }}
              >
                #LITDEX
              </h1>
            </div>

            <div className="relative z-20 flex w-full justify-center">
              <h1
                className="m-0 p-0 text-[clamp(5rem,15vw,220px)] leading-[0.85] font-black tracking-tighter text-white uppercase"
                style={{ fontFamily: '"Arial Black", Impact, sans-serif', textShadow: HARD_SHADOW }}
              >
                CHAMPIONS
              </h1>
            </div>

            <div className="relative z-10 flex w-full justify-start pl-[15%] md:pl-[30%]">
              <h1
                className="m-0 p-0 text-[clamp(4.5rem,12vw,160px)] leading-[0.85] font-black tracking-tighter text-white uppercase"
                style={{ fontFamily: '"Arial Black", Impact, sans-serif', textShadow: HARD_SHADOW }}
              >
                RISE
              </h1>
            </div>
          </div>

          <div className="pointer-events-none absolute inset-0 h-full w-full">
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="pointer-events-auto absolute bottom-[10%] left-[5%] z-30 md:left-[20%]"
            >
              <div className="flex aspect-[3/3.5] w-40 rotate-[-12deg] flex-col items-center justify-center rounded-[2rem] border border-white/40 bg-white/20 p-5 shadow-2xl backdrop-blur-md transition-transform duration-500 hover:rotate-0 md:w-52">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-white/50 bg-[#4D9FFF] shadow-inner md:h-24 md:w-24"></div>
                <div className="mt-2 text-center">
                  <p className="text-sm font-bold text-white md:text-lg">Champion #1</p>
                  <p className="mt-1 text-[10px] text-white/80 md:text-xs">Common · Lv 4</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="pointer-events-auto absolute top-[15%] right-[5%] z-30 md:right-[22%]"
            >
              <div className="flex aspect-[3/3.5] w-40 rotate-[12deg] flex-col items-center justify-center rounded-[2rem] border border-white/40 bg-white/20 p-5 shadow-2xl backdrop-blur-md transition-transform duration-500 hover:rotate-0 md:w-52">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-white/50 bg-[#C24DFF] shadow-inner md:h-24 md:w-24"></div>
                <div className="mt-2 text-center">
                  <p className="text-sm font-bold text-white md:text-lg">Champion #9</p>
                  <p className="mt-1 text-[10px] text-white/80 md:text-xs">Rare · Lv 1</p>
                </div>
              </div>
            </motion.div>

            <div className="absolute bottom-[0%] left-[0%] z-20 h-24 w-24 md:left-[10%] md:h-32 md:w-32">
              <ArrowGreenLeft />
            </div>

            <div className="absolute top-[5%] right-[0%] z-20 h-24 w-24 md:right-[10%] md:h-32 md:w-32">
              <ArrowGreenRight />
            </div>

            <div className="pointer-events-auto absolute right-[0%] bottom-[-10%] z-40 md:right-[15%]">
              {onMintClick ? <CircularBadge onClick={onMintClick} /> : <CircularBadge />}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
