"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { BlockSongDialog } from "@/components/admin/block-song-dialog";
import { CacheSongTable } from "@/components/admin/cache-song-table";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { SongDTO } from "@/types/karaoke";

export function CacheManager({ sessionCode }: { sessionCode: string }) {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<SongDTO | null>(null);
  const [blocking, setBlocking] = useState<SongDTO | null>(null);
  const [terms, setTerms] = useState<SongDTO | null>(null);
  const [displayTitle, setDisplayTitle] = useState("");

  const cache = useQuery({
    queryKey: ["song-cache", sessionCode, query],
    queryFn: async () => {
      const response = await fetch(
        `/api/songs/cache?sessionCode=${sessionCode}&q=${encodeURIComponent(query)}`
      );
      if (!response.ok) throw new Error("Could not load cache");
      return ((await response.json()) as { songs: SongDTO[] }).songs;
    }
  });

  const invalidate = () =>
    void queryClient.invalidateQueries({
      queryKey: ["song-cache", sessionCode]
    });
  const action = useMutation({
    mutationFn: async ({
      path,
      method = "POST",
      body
    }: {
      path: string;
      method?: string;
      body?: unknown;
    }) => {
      const response = await fetch(path, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionCode, ...(body as object | undefined) })
      });
      if (!response.ok) throw new Error("Cache action failed");
      return response.json();
    },
    onSuccess: invalidate
  });

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl space-y-6 px-5 py-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="kanto-eyebrow">Admin - Cache</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight">
            Músicas salvas
          </h1>
        </div>
        <Button asChild variant="outline">
          <Link href={`/admin/${sessionCode}`}>
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
        </Button>
      </header>

      <section className="kanto-card flex flex-col gap-3 p-5 sm:flex-row">
        <label className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-10"
            placeholder="Buscar por título, canal ou ID"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <Button
          variant="outline"
          onClick={() =>
            action.mutate({
              path: "/api/songs/cache/old",
              method: "DELETE",
              body: { days: 30 }
            })
          }
        >
          <Trash2 className="h-4 w-4" />
          Limpar antigos
        </Button>
      </section>

      <CacheSongTable
        songs={cache.data ?? []}
        onEdit={(song) => {
          setEditing(song);
          setDisplayTitle(song.displayTitle ?? song.title);
        }}
        onFavorite={(song) =>
          action.mutate({
            path: `/api/songs/${song.id}/${song.isFavorite ? "unfavorite" : "favorite"}`
          })
        }
        onBlock={(song) =>
          song.isBlocked
            ? action.mutate({ path: `/api/songs/${song.id}/unblock` })
            : setBlocking(song)
        }
        onTerms={setTerms}
      />

      <Dialog
        open={Boolean(editing)}
        title="Editar título exibido"
        onClose={() => setEditing(null)}
      >
        <div className="space-y-4">
          <Input
            value={displayTitle}
            onChange={(event) => setDisplayTitle(event.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setEditing(null)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                if (editing)
                  action.mutate({
                    path: `/api/songs/${editing.id}`,
                    method: "PATCH",
                    body: { displayTitle }
                  });
                setEditing(null);
              }}
            >
              Salvar
            </Button>
          </div>
        </div>
      </Dialog>

      <Dialog
        open={Boolean(terms)}
        title="Termos de busca"
        onClose={() => setTerms(null)}
      >
        <div className="space-y-2">
          {terms?.searchTerms?.length ? (
            terms.searchTerms.map((term) => (
              <p key={term} className="rounded-full bg-muted px-3 py-2 text-sm">
                {term}
              </p>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              Sem termos registrados.
            </p>
          )}
        </div>
      </Dialog>

      <BlockSongDialog
        open={Boolean(blocking)}
        onClose={() => setBlocking(null)}
        onConfirm={(reason) => {
          if (blocking)
            action.mutate({
              path: `/api/songs/${blocking.id}/block`,
              body: { reason }
            });
          setBlocking(null);
        }}
      />
    </main>
  );
}
