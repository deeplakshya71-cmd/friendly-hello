import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ethers } from "ethers";
import { useCallback } from "react";
import { useWallet } from "./useWallet";
import {
  CONFIG_GAMES_REQUIRED,
  CONFIG_REPAIR_COST,
  NFT_ABI,
  NFT_ADDRESS,
  POINTS_ABI,
  POINTS_ADDRESS,
  USDT_ABI,
  USDT_ADDRESS,
  type OwnedNft,
} from "@/lib/litdex";

const READ_RPC = "https://sepolia.base.org";

export function readProvider() {
  return new ethers.JsonRpcProvider(READ_RPC, 84532, { staticNetwork: true });
}

export function nftRead(provider: ethers.Provider) {
  return new ethers.Contract(NFT_ADDRESS, NFT_ABI, provider);
}
export function pointsRead(provider: ethers.Provider) {
  return new ethers.Contract(POINTS_ADDRESS, POINTS_ABI, provider);
}
export function usdtRead(provider: ethers.Provider) {
  return new ethers.Contract(USDT_ADDRESS, USDT_ABI, provider);
}

export function useBasePoints() {
  const { address } = useWallet();
  return useQuery({
    queryKey: ["basePoints", address],
    enabled: !!address,
    queryFn: async (): Promise<bigint> => {
      const c = pointsRead(readProvider());
      return (await c.balance(address)) as bigint;
    },
    refetchInterval: 20000,
  });
}

export function useMintInfo() {
  return useQuery({
    queryKey: ["mintInfo"],
    queryFn: async () => {
      const c = nftRead(readProvider());
      const [price, cap, minted] = await Promise.all([
        c.mintPriceUSDT() as Promise<bigint>,
        c.commonSupplyCap() as Promise<bigint>,
        c.rarityMinted(0) as Promise<bigint>,
      ]);
      return { price, cap, minted };
    },
    refetchInterval: 30000,
  });
}

export function useGameConfig() {
  return useQuery({
    queryKey: ["gameConfig"],
    queryFn: async () => {
      const c = nftRead(readProvider());
      const [repairCost, gamesRequired] = await Promise.all([
        c.config(CONFIG_REPAIR_COST) as Promise<bigint>,
        c.config(CONFIG_GAMES_REQUIRED) as Promise<bigint>,
      ]);
      return { repairCost, gamesRequired };
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useOwnedNfts() {
  const { address } = useWallet();
  return useQuery({
    queryKey: ["ownedNfts", address],
    enabled: !!address,
    queryFn: async (): Promise<OwnedNft[]> => {
      const c = nftRead(readProvider());
      const next = (await c.nextTokenId()) as bigint;
      const ids: bigint[] = [];
      for (let i = 1n; i < next; i++) ids.push(i);

      const owners = await Promise.all(
        ids.map(async (id) => {
          try {
            return (await c.ownerOf(id)) as string;
          } catch {
            return null;
          }
        }),
      );
      const mine = ids.filter(
        (_, i) => owners[i] && owners[i]!.toLowerCase() === address!.toLowerCase(),
      );

      return Promise.all(
        mine.map(async (tokenId) => {
          const s = await c.tokenState(tokenId);
          return {
            tokenId,
            rarity: Number(s[0]),
            level: Number(s[1]),
            damaged: Boolean(s[2]),
            gamesAtMaxLevel: Number(s[3]),
          };
        }),
      );
    },
    refetchInterval: 30000,
  });
}

export function useLevelCost(level: number) {
  const nextLevel = level + 1;
  return useQuery({
    queryKey: ["levelCost", nextLevel],
    enabled: nextLevel <= 9,
    queryFn: async (): Promise<bigint> => {
      const c = nftRead(readProvider());
      return (await c.pointsPerLevel(nextLevel)) as bigint;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useRefreshAll() {
  const qc = useQueryClient();
  return useCallback(async () => {
    await qc.invalidateQueries();
  }, [qc]);
}
