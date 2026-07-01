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
      setError("PIN inv?lido para esta sess?o.");
      return;
    }

    router.replace(`/admin/${sessionCode}`);
    router.refresh();
  }

  return (
    <main className="grid min-h-screen place-items-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-lg border bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">Admin</p>
        <h1 className="mt-1 text-2xl font-bold">Sessão {sessionCode}</h1>
        <label className="mt-5 block space-y-2">
          <span className="text-sm font-semibold">PIN</span>
          <Input value={pin} onChange={(event) => setPin(event.target.value)} type="password" inputMode="numeric" autoFocus />
        </label>
        {error ? <p className="mt-3 text-sm font-semibold text-destructive">{error}</p> : null}
        <Button className="mt-5 w-full" disabled={isLoading || pin.trim().length < 4}>
          <LogIn className="h-4 w-4" />
          Entrar
        </Button>
      </form>
    </main>
  );
}
