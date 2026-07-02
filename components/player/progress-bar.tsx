"use client";

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}

export function ProgressBar({ currentTime, duration }: { currentTime: number; duration: number }) {
  const percent = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

  return (
    <div className="rounded-xl border border-border/50 bg-card p-4 shadow-[var(--shadow-soft)]">
      <div className="h-3 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70" style={{ width: `${percent}%` }} />
      </div>
      <p className="mt-3 text-right text-sm font-bold text-muted-foreground">
        {formatTime(currentTime)} / {formatTime(duration)}
      </p>
    </div>
  );
}
