import { ethers } from "ethers";

export const BASE_SEPOLIA_CHAIN_ID = 84532;
export const BASE_SEPOLIA_HEX = "0x14a34";

export const USDT_ADDRESS = "0x02b8b8090dFFb61dE134A9e639577E9c153Ac871";
export const POINTS_ADDRESS = "0x904b369740813dc56dE2fc457F60F832354427e0";
export const NFT_ADDRESS = "0xd7E5A73D66D202CD211290536eab5096E8a5114F";

export const API_BASE = "https://litdex-nft.test-hub.xyz";

export const USDT_ABI = [
  "function approve(address spender, uint256 amount) returns (bool)",
  "function balanceOf(address) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
];

export const POINTS_ABI = [
  "function balance(address) view returns (uint256)",
  "function claimed(address) view returns (uint256)",
  "function claim(uint256 totalEarned, uint256 expiry, bytes signature) external",
];

export const NFT_ABI = [
  "function mint() external",
  "function levelUp(uint256 tokenId) external",
  "function promote(uint256 tokenId) external",
  "function repair(uint256 tokenId) external",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function balanceOf(address owner) view returns (uint256)",
  "function tokenState(uint256 tokenId) view returns (uint8 rarity, uint8 level, bool damaged, uint32 gamesAtMaxLevel)",
  "function nextTokenId() view returns (uint256)",
  "function pointsPerLevel(uint8 level) view returns (uint256)",
  "function commonSupplyCap() view returns (uint256)",
  "function rarityMinted(uint8 rarity) view returns (uint256)",
  "function mintPriceUSDT() view returns (uint256)",
  "function config(bytes32 key) view returns (uint256)",
  "function transferFrom(address from, address to, uint256 tokenId) external",
  "function approve(address to, uint256 tokenId) external",
];

export const CONFIG_REPAIR_COST = ethers.keccak256(ethers.toUtf8Bytes("repairCostUSDT"));
export const CONFIG_GAMES_REQUIRED = ethers.keccak256(
  ethers.toUtf8Bytes("gamesRequiredForPromotion"),
);

export const RARITY_NAMES = ["Common", "Rare", "Epic", "Legend"] as const;
export const MAX_LEVEL = 9;

export const RARITY_CLASS: Record<number, string> = {
  0: "bg-secondary text-secondary-foreground",
  1: "bg-primary/20 text-primary",
  2: "bg-accent/25 text-accent",
  3: "bg-chart-3/25 text-chart-3",
};

export function truncateAddress(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function formatUsdt(value: bigint) {
  const whole = value / 1_000_000n;
  const frac = value % 1_000_000n;
  if (frac === 0n) return whole.toString();
  return `${whole}.${frac.toString().padStart(6, "0").replace(/0+$/, "")}`;
}

export function formatPoints(value: bigint | string) {
  const v = typeof value === "string" ? value : value.toString();
  return v.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function openSeaUrl(tokenId: string | bigint) {
  return `https://testnets.opensea.io/assets/base-sepolia/${NFT_ADDRESS}/${tokenId.toString()}`;
}

export function parseWalletError(err: unknown, fallback: string) {
  const e = err as { code?: string | number; shortMessage?: string; message?: string };
  if (e?.code === "ACTION_REJECTED" || e?.code === 4001) return "Transaction rejected in wallet.";
  return fallback;
}

export type OwnedNft = {
  tokenId: bigint;
  rarity: number;
  level: number;
  damaged: boolean;
  gamesAtMaxLevel: number;
};
