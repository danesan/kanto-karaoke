"use client";

import { ListMusic, SkipForward, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QueueItem } from "@/components/queue/queue-item";
import type { QueueItemDTO } from "@/types/karaoke";

export function AdminQueueControls({ items, onMove, onRemove, onClear, onSkip }: { items: QueueItemDTO[]; onMove: (id: string, direction: "up" | "down") => void; onRemove: (id: string) => void; onClear: () => void; onSkip: () => void }) {
  const current = items.find((item) => item.status === "PLAYING");
  const waiting = items.filter((item) => item.status === "WAITING");

  return (
    <section className="rounded-lg border bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
        <div className="flex items-center gap-2"><ListMusic className="h-5 w-5 text-primary" /><h2 className="text-lg font-semibold">Fila aguardando</h2></div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={onSkip}><SkipForward className="h-4 w-4" />Pular</Button>
          <Button size="sm" variant="outline" onClick={onClear} disabled={items.length === 0}><Trash2 className="h-4 w-4" />Limpar</Button>
        </div>
      </div>
      <div className="border-b p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Agora tocando</p>
        <p className="mt-1 font-semibold">{current ? current.song.effectiveTitle : "Nada tocando"}</p>
        {current ? <p className="text-sm text-muted-foreground">{current.participant.name}</p> : null}
      </div>
      {waiting.length === 0 ? <p className="p-4 text-sm text-muted-foreground">Fila vazia.</p> : null}
      {waiting.map((item) => <QueueItem key={item.id} item={item} onMove={(direction) => onMove(item.id, direction)} onRemove={() => onRemove(item.id)} />)}
    </section>
  );
}
