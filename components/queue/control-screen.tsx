"use client";

import Link from "next/link";
import { MonitorPlay } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ParticipantDialog } from "@/components/search/participant-dialog";
import { Queue } from "@/components/queue/queue";
import { SearchBar } from "@/components/search/search-bar";
import { SearchResults } from "@/components/search/search-results";
import { useQueue, useQueueMutations } from "@/hooks/use-queue";
import { useQueueRealtime } from "@/hooks/use-queue-realtime";
import { useSearchSongs } from "@/hooks/use-search-songs";
import { useSession } from "@/hooks/use-sessions";
import type { SearchResultDTO } from "@/types/karaoke";

export function ControlScreen({ sessionId }: { sessionId: string }) {
  const [term, setTerm] = useState("");
  const [submittedTerm, setSubmittedTerm] = useState("");
  const [selectedSong, setSelectedSong] = useState<SearchResultDTO | null>(null);
  const session = useSession(sessionId);
  const search = useSearchSongs(submittedTerm);
  const queue = useQueue(sessionId);
  const mutations = useQueueMutations(sessionId);
  const playerHref = session.data?.code ? `/player/${session.data.code}` : `/session/${sessionId}/player`;

  useQueueRealtime(sessionId, session.data?.code);

  function submitSearch() {
    const nextTerm = term.trim();

    if (nextTerm.length < 2) {
      return;
    }

    if (nextTerm === submittedTerm) {
      void search.refetch();
      return;
    }

    setSubmittedTerm(nextTerm);
  }

  async function addSong(singerName: string) {
    if (!selectedSong) {
      return;
    }

    await mutations.add.mutateAsync({ songId: selectedSong.id, singerName });
    setSelectedSong(null);
  }

  return (
    <main className="mx-auto grid min-h-screen w-full max-w-7xl gap-5 px-4 py-5 lg:grid-cols-[minmax(0,1fr)_420px]">
      <section className="space-y-4">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">Controle</p>
            <h1 className="text-2xl font-bold">{session.data?.name ?? `Sessão ${sessionId}`}</h1>
            {session.data?.code ? <p className="text-sm font-semibold text-primary">Código {session.data.code}</p> : null}
          </div>
          <Button asChild variant="outline">
            <Link href={playerHref} target="_blank">
              <MonitorPlay className="h-4 w-4" />
              Abrir player
            </Link>
          </Button>
        </header>
        <SearchBar
          value={term}
          isLoading={search.isFetching}
          onChange={setTerm}
          onSubmit={submitSearch}
        />
        <SearchResults songs={search.songs} isLoading={search.isFetching} onAdd={setSelectedSong} />
      </section>

      <Queue
        items={queue.data ?? []}
        isLoading={queue.isLoading}
        onMove={(queueItemId, direction) => mutations.move.mutate({ queueItemId, direction })}
        onRemove={(queueItemId) => mutations.remove.mutate(queueItemId)}
        onClear={() => mutations.clear.mutate()}
      />

      <ParticipantDialog song={selectedSong} onClose={() => setSelectedSong(null)} onSubmit={addSong} />
    </main>
  );
}