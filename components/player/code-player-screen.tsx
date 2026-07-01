"use client";

import { PlayerScreen } from "@/components/player/player-screen";
import { useSessionByCode } from "@/hooks/use-sessions";

export function CodePlayerScreen({ sessionCode }: { sessionCode: string }) {
  const session = useSessionByCode(sessionCode);

  if (session.isLoading) {
    return <main className="grid min-h-screen place-items-center p-4 text-sm text-muted-foreground">Carregando player...</main>;
  }

  if (!session.data) {
    return <main className="grid min-h-screen place-items-center p-4 text-sm text-muted-foreground">Sessão não encontrada.</main>;
  }

  return <PlayerScreen sessionId={session.data.id} sessionCode={session.data.code} />;
}