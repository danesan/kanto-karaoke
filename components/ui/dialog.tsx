"use client";

import { X } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

type DialogProps = {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
};

export function Dialog({ open, title, children, onClose }: DialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/55 p-4 backdrop-blur-sm">
      <div className="kanto-card w-full max-w-md p-5 shadow-[var(--shadow-lift)]">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="font-display text-lg font-bold text-foreground">{title}</h2>
          <Button aria-label="Fechar" size="icon" variant="ghost" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
