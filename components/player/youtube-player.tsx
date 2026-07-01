"use client";

import { useEffect, useRef } from "react";

type PlayerStateChangeEvent = {
  data: number;
};

type YouTubePlayerInstance = {
  destroy: () => void;
  loadVideoById: (videoId: string) => void;
};

type YouTubePlayerConstructor = new (
  element: HTMLElement,
  options: {
    videoId: string;
    width: string;
    height: string;
    playerVars: Record<string, number>;
    events: {
      onStateChange: (event: PlayerStateChangeEvent) => void;
    };
  }
) => YouTubePlayerInstance;

declare global {
  interface Window {
    YT?: {
      Player: YouTubePlayerConstructor;
      PlayerState: { ENDED: number };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

let youtubeApiPromise: Promise<void> | null = null;

function loadYouTubeApi() {
  if (window.YT?.Player) {
    return Promise.resolve();
  }

  if (!youtubeApiPromise) {
    youtubeApiPromise = new Promise((resolve) => {
      window.onYouTubeIframeAPIReady = () => resolve();
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(script);
    });
  }

  return youtubeApiPromise;
}

export function YouTubePlayer({ videoId, onEnded }: { videoId: string; onEnded: () => void }) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const player = useRef<YouTubePlayerInstance | null>(null);
  const onEndedRef = useRef(onEnded);

  useEffect(() => {
    onEndedRef.current = onEnded;
  }, [onEnded]);

  useEffect(() => {
    let cancelled = false;

    loadYouTubeApi().then(() => {
      if (cancelled || !window.YT || !hostRef.current) {
        return;
      }

      if (player.current) {
        player.current.loadVideoById(videoId);
        return;
      }

      const mountPoint = document.createElement("div");
      mountPoint.className = "h-full w-full";
      hostRef.current.replaceChildren(mountPoint);

      player.current = new window.YT.Player(mountPoint, {
        videoId,
        width: "100%",
        height: "100%",
        playerVars: {
          autoplay: 1,
          rel: 0,
          modestbranding: 1
        },
        events: {
          onStateChange: (event) => {
            if (event.data === window.YT?.PlayerState.ENDED) {
              onEndedRef.current();
            }
          }
        }
      });
    });

    return () => {
      cancelled = true;
    };
  }, [videoId]);

  useEffect(() => {
    return () => {
      try {
        player.current?.destroy();
      } finally {
        player.current = null;
        hostRef.current?.replaceChildren();
      }
    };
  }, []);

  return <div ref={hostRef} className="h-full w-full" />;
}