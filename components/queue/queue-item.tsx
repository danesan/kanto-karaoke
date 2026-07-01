"use client";

import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { QueueItemDTO } from "@/types/karaoke";

export function QueueItem({
  item,
  onMove,
  onRemove
}: {
  item: QueueItemDTO;
  onMove: (direction: "up" | "down") => void;
  onRemove: () => void;
}) {
  return (
    <div className="grid grid-cols-[36px_1fr_auto] items-center gap-3 border-b p-3 last:border-b-0">
      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted text-sm font-bold">
        {item.position}
      </div>
      <div className="min-w-0">
        <h3 className="truncate text-sm font-semibold">{item.song.title}</h3>
        <p className="truncate text-xs text-muted-foreground">{item.participant.name}</p>
        <p className="mt-1 text-xs font-semibold text-primary">{item.status}</p>
      </div>
      <div className="flex gap-1">
        <Button aria-label="Mover para cima" size="icon" variant="ghost" onClick={() => onMove("up")} disabled={item.status !== "WAITING"}>
          <ArrowUp className="h-4 w-4" />
        </Button>
        <Button aria-label="Mover para baixo" size="icon" variant="ghost" onClick={() => onMove("down")} disabled={item.status !== "WAITING"}>
          <ArrowDown className="h-4 w-4" />
        </Button>
        <Button aria-label="Remover" size="icon" variant="ghost" onClick={onRemove}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}