"use client";

function formatRemaining(seconds: number) {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const rest = safeSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}

export function RemainingTime({ currentTime, duration }: { currentTime: number; duration: number }) {
  const remaining = duration > 0 ? duration - currentTime : 0;

  return (
    <div className="rounded-xl border border-border/50 bg-card p-4 text-center shadow-[var(--shadow-soft)]">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-muted-foreground">Faltam</p>
      <p className="mt-2 text-3xl font-black text-primary">{formatRemaining(remaining)}</p>
    </div>
  );
}
