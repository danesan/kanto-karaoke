"use client";

import { useState } from "react";
import { GuestSongCard } from "@/components/guest/guest-song-card";
import { SearchBar } from "@/components/search/search-bar";
import { useSearchSongs } from "@/hooks/use-search-songs";

export function GuestSearch({
  defaultSingerName,
  isAdding,
  onAdd
}: {
  defaultSingerName: string;
  isAdding: boolean;
  onAdd: (songId: string, singerName: string) => void;
}) {
  const [term, setTerm] = useState("");
  const [submittedTerm, setSubmittedTerm] = useState("");
  const search = useSearchSongs(submittedTerm);

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

  return (
    <section className="space-y-4">
      <SearchBar
        value={term}
        isLoading={search.isFetching}
        onChange={setTerm}
        onSubmit={submitSearch}
      />
      {search.isFetching ? (
        <p className="text-sm text-muted-foreground">Pesquisando...</p>
      ) : null}
      {!submittedTerm ? (
        <p className="text-sm text-muted-foreground">
          Busque uma música para adicionar na fila.
        </p>
      ) : null}
      <div className="grid gap-3">
        {search.songs.map((song) => (
          <GuestSongCard
            key={song.id}
            song={song}
            defaultSingerName={defaultSingerName}
            isAdding={isAdding}
            onAdd={onAdd}
          />
        ))}
      </div>
    </section>
  );
}
