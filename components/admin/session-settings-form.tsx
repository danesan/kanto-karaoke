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
  }) => void;
}) {
  const [maxPending, setMaxPending] = useState(
    session.maxPendingPerParticipant
  );
  const [maxWaiting, setMaxWaiting] = useState(
    session.maxWaitingPerParticipant
  );
  const [allowDuplicates, setAllowDuplicates] = useState(
    session.allowDuplicates
  );
  const [moderationEnabled, setModerationEnabled] = useState(
    session.moderationEnabled
  );

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
      <Button
        className="mt-5 w-full"
        onClick={() =>
          onSave({
            maxPendingPerParticipant: maxPending,
            maxWaitingPerParticipant: maxWaiting,
            allowDuplicates,
            moderationEnabled
          })
        }
      >
        <Save className="h-4 w-4" />
        Salvar
      </Button>
    </section>
  );
}
