"use client";

import type { QueueItemDTO } from "@/types/karaoke";

export function NextSongs({ items }: { items: QueueItemDTO[] }) {
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold">Próximas músicas</h2>
      <div className="grid gap-2 md:grid-cols-3">
        {items.slice(0, 3).map((item) => (
          <div key={item.id} className="rounded-lg border bg-white p-3">
            <p className="text-sm font-semibold">{item.participant.name}</p>
            <p className="truncate text-sm text-muted-foreground">{item.song.title}</p>
          </div>
        ))}
        {items.length === 0 ? <p className="text-sm text-muted-foreground">Sem próximas músicas.</p> : null}
      </div>
    </section>
  );
}