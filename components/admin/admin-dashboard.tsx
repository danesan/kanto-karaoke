
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, History, LogOut, Settings, ShieldCheck, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { AdminQueueControls } from "@/components/admin/admin-queue-controls";
import { PendingQueueList } from "@/components/admin/pending-queue-list";
import { RejectSongDialog } from "@/components/admin/reject-song-dialog";
import { SessionSettingsForm } from "@/components/admin/session-settings-form";
import { Button } from "@/components/ui/button";
import { useQueueRealtime } from "@/hooks/use-queue-realtime";
import type { QueueItemDTO, SessionDTO } from "@/types/karaoke";

type AdminQueueResponse = { queue: QueueItemDTO[]; pending: QueueItemDTO[]; history: QueueItemDTO[] };

type InactiveSessionsResponse = { sessions: SessionDTO[] };

export function AdminDashboard({ sessionCode }: { sessionCode: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [rejecting, setRejecting] = useState<QueueItemDTO | null>(null);
  const [createdPin, setCreatedPin] = useState<string | null>(null);

  useEffect(() => {
    const key = `kanto_admin_pin_${sessionCode}`;
    const storedPin = window.sessionStorage.getItem(key);

    if (storedPin) {
      setCreatedPin(storedPin);
      window.sessionStorage.removeItem(key);
    }
  }, [sessionCode]);

  const session = useQuery({
    queryKey: ["session-code", sessionCode],
    queryFn: async () => {
      const response = await fetch(`/api/sessions/code/${sessionCode}`);
      if (!response.ok) throw new Error("N?o foi poss?vel carregar a sess?o");
      return ((await response.json()) as { session: SessionDTO }).session;
    }
  });

  const adminQueue = useQuery({
    queryKey: ["admin-queue", sessionCode],
    queryFn: async () => {
      const response = await fetch(`/api/sessions/${sessionCode}/queue?admin=1`);
      if (!response.ok) throw new Error("N?o foi poss?vel carregar a fila do administrador");
      return (await response.json()) as AdminQueueResponse;
    }
  });

  const inactiveSessions = useQuery({
    queryKey: ["admin-inactive-sessions", sessionCode],
    queryFn: async () => {
      const response = await fetch(`/api/admin/sessions/inactive?sessionCode=${sessionCode}`);
      if (!response.ok) throw new Error("N?o foi poss?vel carregar sess?es encerradas");
      return ((await response.json()) as InactiveSessionsResponse).sessions;
    }
  });

  useQueueRealtime(session.data?.id ?? "", sessionCode);

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin-queue", sessionCode] });
    void queryClient.invalidateQueries({ queryKey: ["session-code", sessionCode] });
    void queryClient.invalidateQueries({ queryKey: ["admin-inactive-sessions", sessionCode] });
  };

  const action = useMutation({
    mutationFn: async ({ path, method = "POST", body }: { path: string; method?: string; body?: unknown }) => {
      const response = await fetch(path, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined
      });
      if (!response.ok) throw new Error("Admin action failed");
      return response.json();
    },
    onSuccess: invalidate
  });

  const closeSession = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/sessions/${sessionCode}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error("Close session failed");
      }

      return response.json();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["sessions"] });
      router.replace("/");
      router.refresh();
    }
  });

  async function logout() {
    await fetch("/api/admin/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionCode })
    });
    router.replace(`/admin/${sessionCode}/login`);
    router.refresh();
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl space-y-5 px-4 py-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-primary">
            <ShieldCheck className="h-4 w-4" />
            Admin
          </p>
          <h1 className="text-2xl font-bold">{session.data?.name ?? `Sessão ${sessionCode}`}</h1>
          <p className="text-sm font-semibold text-primary">Código {sessionCode}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline"><Link href={`/admin/${sessionCode}/cache`}>Cache</Link></Button>
          <Button asChild variant="outline"><Link href={`/player/${sessionCode}`} target="_blank">Player</Link></Button>
          <Button variant="ghost" onClick={logout}><LogOut className="h-4 w-4" />Sair</Button>
        </div>
      </header>

      {createdPin ? (
        <section className="rounded-lg border border-primary/40 bg-primary/5 p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-primary">PIN administrativo desta sessão</p>
              <p className="mt-1 font-mono text-2xl font-bold tracking-widest">{createdPin}</p>
              <p className="mt-1 text-sm text-muted-foreground">Guarde este PIN agora. Por segurança, ele não fica salvo em texto puro no banco.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigator.clipboard?.writeText(createdPin)}>
                <Copy className="h-4 w-4" />
                Copiar
              </Button>
              <Button aria-label="Ocultar PIN" size="icon" variant="ghost" onClick={() => setCreatedPin(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-5">
          <AdminQueueControls
            items={adminQueue.data?.queue ?? []}
            onMove={(id, direction) => action.mutate({ path: `/api/sessions/${sessionCode}/queue/${id}`, method: "PATCH", body: { direction } })}
            onRemove={(id) => action.mutate({ path: `/api/sessions/${sessionCode}/queue/${id}`, method: "DELETE" })}
            onClear={() => action.mutate({ path: `/api/sessions/${sessionCode}/queue`, method: "DELETE" })}
            onSkip={() => {
              const playing = adminQueue.data?.queue.find((item) => item.status === "PLAYING");
              if (playing) action.mutate({ path: `/api/sessions/${sessionCode}/queue/${playing.id}/skip` });
            }}
          />
          <PendingQueueList
            items={adminQueue.data?.pending ?? []}
            onApprove={(item) => action.mutate({ path: `/api/sessions/${sessionCode}/queue/${item.id}/approve` })}
            onReject={setRejecting}
          />
        </div>

        <aside className="space-y-5">
          {session.data ? <SessionSettingsForm session={session.data} onSave={(body) => action.mutate({ path: `/api/sessions/${sessionCode}`, method: "PATCH", body })} /> : null}
          <section className="rounded-lg border bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b p-4"><History className="h-5 w-5 text-primary" /><h2 className="text-lg font-semibold">Histórico</h2></div>
            <div className="divide-y">
              {(adminQueue.data?.history ?? []).slice(0, 12).map((item) => (
                <div key={item.id} className="p-3 text-sm">
                  <p className="font-semibold">{item.song.effectiveTitle}</p>
                  <p className="text-xs text-muted-foreground">{item.status} ? {item.participant.name}</p>
                  {item.rejectionReason ? <p className="mt-1 text-xs text-destructive">{item.rejectionReason}</p> : null}
                </div>
              ))}
            </div>
          </section>
          <section className="rounded-lg border bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2"><Settings className="h-5 w-5 text-primary" /><h2 className="text-lg font-semibold">Sessão</h2></div>
            <Button className="mt-4 w-full" variant="destructive" disabled={closeSession.isPending} onClick={() => closeSession.mutate()}>Encerrar sessão</Button>
          </section>
          <section className="rounded-lg border bg-white shadow-sm">
            <div className="border-b p-4">
              <h2 className="text-lg font-semibold">Sessões encerradas</h2>
            </div>
            <div className="divide-y">
              {(inactiveSessions.data ?? []).length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground">Nenhuma sessão encerrada para apagar.</p>
              ) : null}
              {(inactiveSessions.data ?? []).map((inactiveSession) => (
                <div key={inactiveSession.id} className="flex items-center justify-between gap-3 p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{inactiveSession.name}</p>
                    <p className="text-xs text-muted-foreground">Código {inactiveSession.code}</p>
                  </div>
                  <Button
                    aria-label="Apagar sessão encerrada"
                    size="icon"
                    variant="ghost"
                    onClick={() => action.mutate({
                      path: `/api/admin/sessions/${inactiveSession.id}`,
                      method: "DELETE",
                      body: { sessionCode }
                    })}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>

      <RejectSongDialog
        open={Boolean(rejecting)}
        onClose={() => setRejecting(null)}
        onConfirm={(reason) => {
          if (rejecting) action.mutate({ path: `/api/sessions/${sessionCode}/queue/${rejecting.id}/reject`, body: { reason } });
          setRejecting(null);
        }}
      />
    </main>
  );
}
