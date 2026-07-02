"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MonitorPlay, Plus, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateSession, useSessions } from "@/hooks/use-sessions";

export function SessionHome() {
  const router = useRouter();
  const [sessionName, setSessionName] = useState("");
  const [joinId, setJoinId] = useState("");
  const sessions = useSessions();
  const createSession = useCreateSession();

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = await createSession.mutateAsync(sessionName);
    window.sessionStorage.setItem(
      `kanto_admin_pin_${result.session.code}`,
      result.adminPin
    );
    router.push(`/admin/${result.session.code}`);
  }

  function handleJoin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (joinId.trim()) {
      router.push(`/admin/${joinId.trim().toUpperCase()}/login`);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-10 sm:px-6 lg:px-8">
      <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="kanto-gradient-text text-4xl font-black uppercase tracking-tight sm:text-6xl">
            Kanto
          </p>
          <h1 className="mt-2 text-base font-semibold text-muted-foreground">
            Karaokê em light mode neon elétrico
          </h1>
        </div>
        <div className="flex gap-3 rounded-full border bg-card px-5 py-3 shadow-[var(--shadow-soft)]">
          <Radio className="h-6 w-6 text-secondary" />
          <MonitorPlay className="h-6 w-6 text-primary" />
        </div>
      </header>

      <section className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <form onSubmit={handleCreate} className="kanto-card p-6">
          <h2 className="mb-4 text-xl font-bold">Criar sessão</h2>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              placeholder="Noite de karaoke"
              value={sessionName}
              onChange={(event) => setSessionName(event.target.value)}
            />
            <Button
              disabled={
                createSession.isPending || sessionName.trim().length < 2
              }
            >
              <Plus className="h-4 w-4" />
              Criar
            </Button>
          </div>
        </form>

        <form onSubmit={handleJoin} className="kanto-card p-6">
          <h2 className="mb-4 text-xl font-bold">Entrar como administrador</h2>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              placeholder="Codigo da sessão"
              value={joinId}
              onChange={(event) => setJoinId(event.target.value)}
            />
            <Button variant="outline" disabled={!joinId.trim()}>
              Entrar
            </Button>
          </div>
        </form>
      </section>

      <section className="mt-8">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.16em] text-muted-foreground">
          Sessões recentes
        </h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sessions.data?.map((session) => (
            <div key={session.id} className="kanto-card p-5">
              <div className="mb-3">
                <h3 className="text-lg font-bold">{session.name}</h3>
                <p className="text-sm text-muted-foreground">
                  ID: {session.id}
                </p>
                <p className="text-sm font-semibold text-primary">
                  Código: {session.code}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button asChild size="sm">
                  <Link href={`/admin/${session.code}/login`}>Admin</Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/player/${session.code}`}>Player</Link>
                </Button>
                <Button asChild size="sm" variant="ghost">
                  <Link href={`/join/${session.code}`}>Convidado</Link>
                </Button>
              </div>
            </div>
          ))}
          {sessions.data?.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma sessão ativa ainda.
            </p>
          ) : null}
        </div>
      </section>
    </main>
  );
}
