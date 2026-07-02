"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { guestQueueKey, queueKey } from "@/hooks/use-queue";
import { createBrowserSupabaseClient } from "@/lib/supabase";

export function useQueueRealtime(sessionId: string, sessionCode?: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!sessionId) {
      return;
    }

    const supabase = createBrowserSupabaseClient();

    if (!supabase) {
      return;
    }

    const channel = supabase
      .channel(`queue:${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "queue_items",
          filter: `session_id=eq.${sessionId}`
        },
        () => {
          void queryClient.invalidateQueries({ queryKey: queueKey(sessionId) });

          void queryClient.invalidateQueries({ queryKey: ["session", sessionId] });

          if (sessionCode) {
            void queryClient.invalidateQueries({ queryKey: guestQueueKey(sessionCode) });
            void queryClient.invalidateQueries({ queryKey: ["session-code", sessionCode] });
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "karaoke_sessions",
          filter: `id=eq.${sessionId}`
        },
        () => {
          void queryClient.invalidateQueries({ queryKey: ["session", sessionId] });

          if (sessionCode) {
            void queryClient.invalidateQueries({ queryKey: ["session-code", sessionCode] });
          }
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient, sessionCode, sessionId]);
}
