"use client";

import Image from "next/image";
import type { QueueItemDTO } from "@/types/karaoke";

export function CurrentSong({ item }: { item: QueueItemDTO | undefined }) {
  if (!item) {
    return (
      <div className="grid min-h-[220px] place-items-center rounded-lg border bg-white p-8 text-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Kanto</p>
          <h1 className="mt-2 text-4xl font-bold">Aguardando novas músicas...</h1>
        </div>
      </div>
    );
  }

  return (
    <section className="grid gap-4 lg:grid-cols-[220px_1fr] lg:items-center">
      <Image src={item.song.thumbnail} alt="" width={320} height={180} className="aspect-video w-full rounded-lg object-cover" priority />
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-secondary">Agora cantando</p>
        <h1 className="mt-1 text-5xl font-bold leading-tight md:text-7xl">{item.participant.name}</h1>
        <p className="mt-4 text-2xl text-muted-foreground md:text-4xl">{item.song.title}</p>
      </div>
    </section>
  );
}