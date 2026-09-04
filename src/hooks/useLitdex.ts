import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ethers } from "ethers";
import { useCallback } from "react";
import { useWallet } from "./useWallet";
import {
  CONFIG_GAMES_REQUIRED,
  CONFIG_REPAIR_COST,
  nftContract,
  pointsContract,
  usdtContract,
  type OwnedNft,
} from "@/lib/litdex";

const READ_RPC = "https://sepolia.base.org";

export function readProvider() {
  return new ethers.JsonRpcProvider(READ_RPC, 84532, { staticNetwork: true });
}

export const nftRead = () => nftContract(readProvider());
export const pointsRead = () => pointsContract(readProvider());
export const usdtRead = () => usdtContract(readProvider());

export function useBasePoints() {
  const { address } = useWallet();
  return useQuery({
    queryKey: ["basePoints", address],
    enabled: !!address,
    queryFn: async (): Promise<bigint> => pointsRead().balance(address!),
    refetchInterval: 20000,
  });
}

export function useMintInfo() {
  return useQuery({
    queryKey: ["mintInfo"],
    queryFn: async () => {
      const c = nftRead();
      const [price, cap, minted] = await Promise.all([
        c.mintPriceUSDT(),
        c.commonSupplyCap(),
        c.rarityMinted(0),
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
      const c = nftRead();
      const [repairCost, gamesRequired] = await Promise.all([
        c.config(CONFIG_REPAIR_COST),
        c.config(CONFIG_GAMES_REQUIRED),
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
      const c = nftRead();
      const next = await c.nextTokenId();
      const ids: bigint[] = [];
      for (let i = 1n; i < next; i++) ids.push(i);

      const owners = await Promise.all(
        ids.map(async (id) => {
          try {
            return await c.ownerOf(id);
          } catch {
            return null;
          }
        }),
      );
      const mine = ids.filter((_, i) => {
        const owner = owners[i];
        return !!owner && owner.toLowerCase() === address!.toLowerCase();
      });

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
    queryFn: async (): Promise<bigint> => nftRead().pointsPerLevel(nextLevel),
    staleTime: 5 * 60 * 1000,
  });
}

export function useNftArtwork(tokenId: bigint | undefined) {
  return useQuery({
    queryKey: ["nftArtwork", tokenId?.toString()],
    enabled: tokenId !== undefined,
    retry: false,
    staleTime: Infinity,
    queryFn: async (): Promise<string | null> => {
      const uri = await nftRead().tokenURI(tokenId!);
      const httpUri = uri.startsWith("ipfs://")
        ? uri.replace("ipfs://", "https://ipfs.io/ipfs/")
        : uri;
      let image: string | null = null;
      if (httpUri.startsWith("data:application/json")) {
        const json = JSON.parse(
          Buffer.from(httpUri.split(",")[1] ?? "", "base64").toString("utf-8"),
        );
        image = json.image ?? null;
      } else {
        const res = await fetch(httpUri);
        if (!res.ok) return null;
        const json = await res.json();
        image = json.image ?? null;
      }
      if (image && image.startsWith("ipfs://")) {
        image = image.replace("ipfs://", "https://ipfs.io/ipfs/");
      }
      return image;
    },
  });
}

export function useRefreshAll() {
  const qc = useQueryClient();
  return useCallback(async () => {
    await qc.invalidateQueries();
  }, [qc]);
}
