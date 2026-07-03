"use client";

import { QRCodeSVG } from "qrcode.react";
import { useJoinUrl } from "@/lib/app-url";

export function SessionQRCode({ sessionCode }: { sessionCode: string }) {
  const joinUrl = useJoinUrl(sessionCode);

  return (
    <div className="kanto-card flex items-center gap-4 p-4 text-foreground">
      <div className="rounded-md border bg-card p-2 shadow-[var(--shadow-soft)]">
        <QRCodeSVG value={joinUrl} size={128} includeMargin />
      </div>
      <div className="min-w-0">
        <p className="kanto-eyebrow">Entrar pelo celular</p>
        <p className="mt-1 text-3xl font-black text-primary">{sessionCode}</p>
        <p className="mt-1 break-all text-xs text-muted-foreground">
          {joinUrl}
        </p>
      </div>
    </div>
  );
}
