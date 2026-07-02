import { QueueStatus } from "@prisma/client";
import { QueueRepository } from "@/repositories/queue.repository";
import { SessionRepository } from "@/repositories/session.repository";
import { toQueueItemDTO, toSessionDTO } from "@/services/mappers";

export class PlayerEventService {
  constructor(
    private readonly sessions = new SessionRepository(),
    private readonly queue = new QueueRepository()
  ) {}

  async startCountdown(sessionKey: string, secondsOverride?: number) {
    const session = await this.ensureSessionByKey(sessionKey);
    await this.queue.finishPlaying(session.id);

    const next = await this.queue.nextWaiting(session.id);

    if (!next) {
      return this.startIdle(session.id);
    }

    const seconds = Math.max(1, Math.min(120, secondsOverride ?? session.countdownSeconds));
    const now = new Date();
    const countdownEndsAt = new Date(now.getTime() + seconds * 1000);
    const updated = await this.sessions.updatePlayerState(session.id, {
      playerMode: session.showCountdown ? "COUNTDOWN" : "KARAOKE",
      countdownStartedAt: session.showCountdown ? now : null,
      countdownEndsAt: session.showCountdown ? countdownEndsAt : null,
      countdownTargetQueueItemId: session.showCountdown ? next.id : null
    });

    if (!session.showCountdown) {
      const item = await this.queue.startNext(session.id);
      return { session: toSessionDTO(updated), item: item ? toQueueItemDTO(item) : null };
    }

    return { session: toSessionDTO(updated), item: toQueueItemDTO(next) };
  }

  async updateCountdown(sessionKey: string, seconds: number) {
    const session = await this.ensureSessionByKey(sessionKey);
    const safeSeconds = Math.max(1, Math.min(120, seconds));
    const now = new Date();
    const updated = await this.sessions.updatePlayerState(session.id, {
      playerMode: "COUNTDOWN",
      countdownStartedAt: session.countdownStartedAt ?? now,
      countdownEndsAt: new Date(now.getTime() + safeSeconds * 1000),
      countdownTargetQueueItemId: session.countdownTargetQueueItemId
    });

    return { session: toSessionDTO(updated) };
  }

  async cancelCountdown(sessionKey: string) {
    const session = await this.ensureSessionByKey(sessionKey);
    const updated = await this.sessions.updatePlayerState(session.id, {
      playerMode: "KARAOKE",
      countdownStartedAt: null,
      countdownEndsAt: null,
      countdownTargetQueueItemId: null
    });

    return { session: toSessionDTO(updated) };
  }

  async startNext(sessionKey: string) {
    const session = await this.ensureSessionByKey(sessionKey);
    const item = await this.queue.startNext(session.id);
    const updated = await this.sessions.updatePlayerState(session.id, {
      playerMode: item ? "KARAOKE" : "IDLE",
      countdownStartedAt: null,
      countdownEndsAt: null,
      countdownTargetQueueItemId: null
    });

    return { session: toSessionDTO(updated), item: item ? toQueueItemDTO(item) : null };
  }

  async startIdle(sessionKey: string) {
    const session = await this.ensureSessionByKey(sessionKey);
    const updated = await this.sessions.updatePlayerState(session.id, {
      playerMode: session.idleModeEnabled ? "IDLE" : "KARAOKE",
      countdownStartedAt: null,
      countdownEndsAt: null,
      countdownTargetQueueItemId: null
    });

    return { session: toSessionDTO(updated), item: null };
  }

  async stopIdle(sessionKey: string) {
    const session = await this.ensureSessionByKey(sessionKey);
    const updated = await this.sessions.updatePlayerState(session.id, {
      playerMode: "KARAOKE",
      countdownStartedAt: null,
      countdownEndsAt: null,
      countdownTargetQueueItemId: null
    });

    return { session: toSessionDTO(updated) };
  }

  private async ensureSessionByKey(sessionKey: string) {
    const session =
      (await this.sessions.findActiveById(sessionKey)) ??
      (await this.sessions.findActiveByCode(sessionKey));

    if (!session) {
      throw new Error("Session not found");
    }

    return session;
  }
}
