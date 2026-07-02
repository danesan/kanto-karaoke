"use client";

import { PendingQueueItem } from "@/components/admin/pending-queue-item";
import type { QueueItemDTO } from "@/types/karaoke";

export function PendingQueueList({
  items,
  onApprove,
  onReject
}: {
  items: QueueItemDTO[];
  onApprove: (item: QueueItemDTO) => void;
  onReject: (item: QueueItemDTO) => void;
}) {
  return (
    <section className="kanto-card">
      <div className="kanto-card-header">
        <h2 className="text-lg font-bold">Sugestões pendentes</h2>
      </div>
      {items.length === 0 ? (
        <p className="p-6 text-center text-sm text-muted-foreground">
          Nenhuma sugestão pendente.
        </p>
      ) : null}
      <div className="divide-y divide-border">
        {items.map((item) => (
          <PendingQueueItem
            key={item.id}
            item={item}
            onApprove={() => onApprove(item)}
            onReject={() => onReject(item)}
          />
        ))}
      </div>
    </section>
  );
}
