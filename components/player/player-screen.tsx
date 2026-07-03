"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { CountdownOverlay } from "@/components/player/countdown-overlay";
import { IdleScreen } from "@/components/player/idle-screen";
import { ProgressBar } from "@/components/player/progress-bar";
import { RemainingTime } from "@/components/player/remaining-time";
import { YouTubePlayer } from "@/components/player/youtube-player";
import { queueKey, useQueue } from "@/hooks/use-queue";
import { useQueueRealtime } from "@/hooks/use-queue-realtime";
import { useSession } from "@/hooks/use-sessions";
import { useJoinUrl } from "@/lib/app-url";

function secondsUntil(date: string | null | undefined) {
  if (!date) {
    return 0;
  }

  return Math.max(0, Math.ceil((new Date(date).getTime() - Date.now()) / 1000));
}

async function postPlayerEvent(path: string, sessionId: string, body?: Record<string, unknown>) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, ...body })
  });

  if (!response.ok) {
    throw new Error("Player event failed");
  }

  return response.json();
}

export function PlayerScreen({
  sessionId,
  sessionCode
}: {
  sessionId: string;
  sessionCode?: string;
}) {
  const queryClient = useQueryClient();
  const queue = useQueue(sessionId);
  const session = useSession(sessionId);
  const [progress, setProgress] = useState({ currentTime: 0, duration: 0 });
  const [countdownRemaining, setCountdownRemaining] = useState(0);
  const countdownStartRef = useRef<string | null>(null);
  const nextStartRef = useRef<string | null>(null);

  useQueueRealtime(sessionId, sessionCode);

  const refreshPlayerData = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queueKey(sessionId) }),
      queryClient.invalidateQueries({ queryKey: ["session", sessionId] }),
      sessionCode
        ? queryClient.invalidateQueries({ queryKey: ["session-code", sessionCode] })
        : Promise.resolve()
    ]);
  }, [queryClient, sessionCode, sessionId]);

  const runPlayerEvent = useCallback(
    async (path: string, body?: Record<string, unknown>) => {
      const result = await postPlayerEvent(path, sessionId, body);
      await refreshPlayerData();
      return result;
    },
    [refreshPlayerData, sessionId]
  );

  const current = useMemo(
    () => queue.data?.find((item) => item.status === "PLAYING"),
    [queue.data]
  );
  const nextSongs = useMemo(
    () => queue.data?.filter((item) => item.status === "WAITING") ?? [],
    [queue.data]
  );
  const nextSinger = useMemo(() => {
    const targetId = session.data?.countdownTargetQueueItemId;
    return nextSongs.find((item) => item.id === targetId) ?? nextSongs[0];
  }, [nextSongs, session.data?.countdownTargetQueueItemId]);

  const joinUrl = useJoinUrl(sessionCode ?? "");
  const isCountdown = session.data?.playerMode === "COUNTDOWN";
  const showQrCode = session.data?.showQrCode ?? true;
  const showNextSongs = session.data?.showNextSongs ?? true;

  useEffect(() => {
    setProgress({ currentTime: 0, duration: 0 });
  }, [current?.id]);

  useEffect(() => {
    setCountdownRemaining(secondsUntil(session.data?.countdownEndsAt));

    if (!isCountdown) {
      return;
    }

    const timer = window.setInterval(() => {
      setCountdownRemaining(secondsUntil(session.data?.countdownEndsAt));
    }, 250);

    return () => window.clearInterval(timer);
  }, [isCountdown, session.data?.countdownEndsAt]);

  useEffect(() => {
    if (current || !nextSinger || isCountdown || session.isLoading) {
      return;
    }

    const key = `${sessionId}:${nextSinger.id}`;
    if (countdownStartRef.current === key) {
      return;
    }

    countdownStartRef.current = key;
    void runPlayerEvent("/api/player/start-countdown").catch(() => {
      countdownStartRef.current = null;
    });
  }, [current, isCountdown, nextSinger, runPlayerEvent, session.isLoading, sessionId]);

  useEffect(() => {
    const countdownEndsAt = session.data?.countdownEndsAt;

    if (!isCountdown || !countdownEndsAt) {
      return;
    }

    const remainingMilliseconds = Math.max(
      0,
      new Date(countdownEndsAt).getTime() - Date.now()
    );

    if (remainingMilliseconds > 0) {
      const timeout = window.setTimeout(() => {
        if (nextStartRef.current === countdownEndsAt) {
          return;
        }

        nextStartRef.current = countdownEndsAt;
        void runPlayerEvent("/api/player/start-next").catch(() => {
          nextStartRef.current = null;
        });
      }, remainingMilliseconds);

      return () => window.clearTimeout(timeout);
    }

    if (nextStartRef.current === countdownEndsAt) {
      return;
    }

    nextStartRef.current = countdownEndsAt;
    void runPlayerEvent("/api/player/start-next").catch(() => {
      nextStartRef.current = null;
    });
  }, [isCountdown, runPlayerEvent, session.data?.countdownEndsAt]);

  return (
    <main className="flex h-screen w-full flex-col overflow-hidden bg-background text-foreground">
      <header className="flex shrink-0 items-center justify-between border-b border-border/50 bg-background/80 px-6 py-4 backdrop-blur-lg lg:px-10">
        <div>
          <p className="text-2xl font-black uppercase tracking-normal text-foreground lg:text-3xl">
            Kanto ao vivo
          </p>
          <p className="mt-1 text-sm font-semibold text-muted-foreground">
            Player
          </p>
        </div>

        {sessionCode ? (
          <div className="rounded-xl border border-border/50 bg-card px-4 py-3 text-right shadow-[var(--shadow-soft)]">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
              CÓDIGO
            </p>
            <p className="mt-1 text-2xl font-black text-primary lg:text-3xl">
              {sessionCode}
            </p>
          </div>
        ) : null}
      </header>

      <section className="grid min-h-0 flex-1 gap-5 overflow-y-auto p-5 lg:grid-cols-[280px_minmax(0,1fr)_320px] lg:overflow-hidden lg:p-8">
        <aside className="flex min-h-0 flex-col gap-5">
          {showQrCode ? (
            <section className="rounded-xl border border-border/50 bg-card p-5 shadow-[var(--shadow-soft)]">
              <p className="text-sm font-black uppercase tracking-[0.16em] text-primary">
                ENTRAR PELO CELULAR
              </p>
              <div className="mt-4 grid aspect-square w-full place-items-center rounded-xl border border-border/50 bg-muted p-5">
                {joinUrl ? (
                  <div className="rounded-xl bg-card p-3 shadow-[var(--shadow-soft)]">
                    <QRCodeSVG value={joinUrl} size={168} includeMargin />
                  </div>
                ) : (
                  <QrCode className="h-20 w-20 text-muted-foreground" />
                )}
              </div>
              {/* {sessionCode ? (
                <p className="mt-4 text-center text-3xl font-black text-primary">
                  {sessionCode}
                </p>
              ) : null} */}
            </section>
          ) : null}

          <section className="rounded-xl border border-border/50 bg-card p-5 shadow-[var(--shadow-soft)]">
            <p className="text-sm font-black uppercase tracking-[0.16em] text-muted-foreground text-primary">
              CANTANDO AGORA
            </p>
            <h2
              className={`mt-4 max-w-full break-words font-black uppercase leading-tight text-foreground [overflow-wrap:anywhere] ${
                current ? "text-3xl lg:text-4xl" : "text-2xl lg:text-3xl"
              }`}
            >
              {current?.participant.name ?? "Aguardando"}
            </h2>
            <p className="mt-3 break-words text-lg font-semibold text-muted-foreground [overflow-wrap:anywhere]">
              {current?.song.effectiveTitle ?? current?.song.title ?? "Novas músicas"}
            </p>
          </section>

          {current ? <RemainingTime {...progress} /> : null}
        </aside>

        <section className="flex min-h-0 flex-col justify-center gap-4">
          <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border/50 bg-black shadow-[0_24px_60px_rgba(27,27,27,0.14)]">
            {current ? (
              <YouTubePlayer
                videoId={current.song.youtubeVideoId}
                onProgress={setProgress}
                onEnded={() => void runPlayerEvent("/api/player/start-countdown")}
              />
            ) : (
              <IdleScreen />
            )}
            {isCountdown ? (
              <CountdownOverlay item={nextSinger} remaining={countdownRemaining} />
            ) : null}
          </div>
          {current ? <ProgressBar {...progress} /> : null}
        </section>

        {showNextSongs ? (
          <aside className="min-h-0 rounded-xl border border-border/50 bg-card p-5 shadow-[var(--shadow-soft)]">
            <h2 className="text-sm font-black uppercase tracking-[0.16em] text-primary">
              PRÓXIMAS MÚSICAS
            </h2>
            <ul className="mt-4 max-h-[calc(100vh-12rem)] overflow-y-auto">
              {nextSongs.length ? (
                nextSongs.slice(0, 8).map((item) => (
                  <li key={item.id} className="border-b border-border py-4 last:border-b-0">
                    <p className="text-base font-black uppercase text-foreground">
                      {item.participant.name}
                    </p>
                    <p className="mt-1 line-clamp-2 text-sm font-medium text-muted-foreground">
                      {item.song.effectiveTitle ?? item.song.title}
                    </p>
                  </li>
                ))
              ) : (
                <li className="py-4 text-sm font-medium text-muted-foreground">
                  Sem próximas músicas.
                </li>
              )}
            </ul>
          </aside>
        ) : null}
      </section>
    </main>
  );
}
