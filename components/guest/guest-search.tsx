"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { GuestSongCard } from "@/components/guest/guest-song-card";
import { SearchBar } from "@/components/search/search-bar";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useSearchSongs } from "@/hooks/use-search-songs";

export function GuestSearch({
  defaultSingerName,
  isAdding,
  onAdd
}: {
  defaultSingerName: string;
  isAdding: boolean;
  onAdd: (songId: string, singerName: string) => Promise<void>;
}) {
  const [term, setTerm] = useState("");
  const [submittedTerm, setSubmittedTerm] = useState("");
  const [successOpen, setSuccessOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
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

  function formatAddError(error: unknown) {
    const message = error instanceof Error ? error.message : "Não foi possivel solicitar a música.";

    if (message.includes("Pending suggestion limit reached")) {
      return "Voce já tem o limite de músicas pendentes aguardando aprovação.";
    }

    if (message.includes("Waiting queue limit reached")) {
      return "Voce já tem o limite de músicas aprovadas na fila.";
    }

    if (message.includes("Song already exists")) {
      return "Essa música já está pendente, na fila ou tocando nesta sessão.";
    }

    if (message.includes("Song is blocked")) {
      return "Essa música foi bloqueada pelo administrador.";
    }

    if (message.includes("Session not found")) {
      return "Esta sessão não está mais ativa.";
    }

    return message || "Não foi possível solicitar a música.";
  }

  async function handleAdd(songId: string, singerName: string) {
    try {
      await onAdd(songId, singerName);
      setTerm("");
      setSubmittedTerm("");
      setErrorMessage(null);
      setSuccessOpen(true);

      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    } catch (error) {
      setErrorMessage(formatAddError(error));
    }
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
        {submittedTerm
          ? search.songs.map((song) => (
              <GuestSongCard
                key={song.id}
                song={song}
                defaultSingerName={defaultSingerName}
                isAdding={isAdding}
                onAdd={handleAdd}
              />
            ))
          : null}
      </div>

      <Dialog
        open={successOpen}
        title="Música solicitada"
        onClose={() => setSuccessOpen(false)}
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-xl border border-border/50 bg-secondary p-4">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="font-semibold text-foreground">
                Sua música foi solicitada com sucesso.
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Ela ficará pendente até ser aprovada pelo administrador.
              </p>
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setSuccessOpen(false)}>Ok</Button>
          </div>
        </div>
      </Dialog>

      <Dialog
        open={Boolean(errorMessage)}
        title="Não foi possivel solicitar"
        onClose={() => setErrorMessage(null)}
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/10 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
            <p className="text-sm font-medium text-foreground">{errorMessage}</p>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setErrorMessage(null)}>Entendi</Button>
          </div>
        </div>
      </Dialog>
    </section>
  );
}
