"use client";

import { ListMusic, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QueueItem } from "@/components/queue/queue-item";
import type { QueueItemDTO } from "@/types/karaoke";

export function Queue({
  items,
  isLoading,
  onMove,
  onRemove,
  onClear
}: {
  items: QueueItemDTO[];
  isLoading: boolean;
  onMove: (queueItemId: string, direction: "up" | "down") => void;
  onRemove: (queueItemId: string) => void;
  onClear: () => void;
}) {
  return (
    <section className="kanto-card">
      <div className="kanto-card-header">
        <div className="flex items-center gap-2">
          <ListMusic className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold">Fila</h2>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={onClear}
          disabled={items.length === 0}
        >
          <Trash2 className="h-4 w-4" />
          Limpar
        </Button>
      </div>
      {isLoading ? (
        <p className="p-4 text-sm text-muted-foreground">Carregando fila...</p>
      ) : null}
      {!isLoading && items.length === 0 ? (
        <p className="p-4 text-sm text-muted-foreground">
          Aguardando novas músicas...
        </p>
      ) : null}
      {items.map((item) => (
        <QueueItem
          key={item.id}
          item={item}
          onMove={(direction) => onMove(item.id, direction)}
          onRemove={() => onRemove(item.id)}
        />
      ))}
    </section>
  );
}
