"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ParticipantDTO, SessionDTO } from "@/types/karaoke";

export function guestStorageKey(sessionCode: string) {
  return `kanto:guest:${sessionCode.toUpperCase()}`;
}

export function JoinSessionForm({ sessionCode }: { sessionCode: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextName = name.trim();

    if (!nextName) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/join/${sessionCode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nextName })
      });

      if (!response.ok) {
        throw new Error("Join failed");
      }

      const data = (await response.json()) as {
        session: SessionDTO;
        participant: ParticipantDTO;
      };

      window.localStorage.setItem(
        guestStorageKey(sessionCode),
        JSON.stringify({ participant: data.participant, session: data.session })
      );
      router.push(`/guest/${sessionCode}`);
    } catch {
      setError("Não foi possivel entrar nessa sessão.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-5"
    >
      <div className="kanto-card kanto-accent-panel p-6">
        <p className="kanto-eyebrow">Kanto</p>
        <h1 className="mt-2 text-3xl font-black">
          Entrar na sessão {sessionCode}
        </h1>
        <label className="mt-5 block space-y-2">
          <span className="text-sm font-medium">Seu nome</span>
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Kanto"
            autoFocus
          />
        </label>
        {error ? (
          <p className="mt-3 text-sm text-destructive">{error}</p>
        ) : null}
        <Button
          className="mt-4 w-full"
          disabled={isLoading || name.trim().length === 0}
        >
          Entrar
        </Button>
      </div>
    </form>
  );
}
