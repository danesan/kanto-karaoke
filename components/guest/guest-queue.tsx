"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { QueueItemDTO } from "@/types/karaoke";

export function GuestQueue({
  items,
  participantId,
  isLoading,
  onRemoveOwn
}: {
  items: QueueItemDTO[];
  participantId: string;
  isLoading: boolean;
  onRemoveOwn: (queueItemId: string) => void;
}) {
  return (
    <section className="kanto-card">
      <div className="kanto-card-header">
        <h2 className="text-lg font-bold">Fila da sessão</h2>
      </div>
      {isLoading ? (
        <p className="p-4 text-sm text-muted-foreground">Carregando fila...</p>
      ) : null}
      {!isLoading && items.length === 0 ? (
        <p className="p-4 text-sm text-muted-foreground">
          Aguardando novas músicas...
        </p>
      ) : null}
      <div className="divide-y divide-border">
        {items.map((item) => {
          const canRemove =
            item.addedByParticipantId === participantId &&
            item.status === "WAITING";

          return (
            <div
              key={item.id}
              className="grid grid-cols-[36px_1fr_auto] items-center gap-3 p-4"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {item.position}
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold">
                  {item.song.title}
                </h3>
                <p className="truncate text-xs text-muted-foreground">
                  {item.participant.name}
                </p>
                <p className="mt-1 text-xs font-semibold text-primary">
                  {item.status}
                </p>
              </div>
              <Button
                aria-label="Remover minha música"
                size="icon"
                variant="ghost"
                disabled={!canRemove}
                onClick={() => onRemoveOwn(item.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
