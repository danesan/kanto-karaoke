"use client";

import { Mic2 } from "lucide-react";

export function IdleScreen() {
  return (
    <div className="grid h-full place-items-center bg-card px-8 text-center text-foreground">
      <div className="max-w-2xl">
        <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-gradient-to-r from-primary to-primary/70 text-primary-foreground shadow-[var(--shadow-soft)]">
          <Mic2 className="h-12 w-12" />
        </div>
        <h2 className="mt-8 text-4xl font-black leading-tight lg:text-6xl">
          Aguardando novas músicas...
        </h2>
        <p className="mt-5 text-2xl font-bold text-muted-foreground">
          Escaneie o QR Code e escolha sua próxima música.
        </p>
      </div>
    </div>
  );
}
