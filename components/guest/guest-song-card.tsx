"use client";

import Image from "next/image";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDuration } from "@/lib/utils";
import type { SearchResultDTO } from "@/types/karaoke";

export function GuestSongCard({
  song,
  defaultSingerName,
  isAdding,
  onAdd
}: {
  song: SearchResultDTO;
  defaultSingerName: string;
  isAdding: boolean;
  onAdd: (songId: string, singerName: string) => void;
}) {
  const [singerName, setSingerName] = useState(defaultSingerName);

  return (
    <div className="grid gap-3 rounded-lg border bg-white p-3 sm:grid-cols-[112px_1fr]">
      <Image src={song.thumbnail} alt="" width={112} height={63} className="aspect-video rounded-md object-cover" />
      <div className="min-w-0 space-y-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold">{song.title}</h3>
          <p className="truncate text-xs text-muted-foreground">{song.channel}</p>
          <p className="mt-1 text-xs text-muted-foreground">{formatDuration(song.duration)}</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
          <Input
            value={singerName}
            onChange={(event) => setSingerName(event.target.value)}
            placeholder="Nome do cantor"
          />
          <Button disabled={isAdding || singerName.trim().length === 0} onClick={() => onAdd(song.id, singerName.trim())}>
            <Plus className="h-4 w-4" />
            Adicionar
          </Button>
        </div>
      </div>
    </div>
  );
}