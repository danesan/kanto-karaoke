"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ListMusic, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AmbientPlaylistDTO, SongDTO } from "@/types/karaoke";

type PlaylistsResponse = { playlists: AmbientPlaylistDTO[] };
type CacheResponse = {
  songs: SongDTO[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export function AmbientPlaylistEditor({ sessionCode }: { sessionCode: string }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("Playlist ambiente");
  const [query, setQuery] = useState("");

  const playlists = useQuery({
    queryKey: ["ambient-playlists", sessionCode],
    queryFn: async () => {
      const response = await fetch(`/api/ambient-playlists?sessionCode=${sessionCode}`);

      if (!response.ok) {
        throw new Error("Could not load ambient playlists");
      }

      return (await response.json()) as PlaylistsResponse;
    }
  });

  const songs = useQuery({
    queryKey: ["ambient-song-cache", sessionCode, query],
    queryFn: async () => {
      const response = await fetch(
        `/api/songs/cache?sessionCode=${sessionCode}&q=${encodeURIComponent(query)}&page=1&pageSize=8`
      );

      if (!response.ok) {
        throw new Error("Could not load songs");
      }

      return (await response.json()) as CacheResponse;
    },
    enabled: query.trim().length >= 2
  });

  const activePlaylist = useMemo(
    () => playlists.data?.playlists.find((playlist) => playlist.enabled) ?? playlists.data?.playlists[0],
    [playlists.data?.playlists]
  );

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["ambient-playlists", sessionCode] });
  };

  const action = useMutation({
    mutationFn: async ({ method = "POST", body }: { method?: string; body: unknown }) => {
      const response = await fetch("/api/ambient-playlists", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error("Ambient playlist action failed");
      }

      return response.json();
    },
    onSuccess: invalidate
  });

  const itemAction = useMutation({
    mutationFn: async ({ method = "POST", body }: { method?: string; body: unknown }) => {
      const response = await fetch("/api/ambient-playlists/items", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error("Ambient playlist item action failed");
      }

      return response.json();
    },
    onSuccess: invalidate
  });

  return (
    <section className="kanto-card p-5">
      <div className="flex items-center gap-2">
        <ListMusic className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-bold">Playlist ambiente</h2>
      </div>

      {!activePlaylist ? (
        <div className="mt-4 flex gap-2">
          <Input value={name} onChange={(event) => setName(event.target.value)} />
          <Button
            disabled={!name.trim() || action.isPending}
            onClick={() => action.mutate({ body: { sessionCode, name } })}
          >
            <Plus className="h-4 w-4" />
            Criar
          </Button>
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          <div className="rounded-xl border border-border/50 bg-muted/50 p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-black">{activePlaylist.name}</p>
                <p className="text-xs text-muted-foreground">
                  {activePlaylist.items.length} musicas ambiente
                </p>
              </div>
              <Button
                size="sm"
                variant={activePlaylist.enabled ? "default" : "outline"}
                onClick={() =>
                  action.mutate({
                    method: "PATCH",
                    body: {
                      sessionCode,
                      id: activePlaylist.id,
                      enabled: !activePlaylist.enabled
                    }
                  })
                }
              >
                {activePlaylist.enabled ? "Ativa" : "Ativar"}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Input
              placeholder="Buscar no cache para adicionar"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            {query.trim().length >= 2 ? (
              <div className="max-h-52 overflow-y-auto rounded-xl border border-border/50">
                {(songs.data?.songs ?? []).map((song) => (
                  <div key={song.id} className="flex items-center justify-between gap-3 border-b border-border/50 p-3 last:border-b-0">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold">{song.effectiveTitle}</p>
                      <p className="truncate text-xs text-muted-foreground">{song.channel}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={itemAction.isPending}
                      onClick={() =>
                        itemAction.mutate({
                          body: {
                            sessionCode,
                            playlistId: activePlaylist.id,
                            songId: song.id
                          }
                        })
                      }
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {songs.data?.songs.length === 0 ? (
                  <p className="p-3 text-sm text-muted-foreground">Nenhuma musica encontrada.</p>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="divide-y divide-border rounded-xl border border-border/50">
            {activePlaylist.items.length ? (
              activePlaylist.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{item.position}. {item.song.effectiveTitle}</p>
                    <p className="truncate text-xs text-muted-foreground">{item.song.channel}</p>
                  </div>
                  <Button
                    aria-label="Remover musica ambiente"
                    size="icon"
                    variant="ghost"
                    disabled={itemAction.isPending}
                    onClick={() =>
                      itemAction.mutate({
                        method: "DELETE",
                        body: {
                          sessionCode,
                          playlistId: activePlaylist.id,
                          itemId: item.id
                        }
                      })
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            ) : (
              <p className="p-3 text-sm text-muted-foreground">
                Adicione músicas do cache para tocar quando a fila estiver vazia.
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
