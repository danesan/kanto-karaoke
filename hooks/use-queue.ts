"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { QueueItemDTO } from "@/types/karaoke";

type QueueResponse = {
  queue: QueueItemDTO[];
};

export function queueKey(sessionId: string) {
  return ["queue", sessionId] as const;
}

export function guestQueueKey(sessionCode: string) {
  return ["guest-queue", sessionCode] as const;
}

export function useQueue(sessionId: string) {
  return useQuery({
    queryKey: queueKey(sessionId),
    queryFn: async () => {
      const response = await fetch(`/api/sessions/${sessionId}/queue`);

      if (!response.ok) {
        throw new Error("Queue load failed");
      }

      return (await response.json()) as QueueResponse;
    },
    select: (data) => data.queue
  });
}

export function useGuestQueue(sessionCode: string) {
  return useQuery({
    queryKey: guestQueueKey(sessionCode),
    queryFn: async () => {
      const response = await fetch(`/api/guest/${sessionCode}/queue`);

      if (!response.ok) {
        throw new Error("Queue load failed");
      }

      return (await response.json()) as QueueResponse;
    },
    select: (data) => data.queue
  });
}

export function useQueueMutations(sessionId: string) {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: queueKey(sessionId) });

  const add = useMutation({
    mutationFn: async (input: { songId: string; singerName: string }) => {
      const response = await fetch(`/api/sessions/${sessionId}/queue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input)
      });

      if (!response.ok) {
        throw new Error("Could not add song");
      }

      return response.json();
    },
    onSuccess: invalidate
  });

  const move = useMutation({
    mutationFn: async (input: { queueItemId: string; direction: "up" | "down" }) => {
      const response = await fetch(`/api/sessions/${sessionId}/queue/${input.queueItemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ direction: input.direction })
      });

      if (!response.ok) {
        throw new Error("Could not move song");
      }

      return response.json();
    },
    onSuccess: invalidate
  });

  const remove = useMutation({
    mutationFn: async (queueItemId: string) => {
      const response = await fetch(`/api/sessions/${sessionId}/queue/${queueItemId}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error("Could not remove song");
      }

      return response.json();
    },
    onSuccess: invalidate
  });

  const clear = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/sessions/${sessionId}/queue`, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error("Could not clear queue");
      }

      return response.json();
    },
    onSuccess: invalidate
  });

  const next = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/sessions/${sessionId}/queue/next`, {
        method: "POST"
      });

      if (!response.ok) {
        throw new Error("Could not start next song");
      }

      return response.json();
    },
    onSuccess: invalidate
  });

  return { add, move, remove, clear, next };
}

export function useGuestQueueMutations(sessionCode: string, participantId: string) {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: guestQueueKey(sessionCode) });

  const add = useMutation({
    mutationFn: async (input: { songId: string; singerName: string }) => {
      const response = await fetch(`/api/guest/${sessionCode}/queue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...input, participantId })
      });

      if (!response.ok) {
        throw new Error("Could not add song");
      }

      return response.json();
    },
    onSuccess: invalidate
  });

  const removeOwn = useMutation({
    mutationFn: async (queueItemId: string) => {
      const response = await fetch(`/api/guest/${sessionCode}/queue/${queueItemId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantId })
      });

      if (!response.ok) {
        throw new Error("Could not remove song");
      }

      return response.json();
    },
    onSuccess: invalidate
  });

  return { add, removeOwn };
}