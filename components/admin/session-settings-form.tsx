"use client";

import { Save } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { SessionDTO } from "@/types/karaoke";

export function SessionSettingsForm({
  session,
  onSave
}: {
  session: SessionDTO;
  onSave: (data: {
    maxPendingPerParticipant: number;
    maxWaitingPerParticipant: number;
    allowDuplicates: boolean;
    moderationEnabled: boolean;
    countdownSeconds: number;
    idleModeEnabled: boolean;
    showCountdown: boolean;
    showNextSongs: boolean;
    showQrCode: boolean;
  }) => void;
}) {
  const [maxPending, setMaxPending] = useState(session.maxPendingPerParticipant);
  const [maxWaiting, setMaxWaiting] = useState(session.maxWaitingPerParticipant);
  const [allowDuplicates, setAllowDuplicates] = useState(session.allowDuplicates);
  const [moderationEnabled, setModerationEnabled] = useState(session.moderationEnabled);
  const [countdownSeconds, setCountdownSeconds] = useState(session.countdownSeconds);
  const [idleModeEnabled, setIdleModeEnabled] = useState(session.idleModeEnabled);
  const [showCountdown, setShowCountdown] = useState(session.showCountdown);
  const [showNextSongs, setShowNextSongs] = useState(session.showNextSongs);
  const [showQrCode, setShowQrCode] = useState(session.showQrCode);

  return (
    <section className="kanto-card p-5">
      <h2 className="text-lg font-bold">Configurações da sessão</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-bold text-muted-foreground">
          Pendentes por part.
          <Input
            type="number"
            min={0}
            max={20}
            value={maxPending}
            onChange={(event) => setMaxPending(Number(event.target.value))}
          />
        </label>
        <label className="space-y-2 text-sm font-bold text-muted-foreground">
          Aguardando por part.
          <Input
            type="number"
            min={0}
            max={20}
            value={maxWaiting}
            onChange={(event) => setMaxWaiting(Number(event.target.value))}
          />
        </label>
        <label className="flex items-center gap-3 rounded-md bg-muted/70 p-3 text-sm font-semibold">
          <input
            type="checkbox"
            checked={allowDuplicates}
            onChange={(event) => setAllowDuplicates(event.target.checked)}
          />
          Permitir duplicadas
        </label>
        <label className="flex items-center gap-3 rounded-md bg-muted/70 p-3 text-sm font-semibold">
          <input
            type="checkbox"
            checked={moderationEnabled}
            onChange={(event) => setModerationEnabled(event.target.checked)}
          />
          Moderação ativa
        </label>
      </div>

      <div className="mt-6 rounded-xl border border-border/50 bg-card p-4">
        <p className="text-sm font-black uppercase tracking-[0.14em] text-muted-foreground">
          Modo Evento
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm font-bold text-muted-foreground">
            Tempo de preparação
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-sm"
              value={countdownSeconds}
              onChange={(event) => setCountdownSeconds(Number(event.target.value))}
            >
              {[5, 10, 15, 20].map((seconds) => (
                <option key={seconds} value={seconds}>
                  {seconds} segundos
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-3 rounded-md bg-muted/70 p-3 text-sm font-semibold">
            <input
              type="checkbox"
              checked={showCountdown}
              onChange={(event) => setShowCountdown(event.target.checked)}
            />
            Mostrar countdown
          </label>
          <label className="flex items-center gap-3 rounded-md bg-muted/70 p-3 text-sm font-semibold">
            <input
              type="checkbox"
              checked={idleModeEnabled}
              onChange={(event) => setIdleModeEnabled(event.target.checked)}
            />
            Ativar modo ambiente
          </label>
          <label className="flex items-center gap-3 rounded-md bg-muted/70 p-3 text-sm font-semibold">
            <input
              type="checkbox"
              checked={showNextSongs}
              onChange={(event) => setShowNextSongs(event.target.checked)}
            />
            Mostrar próximas músicas
          </label>
          <label className="flex items-center gap-3 rounded-md bg-muted/70 p-3 text-sm font-semibold">
            <input
              type="checkbox"
              checked={showQrCode}
              onChange={(event) => setShowQrCode(event.target.checked)}
            />
            Mostrar QR Code
          </label>
        </div>
      </div>

      <Button
        className="mt-5 w-full"
        onClick={() =>
          onSave({
            maxPendingPerParticipant: maxPending,
            maxWaitingPerParticipant: maxWaiting,
            allowDuplicates,
            moderationEnabled,
            countdownSeconds,
            idleModeEnabled,
            showCountdown,
            showNextSongs,
            showQrCode
          })
        }
      >
        <Save className="h-4 w-4" />
        Salvar
      </Button>
    </section>
  );
}
