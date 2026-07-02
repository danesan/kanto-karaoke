"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AdminLoginForm({ sessionCode }: { sessionCode: string }) {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionCode, pin })
    });

    setIsLoading(false);

    if (!response.ok) {
      setError("PIN inválido para esta sessão.");
      return;
    }

    router.replace(`/admin/${sessionCode}`);
    router.refresh();
  }

  return (
    <main className="grid min-h-screen place-items-center px-5">
      <form
        onSubmit={handleSubmit}
        className="kanto-card kanto-neon-panel w-full max-w-sm p-6"
      >
        <p className="kanto-eyebrow">Admin</p>
        <h1 className="mt-1 text-3xl font-black">Sessão {sessionCode}</h1>
        <label className="mt-5 block space-y-2">
          <span className="text-sm font-semibold">PIN</span>
          <Input
            value={pin}
            onChange={(event) => setPin(event.target.value)}
            type="password"
            inputMode="numeric"
            autoFocus
          />
        </label>
        {error ? (
          <p className="mt-3 text-sm font-semibold text-destructive">{error}</p>
        ) : null}
        <Button
          className="mt-5 w-full"
          disabled={isLoading || pin.trim().length < 4}
        >
          <LogIn className="h-4 w-4" />
          Entrar
        </Button>
      </form>
    </main>
  );
}
