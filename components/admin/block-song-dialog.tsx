"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export function BlockSongDialog({ open, onClose, onConfirm }: { open: boolean; onClose: () => void; onConfirm: (reason: string) => void }) {
  const [reason, setReason] = useState("");

  return (
    <Dialog open={open} title="Bloquear música" onClose={onClose}>
      <div className="space-y-4">
        <Input placeholder="Motivo opcional" value={reason} onChange={(event) => setReason(event.target.value)} />
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button variant="destructive" onClick={() => onConfirm(reason)}>Bloquear</Button>
        </div>
      </div>
    </Dialog>
  );
}
