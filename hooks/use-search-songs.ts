"use client";

import { useQuery } from "@tanstack/react-query";
import type { SearchResultDTO } from "@/types/karaoke";

type SearchResponse = {
  songs: SearchResultDTO[];
};

export function useSearchSongs(term: string) {
  const query = useQuery({
    queryKey: ["search", term],
    enabled: term.trim().length >= 2,
    queryFn: async ({ signal }) => {
      const response = await fetch(`/api/search?q=${encodeURIComponent(term)}`, {
        signal
      });

      if (!response.ok) {
        throw new Error("Search failed");
      }

      return (await response.json()) as SearchResponse;
    }
  });

  return {
    ...query,
    songs: query.data?.songs ?? []
  };
}