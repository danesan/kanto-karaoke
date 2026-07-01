"use client";

import { PendingQueueItem } from "@/components/admin/pending-queue-item";
import type { QueueItemDTO } from "@/types/karaoke";

export function PendingQueueList({ items, onApprove, onReject }: { items: QueueItemDTO[]; onApprove: (item: QueueItemDTO) => void; onReject: (item: QueueItemDTO) => void }) {
  return (
    <section className="rounded-lg border bg-white shadow-sm">
      <div className="border-b p-4"><h2 className="text-lg font-semibold">Sugestões pendentes</h2></div>
      {items.length === 0 ? <p className="p-4 text-sm text-muted-foreground">Nenhuma sugestão pendente.</p> : null}
      <div className="divide-y">
        {items.map((item) => <PendingQueueItem key={item.id} item={item} onApprove={() => onApprove(item)} onReject={() => onReject(item)} />)}
      </div>
    </section>
  );
}
