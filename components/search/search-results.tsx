"use client";

import Image from "next/image";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDuration } from "@/lib/utils";
import type { SearchResultDTO } from "@/types/karaoke";

export function SearchResults({
  songs,
  isLoading,
  onAdd
}: {
  songs: SearchResultDTO[];
  isLoading: boolean;
  onAdd: (song: SearchResultDTO) => void;
}) {
  if (isLoading) {
    return <p className="py-6 text-sm text-muted-foreground">Pesquisando...</p>;
  }

  if (songs.length === 0) {
    return <p className="py-6 text-sm text-muted-foreground">Digite para buscar músicas.</p>;
  }

  return (
    <div className="divide-y rounded-lg border bg-white">
      {songs.map((song) => (
        <div key={song.id} className="grid grid-cols-[96px_1fr_auto] items-center gap-3 p-3">
          <Image
            src={song.thumbnail}
            alt=""
            width={96}
            height={54}
            className="aspect-video rounded-md object-cover"
          />
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold">{song.title}</h3>
            <p className="truncate text-xs text-muted-foreground">{song.channel}</p>
            <p className="mt-1 text-xs text-muted-foreground">{formatDuration(song.duration)}</p>
          </div>
          <Button aria-label="Adicionar a fila" size="icon" onClick={() => onAdd(song)}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}