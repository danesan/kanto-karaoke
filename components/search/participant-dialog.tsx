"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { SearchResultDTO } from "@/types/karaoke";

const schema = z.object({
  singerName: z.string().trim().min(1, "Informe o cantor")
});

type FormData = z.infer<typeof schema>;

export function ParticipantDialog({
  song,
  onClose,
  onSubmit
}: {
  song: SearchResultDTO | null;
  onClose: () => void;
  onSubmit: (singerName: string) => Promise<void>;
}) {
  const [error, setError] = useState("");
  const form = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { singerName: "" } });

  async function handleSubmit(data: FormData) {
    setError("");
    try {
      await onSubmit(data.singerName);
      form.reset();
    } catch {
      setError("Não foi possivel adicionar a música.");
    }
  }

  return (
    <Dialog open={Boolean(song)} title="Nome do cantor" onClose={onClose}>
      <p className="mb-4 truncate text-sm text-muted-foreground">{song?.title}</p>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3">
        <Input placeholder="Daniel" {...form.register("singerName")} autoFocus />
        {form.formState.errors.singerName ? (
          <p className="text-sm text-destructive">{form.formState.errors.singerName.message}</p>
        ) : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button disabled={form.formState.isSubmitting}>Adicionar</Button>
        </div>
      </form>
    </Dialog>
  );
}