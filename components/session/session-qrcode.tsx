"use client";

import { QRCodeSVG } from "qrcode.react";

export function SessionQRCode({ sessionCode }: { sessionCode: string }) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "";
  const joinUrl = `${appUrl}/join/${sessionCode}`;

  return (
    <div className="flex items-center gap-4 rounded-lg border bg-white p-4 text-foreground">
      <div className="rounded-md bg-white p-2">
        <QRCodeSVG value={joinUrl} size={128} includeMargin />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">Entrar pelo celular</p>
        <p className="mt-1 text-2xl font-bold">{sessionCode}</p>
        <p className="mt-1 break-all text-xs text-muted-foreground">{joinUrl}</p>
      </div>
    </div>
  );
}