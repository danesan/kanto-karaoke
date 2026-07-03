"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Check,
  ListMusic,
  Plus,
  Search,
  Trash2,
  X
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PlaylistDTO, PlaylistType, SongDTO } from "@/types/karaoke";

type PlaylistsResponse = { playlists: PlaylistDTO[] };
type CacheResponse = { songs: SongDTO[] };

const PLAYLIST_TYPES: Array<{ value: PlaylistType; label: string; helper: string }> = [
  { value: "CUSTOM", label: "Personalizada", helper: "Montada manualmente pelo admin." },
  { value: "GENRE", label: "Categoria", helper: "Organizada por genero ou tema." },
  { value: "AMBIENT", label: "Ambiente", helper: "Toca automaticamente quando a fila esta vazia." }
];

const TYPE_LABELS: Record<PlaylistType, string> = {
  CUSTOM: "Personalizada",
  FAVORITES: "Favoritas",
  MOST_PLAYED: "Mais Cantadas",
  GENRE: "Categoria",
  AMBIENT: "Ambiente"
};

export function PlaylistManager({ sessionCode }: { sessionCode: string }) {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<PlaylistType>("CUSTOM");
  const [newDescription, setNewDescription] = useState("");
  const [newGenre, setNewGenre] = useState("");
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState({ name: "", description: "", genre: "", type: "CUSTOM" as PlaylistType });

  const playlists = useQuery({
    queryKey: ["playlists", sessionCode],
    queryFn: async () => {
      const response = await fetch(`/api/playlists?sessionCode=${sessionCode}`);
      if (!response.ok) throw new Error("Could not load playlists");
      return (await response.json()) as PlaylistsResponse;
    }
  });

  const cache = useQuery({
    queryKey: ["playlist-cache-search", sessionCode, search],
    enabled: search.trim().length > 1,
    queryFn: async () => {
      const response = await fetch(
        `/api/songs/cache?sessionCode=${sessionCode}&q=${encodeURIComponent(search)}&page=1&pageSize=10`
      );
      if (!response.ok) throw new Error("Could not search cache");
      return (await response.json()) as CacheResponse;
    }
  });

  const playlistList = playlists.data?.playlists ?? [];
  const selected = useMemo(
    () => playlistList.find((playlist) => playlist.id === selectedId) ?? playlistList[0],
    [playlistList, selectedId]
  );

  useEffect(() => {
    if (selected) {
      setSelectedId(selected.id);
      setDraft({
        name: selected.name,
        description: selected.description ?? "",
        genre: selected.genre ?? "",
        type: selected.type
      });
    }
  }, [selected?.id]);

  const invalidate = () =>
    void queryClient.invalidateQueries({ queryKey: ["playlists", sessionCode] });

  const action = useMutation({
    mutationFn: async ({ path, method = "POST", body }: { path: string; method?: string; body?: unknown }) => {
      const response = await fetch(path, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionCode, ...(body as object | undefined) })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? "Playlist action failed");
      }

      return response.json();
    },
    onSuccess: (data) => {
      const playlist = (data as { playlist?: PlaylistDTO }).playlist;
      if (playlist) setSelectedId(playlist.id);
      invalidate();
    }
  });

  function createPlaylist() {
    if (!newName.trim()) return;
    action.mutate({
      path: "/api/playlists",
      body: {
        name: newName,
        description: newDescription,
        type: newType,
        genre: newType === "GENRE" ? newGenre : null
      }
    });
    setNewName("");
    setNewDescription("");
    setNewGenre("");
  }

  function saveSelected() {
    if (!selected || selected.isSystem) return;
    action.mutate({
      path: "/api/playlists",
      method: "PATCH",
      body: {
        id: selected.id,
        name: draft.name,
        description: draft.description,
        type: draft.type,
        genre: draft.type === "GENRE" ? draft.genre : null
      }
    });
  }

  function moveItem(itemId: string, direction: -1 | 1) {
    if (!selected) return;
    const index = selected.items.findIndex((item) => item.id === itemId);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= selected.items.length) return;

    const itemIds = selected.items.map((item) => item.id);
    const [item] = itemIds.splice(index, 1);
    itemIds.splice(target, 0, item);

    action.mutate({
      path: "/api/playlists/items",
      method: "PATCH",
      body: { playlistId: selected.id, itemIds }
    });
  }

  const selectedEditable = Boolean(selected && !selected.isSystem);

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl space-y-6 px-5 py-8">
      <header className="kanto-topbar -mx-5 flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="kanto-eyebrow">Admin - Playlists</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-foreground">Playlists personalizadas</h1>
          <p className="mt-1 text-sm font-semibold text-muted-foreground">Codigo {sessionCode}</p>
        </div>
        <Button asChild variant="outline">
          <Link href={`/admin/${sessionCode}`}>
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
        </Button>
      </header>

      <section className="kanto-card grid gap-4 p-5 lg:grid-cols-[minmax(0,1fr)_180px]">
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_180px]">
          <Input placeholder="Nome da playlist" value={newName} onChange={(event) => setNewName(event.target.value)} />
          <Input placeholder="Descricao" value={newDescription} onChange={(event) => setNewDescription(event.target.value)} />
          <select
            className="h-10 rounded-md border border-input bg-background px-3 text-sm font-semibold text-foreground outline-none focus:ring-2 focus:ring-ring/20"
            value={newType}
            onChange={(event) => setNewType(event.target.value as PlaylistType)}
          >
            {PLAYLIST_TYPES.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
          {newType === "GENRE" ? (
            <Input placeholder="Categoria/genero" value={newGenre} onChange={(event) => setNewGenre(event.target.value)} />
          ) : null}
        </div>
        <Button className="h-full min-h-10" disabled={action.isPending || !newName.trim()} onClick={createPlaylist}>
          <Plus className="h-4 w-4" />
          Cria
        </Button>
      </section>

      {action.error ? (
        <section className="kanto-card border-destructive/30 bg-destructive/5 p-4 text-sm font-semibold text-destructive">
          {(action.error as Error).message}
        </section>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[330px_minmax(0,1fr)]">
        <aside className="kanto-card overflow-hidden">
          <div className="kanto-card-header">
            <div className="flex items-center gap-2">
              <ListMusic className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">Biblioteca</h2>
            </div>
          </div>
          <div className="divide-y divide-border">
            {playlistList.map((playlist) => (
              <button
                key={playlist.id}
                className={`w-full px-4 py-3 text-left transition hover:bg-accent ${selected?.id === playlist.id ? "bg-primary/10" : ""}`}
                onClick={() => setSelectedId(playlist.id)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-foreground">{playlist.name}</p>
                    <p className="text-xs font-semibold text-muted-foreground">{TYPE_LABELS[playlist.type]} - {playlist.items.length} musicas</p>
                  </div>
                  {playlist.enabled ? (
                    <span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-black uppercase text-primary">Ativa</span>
                  ) : null}
                </div>
              </button>
            ))}
          </div>
        </aside>

        {selected ? (
          <section className="space-y-6">
            <div className="kanto-card p-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0 flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-secondary px-3 py-1 text-xs font-black text-secondary-foreground">{TYPE_LABELS[selected.type]}</span>
                    {selected.isSystem ? <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-black text-primary">Sistema</span> : null}
                    {selected.enabled ? <span className="rounded-full bg-primary px-3 py-1 text-xs font-black text-primary-foreground">Ativa</span> : null}
                  </div>
                  <div className="grid gap-3 md:grid-cols-[1fr_180px]">
                    <Input disabled={!selectedEditable} value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} />
                    <select
                      disabled={!selectedEditable}
                      className="h-10 rounded-md border border-input bg-background px-3 text-sm font-semibold text-foreground outline-none disabled:opacity-60"
                      value={draft.type}
                      onChange={(event) => setDraft((current) => ({ ...current, type: event.target.value as PlaylistType }))}
                    >
                      {PLAYLIST_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  <textarea
                    disabled={!selectedEditable}
                    className="min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-medium text-foreground outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/20 disabled:opacity-60"
                    placeholder="Descricao da playlist"
                    value={draft.description}
                    onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
                  />
                  {draft.type === "GENRE" ? (
                    <Input disabled={!selectedEditable} placeholder="Categoria/genero" value={draft.genre} onChange={(event) => setDraft((current) => ({ ...current, genre: event.target.value }))} />
                  ) : null}
                  <p className="text-sm text-muted-foreground">{PLAYLIST_TYPES.find((type) => type.value === selected.type)?.helper ?? "Gerada automaticamente pelo sistema."}</p>
                </div>
                <div className="flex flex-wrap gap-2 xl:justify-end">
                  <Button
                    variant={selected.enabled ? "outline" : "default"}
                    disabled={action.isPending}
                    onClick={() => action.mutate({ path: "/api/playlists", method: "PATCH", body: { id: selected.id, enabled: !selected.enabled } })}
                  >
                    {selected.enabled ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                    {selected.enabled ? "Desativar" : "Ativar"}
                  </Button>
                  <Button variant="outline" disabled={!selectedEditable || action.isPending} onClick={saveSelected}>Salvar</Button>
                  <Button
                    variant="destructive"
                    disabled={!selectedEditable || action.isPending}
                    onClick={() => action.mutate({ path: "/api/playlists", method: "DELETE", body: { id: selected.id } })}
                  >
                    <Trash2 className="h-4 w-4" />
                    Exclui
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
              <div className="kanto-card overflow-hidden">
                <div className="kanto-card-header">
                  <h2 className="text-lg font-bold text-foreground">Musicas da playlist</h2>
                </div>
                <div className="divide-y divide-border">
                  {selected.items.length === 0 ? (
                    <p className="p-4 text-sm text-muted-foreground">Nenhuma musica nesta playlist.</p>
                  ) : null}
                  {selected.items.map((item, index) => (
                    <div key={item.id} className="flex items-center gap-3 p-3">
                      <div className="grid h-8 w-8 place-items-center rounded-full bg-secondary text-xs font-black text-secondary-foreground">{index + 1}</div>
                      <img src={item.song.thumbnail} alt="" className="h-12 w-16 rounded-md object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-foreground">{item.song.effectiveTitle}</p>
                        <p className="truncate text-xs text-muted-foreground">{item.song.channel}{item.playCount ? ` - ${item.playCount} vezes` : ""}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button aria-label="Subir" size="icon" variant="ghost" disabled={!selectedEditable || index === 0} onClick={() => moveItem(item.id, -1)}>
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button aria-label="Descer" size="icon" variant="ghost" disabled={!selectedEditable || index === selected.items.length - 1} onClick={() => moveItem(item.id, 1)}>
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button
                          aria-label="Remover"
                          size="icon"
                          variant="ghost"
                          disabled={!selectedEditable}
                          onClick={() => action.mutate({ path: "/api/playlists/items", method: "DELETE", body: { playlistId: selected.id, itemId: item.id } })}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <aside className="kanto-card p-5">
                <div className="mb-4">
                  <h2 className="text-lg font-bold text-foreground">Adicionar do cache</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Reaproveite musicas ja salvas nas buscas.</p>
                </div>
                <label className="relative block">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input className="pl-9" disabled={!selectedEditable} placeholder="Buscar musica" value={search} onChange={(event) => setSearch(event.target.value)} />
                </label>
                <div className="mt-4 space-y-2">
                  {!selectedEditable ? (
                    <p className="text-sm text-muted-foreground">Playlists de sistema sao geradas automaticamente.</p>
                  ) : null}
                  {(cache.data?.songs ?? []).map((song) => (
                    <div key={song.id} className="flex items-center gap-3 rounded-xl border border-border/50 bg-card p-2">
                      <img src={song.thumbnail} alt="" className="h-10 w-14 rounded-md object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold text-foreground">{song.effectiveTitle}</p>
                        <p className="truncate text-[11px] text-muted-foreground">{song.channel}</p>
                      </div>
                      <Button
                        aria-label="Adicionar"
                        size="icon"
                        disabled={!selectedEditable}
                        onClick={() => action.mutate({ path: "/api/playlists/items", body: { playlistId: selected.id, songId: song.id } })}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {search.trim().length > 1 && cache.data?.songs.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhuma musica encontrada no cache.</p>
                  ) : null}
                </div>
              </aside>
            </div>
          </section>
        ) : (
          <section className="kanto-card p-6 text-sm text-muted-foreground">Crie uma playlist para comecar.</section>
        )}
      </div>
    </main>
  );
}
