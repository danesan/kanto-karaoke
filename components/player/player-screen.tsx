"use client";

import { useMemo } from "react";
import { SessionQRCode } from "@/components/session/session-qrcode";
import { CurrentSong } from "@/components/player/current-song";
import { NextSongs } from "@/components/player/next-songs";
import { YouTubePlayer } from "@/components/player/youtube-player";
import { useQueue, useQueueMutations } from "@/hooks/use-queue";
import { useQueueRealtime } from "@/hooks/use-queue-realtime";

export function PlayerScreen({
  sessionId,
  sessionCode
}: {
  sessionId: string;
  sessionCode?: string;
}) {
  const queue = useQueue(sessionId);
  const mutations = useQueueMutations(sessionId);

  useQueueRealtime(sessionId, sessionCode);

  const current = useMemo(
    () => queue.data?.find((item) => item.status === "PLAYING"),
    [queue.data]
  );
  const nextSongs = useMemo(
    () => queue.data?.filter((item) => item.status === "WAITING") ?? [],
    [queue.data]
  );

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-6 py-8">
      {sessionCode ? <SessionQRCode sessionCode={sessionCode} /> : null}
      <CurrentSong item={current} />
      <section className="aspect-video w-full overflow-hidden rounded-2xl border bg-black shadow-[0_24px_60px_rgba(10,17,40,0.18)]">
        {current ? (
          <YouTubePlayer
            videoId={current.song.youtubeVideoId}
            onEnded={() => mutations.next.mutate()}
          />
        ) : (
          <div className="grid h-full place-items-center text-white">
            Aguardando novas músicas...
          </div>
        )}
      </section>
      <NextSongs items={nextSongs} />
    </main>
  );
}
