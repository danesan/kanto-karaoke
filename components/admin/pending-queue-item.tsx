"use client";

import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { QueueItemDTO } from "@/types/karaoke";

export function PendingQueueItem({
  item,
  onApprove,
  onReject
}: {
  item: QueueItemDTO;
  onApprove: () => void;
  onReject: () => void;
}) {
  return (
    <div className="grid gap-3 p-4 sm:grid-cols-[88px_1fr_auto] sm:items-center">
      <img
        src={item.song.thumbnail}
        alt=""
        className="h-16 w-24 rounded-md object-cover shadow-[var(--shadow-soft)] sm:w-[88px]"
      />
      <div className="min-w-0">
        <h3 className="truncate text-sm font-bold">
          {item.song.effectiveTitle}
        </h3>
        <p className="truncate text-xs text-muted-foreground">
          {item.song.channel}
        </p>
        <p className="mt-1 text-xs">
          Cantor: <span className="font-semibold">{item.participant.name}</span>
        </p>
        <p className="text-xs text-muted-foreground">
          Enviada em {new Date(item.createdAt).toLocaleString()}
        </p>
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={onApprove}>
          <Check className="h-4 w-4" />
          Aprovar
        </Button>
        <Button size="sm" variant="outline" onClick={onReject}>
          <X className="h-4 w-4" />
          Rejeitar
        </Button>
      </div>
    </div>
  );
}
