"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MonitorPlay, Plus, Radio } from "lucide-react";
import { AppLogo } from "@/components/brand/app-logo";
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
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 pb-10 pt-4 sm:px-6 sm:py-10 lg:px-8">
      <header className="kanto-topbar static -mx-5 mb-6 flex flex-col gap-5 px-5 pb-5 pt-3 sm:mb-10 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5 lg:-mx-8 lg:px-8">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm font-medium text-muted-foreground shadow-sm">
            <Radio className="h-3.5 w-3.5 text-primary" />
            Karaokê colaborativo em tempo real
          </div>
          <AppLogo size="lg" className="mx-auto sm:mx-0" priority />
          <h1 className="mt-3 max-w-xl text-2xl font-black tracking-tight text-foreground sm:text-4xl">
            Controle sua noite de karaokê com fila ao vivo, convidados e
            moderação.
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Crie uma sessão, compartilhe o código e aprove músicas direto do
            painel administrativo.
          </p>
        </div>
        <div className="flex gap-3 rounded-xl border bg-card p-4 shadow-[var(--shadow-soft)]">
          <Radio className="h-6 w-6 text-primary" />
          <MonitorPlay className="h-6 w-6 text-primary" />
        </div>
      </header>

      <section className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <form onSubmit={handleCreate} className="kanto-card p-6">
          <h2 className="mb-4 font-display text-xl font-bold">Criar sessão</h2>
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
          <h2 className="mb-4 font-display text-xl font-bold">
            Entrar como administrador
          </h2>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              placeholder="Código da sessão"
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
        <h2 className="mb-4 kanto-eyebrow">Sessões recentes</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sessions.data?.map((session) => (
            <div
              key={session.id}
              className="kanto-card p-5 transition hover:border-primary/30 hover:shadow-[var(--shadow-lift)]"
            >
              <div className="mb-4">
                <h3 className="font-display text-lg font-bold">
                  {session.name}
                </h3>
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
