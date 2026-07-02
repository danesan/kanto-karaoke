"use client";

import type { QueueItemDTO } from "@/types/karaoke";

export function NextSongs({ items }: { items: QueueItemDTO[] }) {
  return (
    <section className="kanto-card p-5">
      <h2 className="mb-3 text-sm font-bold uppercase tracking-[0.16em] text-muted-foreground">
        Próximas músicas
      </h2>
      <div className="grid gap-3 md:grid-cols-3">
        {items.slice(0, 3).map((item) => (
          <div key={item.id} className="rounded-md border bg-muted/50 p-3">
            <p className="text-sm font-bold">{item.participant.name}</p>
            <p className="truncate text-sm text-muted-foreground">
              {item.song.title}
            </p>
          </div>
        ))}
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sem próximas músicas.</p>
        ) : null}
      </div>
    </section>
  );
}
