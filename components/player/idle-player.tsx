"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { IdleScreen } from "@/components/player/idle-screen";
import { YouTubePlayer } from "@/components/player/youtube-player";
import type { AmbientPlaylistDTO } from "@/types/karaoke";

export function IdlePlayer({ sessionId }: { sessionId: string }) {
  const [index, setIndex] = useState(0);
  const playlist = useQuery({
    queryKey: ["ambient-playlist-active", sessionId],
    queryFn: async () => {
      const response = await fetch(`/api/ambient-playlists/active?sessionId=${sessionId}`);

      if (!response.ok) {
        throw new Error("Could not load ambient playlist");
      }

      return (await response.json()) as { playlist: AmbientPlaylistDTO | null };
    }
  });

  const items = playlist.data?.playlist?.items ?? [];
  const current = useMemo(() => {
    if (!items.length) {
      return null;
    }

    return items[index % items.length];
  }, [index, items]);

  useEffect(() => {
    if (items.length && index >= items.length) {
      setIndex(0);
    }
  }, [index, items.length]);

  if (!current) {
    return <IdleScreen />;
  }

  return (
    <div className="relative h-full w-full bg-black">
      <YouTubePlayer
        videoId={current.song.youtubeVideoId}
        onEnded={() => setIndex((currentIndex) => currentIndex + 1)}
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-white/70">
          Modo ambiente
        </p>
        <p className="mt-2 line-clamp-1 text-2xl font-black">
          {current.song.effectiveTitle}
        </p>
        <p className="mt-1 line-clamp-1 text-sm font-semibold text-white/70">
          {playlist.data?.playlist?.name}
        </p>
      </div>
    </div>
  );
}
