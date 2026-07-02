"use client";

import type { QueueItemDTO } from "@/types/karaoke";

export function CountdownOverlay({ item, remaining }: { item: QueueItemDTO | undefined; remaining: number }) {
  return (
    <div className="absolute inset-0 z-10 grid place-items-center bg-background/95 px-8 text-center backdrop-blur-lg transition-opacity">
      <div className="max-w-3xl">
        <p className="text-5xl font-black text-primary">🎤 Prepare-se!</p>
        <p className="mt-8 text-sm font-black uppercase tracking-[0.2em] text-muted-foreground">
          Próximo cantor
        </p>
        <h2 className="mt-4 break-words text-6xl font-black uppercase leading-tight text-foreground [overflow-wrap:anywhere] lg:text-8xl">
          {item?.participant.name ?? "Aguardando"}
        </h2>
        <p className="mt-5 text-3xl font-bold text-muted-foreground lg:text-4xl">
          ♪ {item?.song.effectiveTitle ?? item?.song.title ?? "Próxima música"}
        </p>
        <p className="mt-12 text-sm font-black uppercase tracking-[0.2em] text-muted-foreground">
          Começando em...
        </p>
        <p className="mt-3 text-8xl font-black leading-none text-primary lg:text-9xl">
          {remaining}
        </p>
      </div>
    </div>
  );
}
