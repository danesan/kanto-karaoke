"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { GuestQueue } from "@/components/guest/guest-queue";
import { GuestSearch } from "@/components/guest/guest-search";
import { guestStorageKey } from "@/components/guest/join-session-form";
import { useGuestQueue, useGuestQueueMutations } from "@/hooks/use-queue";
import { useQueueRealtime } from "@/hooks/use-queue-realtime";
import { useSessionByCode } from "@/hooks/use-sessions";
import type { ParticipantDTO } from "@/types/karaoke";

export function GuestScreen({ sessionCode }: { sessionCode: string }) {
  const router = useRouter();
  const session = useSessionByCode(sessionCode);
  const [participant, setParticipant] = useState<ParticipantDTO | null>(null);
  const participantId = participant?.id ?? "";
  const queue = useGuestQueue(sessionCode, participantId || undefined);
  const mutations = useGuestQueueMutations(sessionCode, participantId);

  useQueueRealtime(session.data?.id ?? "", sessionCode);

  useEffect(() => {
    const raw = window.localStorage.getItem(guestStorageKey(sessionCode));

    if (!raw) {
      router.replace(`/join/${sessionCode}`);
      return;
    }

    try {
      const parsed = JSON.parse(raw) as { participant?: ParticipantDTO };
      setParticipant(parsed.participant ?? null);
    } catch {
      router.replace(`/join/${sessionCode}`);
    }
  }, [router, sessionCode]);

  const title = useMemo(
    () => session.data?.name ?? `Sessão ${sessionCode}`,
    [session.data?.name, sessionCode]
  );

  if (!participant) {
    return (
      <main className="grid min-h-screen place-items-center p-4 text-sm text-muted-foreground">
        Carregando...
      </main>
    );
  }

  return (
    <main className="mx-auto grid min-h-screen w-full max-w-7xl gap-6 px-5 py-8 lg:grid-cols-[minmax(0,1fr)_420px]">
      <section className="space-y-4">
        <header className="kanto-topbar -mx-5 flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="kanto-eyebrow">Convidado</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight">{title}</h1>
            <p className="text-sm text-muted-foreground">
              Entrou como {participant.name}
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href={`/join/${sessionCode}`}>Trocar nome</Link>
          </Button>
        </header>
        <GuestSearch
          defaultSingerName={participant.name}
          isAdding={mutations.add.isPending}
          onAdd={async (songId, singerName) => {
            await mutations.add.mutateAsync({ songId, singerName });
          }}
        />
      </section>

      <GuestQueue
        items={queue.data ?? []}
        participantId={participant.id}
        isLoading={queue.isLoading}
        onRemoveOwn={(queueItemId) => mutations.removeOwn.mutate(queueItemId)}
      />
    </main>
  );
}
