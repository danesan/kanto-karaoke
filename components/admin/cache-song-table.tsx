"use client";

import { CacheSongActions } from "@/components/admin/cache-song-actions";
import type { SongDTO } from "@/types/karaoke";

export function CacheSongTable({
  songs,
  onEdit,
  onFavorite,
  onBlock,
  onTerms
}: {
  songs: SongDTO[];
  onEdit: (song: SongDTO) => void;
  onFavorite: (song: SongDTO) => void;
  onBlock: (song: SongDTO) => void;
  onTerms: (song: SongDTO) => void;
}) {
  return (
    <div className="overflow-x-auto kanto-card">
      <table className="w-full min-w-[980px] text-left text-sm">
        <thead className="border-b bg-muted/70 text-xs uppercase tracking-[0.12em] text-muted-foreground">
          <tr>
            <th className="p-3">Thumb</th>
            <th className="p-3">Título original</th>
            <th className="p-3">Título exibido</th>
            <th className="p-3">Canal</th>
            <th className="p-3">YouTube ID</th>
            <th className="p-3">Status</th>
            <th className="p-3">Datas</th>
            <th className="p-3">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {songs.map((song) => (
            <tr key={song.id} className="transition hover:bg-primary/5">
              <td className="p-3">
                <img
                  src={song.thumbnail}
                  alt=""
                  className="h-12 w-16 rounded-md object-cover shadow-[var(--shadow-soft)]"
                />
              </td>
              <td className="max-w-[220px] p-3 font-semibold">
                <span className="line-clamp-2">{song.title}</span>
              </td>
              <td className="max-w-[220px] p-3">{song.displayTitle || "-"}</td>
              <td className="p-3">{song.channel}</td>
              <td className="p-3 font-mono text-xs">{song.youtubeVideoId}</td>
              <td className="p-3">
                <span className="font-semibold">
                  {song.isFavorite ? "Favorita" : ""}
                </span>
                {song.isBlocked ? (
                  <span className="ml-2 font-semibold text-destructive">
                    Bloqueada
                  </span>
                ) : null}
              </td>
              <td className="p-3 text-xs text-muted-foreground">
                Criada{" "}
                {song.createdAt
                  ? new Date(song.createdAt).toLocaleDateString()
                  : "-"}
                <br />
                Atualizada{" "}
                {song.updatedAt
                  ? new Date(song.updatedAt).toLocaleDateString()
                  : "-"}
              </td>
              <td className="p-3">
                <CacheSongActions
                  song={song}
                  onEdit={() => onEdit(song)}
                  onFavorite={() => onFavorite(song)}
                  onBlock={() => onBlock(song)}
                  onTerms={() => onTerms(song)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {songs.length === 0 ? (
        <p className="p-4 text-sm text-muted-foreground">
          Nenhuma música encontrada.
        </p>
      ) : null}
    </div>
  );
}
