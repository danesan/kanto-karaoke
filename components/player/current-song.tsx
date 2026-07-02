"use client";

import Image from "next/image";
import type { QueueItemDTO } from "@/types/karaoke";

export function CurrentSong({ item }: { item: QueueItemDTO | undefined }) {
  if (!item) {
    return (
      <div className="grid min-h-[260px] place-items-center kanto-card kanto-neon-panel p-8 text-center">
        <div>
          <p className="kanto-eyebrow">Kanto</p>
          <h1 className="mt-2 text-4xl font-black">
            Aguardando novas músicas...
          </h1>
        </div>
      </div>
    );
  }

  return (
    <section className="kanto-card kanto-neon-panel grid gap-6 p-6 text-center lg:grid-cols-[220px_1fr] lg:items-center lg:text-left">
      <Image
        src={item.song.thumbnail}
        alt=""
        width={320}
        height={180}
        className="aspect-video w-full rounded-md object-cover shadow-[var(--shadow-neon)]"
        priority
      />
      <div>
        <p className="kanto-eyebrow">Agora cantando</p>
        <h1 className="mt-2 text-5xl font-black leading-tight tracking-tight md:text-7xl">
          {item.participant.name}
        </h1>
        <p className="mt-4 text-2xl font-medium text-muted-foreground md:text-4xl">
          {item.song.title}
        </p>
      </div>
    </section>
  );
}
