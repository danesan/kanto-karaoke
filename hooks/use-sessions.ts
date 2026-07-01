"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { SessionDTO } from "@/types/karaoke";

type SessionsResponse = {
  sessions: SessionDTO[];
};

export function useSessions() {
  return useQuery({
    queryKey: ["sessions"],
    queryFn: async () => {
      const response = await fetch("/api/sessions");

      if (!response.ok) {
        throw new Error("Could not load sessions");
      }

      return (await response.json()) as SessionsResponse;
    },
    select: (data) => data.sessions
  });
}

export function useSession(sessionId: string) {
  return useQuery({
    queryKey: ["session", sessionId],
    queryFn: async () => {
      const response = await fetch(`/api/sessions/${sessionId}`);

      if (!response.ok) {
        throw new Error("Could not load session");
      }

      return (await response.json()) as { session: SessionDTO };
    },
    select: (data) => data.session
  });
}

export function useSessionByCode(sessionCode: string) {
  return useQuery({
    queryKey: ["session-code", sessionCode],
    queryFn: async () => {
      const response = await fetch(`/api/sessions/code/${sessionCode}`);

      if (!response.ok) {
        throw new Error("Could not load session");
      }

      return (await response.json()) as { session: SessionDTO };
    },
    select: (data) => data.session
  });
}

export function useCreateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
      });

      if (!response.ok) {
        throw new Error("Could not create session");
      }

      return (await response.json()) as { session: SessionDTO };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["sessions"] });
    }
  });
}