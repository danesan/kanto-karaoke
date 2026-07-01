"use client";

import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SearchBar({
  value,
  isLoading,
  onChange,
  onSubmit
}: {
  value: string;
  isLoading: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <form
      className="grid gap-2 sm:grid-cols-[1fr_auto]"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <label className="relative block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-10"
          placeholder="Buscar música no YouTube"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </label>
      <Button type="submit" disabled={isLoading || value.trim().length < 2}>
        <Search className="h-4 w-4" />
        Buscar
      </Button>
    </form>
  );
}