"use client";

import { Ban, CheckCircle2, Edit3, Heart, HeartOff, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SongDTO } from "@/types/karaoke";

export function CacheSongActions({ song, onEdit, onFavorite, onBlock, onTerms }: { song: SongDTO; onEdit: () => void; onFavorite: () => void; onBlock: () => void; onTerms: () => void }) {
  return (
    <div className="flex flex-wrap gap-1">
      <Button aria-label="Editar t?tulo" title="Editar t?tulo" size="icon" variant="ghost" onClick={onEdit}><Edit3 className="h-4 w-4" /></Button>
      <Button aria-label={song.isFavorite ? "Desfavoritar" : "Favoritar"} title={song.isFavorite ? "Desfavoritar" : "Favoritar"} size="icon" variant="ghost" onClick={onFavorite}>{song.isFavorite ? <HeartOff className="h-4 w-4" /> : <Heart className="h-4 w-4" />}</Button>
      <Button aria-label={song.isBlocked ? "Desbloquear" : "Bloquear"} title={song.isBlocked ? "Desbloquear" : "Bloquear"} size="icon" variant="ghost" onClick={onBlock}>{song.isBlocked ? <CheckCircle2 className="h-4 w-4" /> : <Ban className="h-4 w-4" />}</Button>
      <Button aria-label="Termos de busca" title="Termos de busca" size="icon" variant="ghost" onClick={onTerms}><List className="h-4 w-4" /></Button>
    </div>
  );
}
