import { QueueStatus } from "@prisma/client";
import { ParticipantRepository } from "@/repositories/participant.repository";
import { QueueRepository } from "@/repositories/queue.repository";
import { SessionRepository } from "@/repositories/session.repository";
import { SongRepository } from "@/repositories/song.repository";
import { toQueueItemDTO } from "@/services/mappers";

export class QueueService {
  constructor(
    private readonly queue = new QueueRepository(),
    private readonly sessions = new SessionRepository(),
    private readonly songs = new SongRepository(),
    private readonly participants = new ParticipantRepository()
  ) {}

  async list(sessionId: string) {
    await this.ensureSession(sessionId);
    const items = await this.queue.list(sessionId);
    return items.map(toQueueItemDTO);
  }

  async listBySessionCode(sessionCode: string) {
    const session = await this.ensureSessionByCode(sessionCode);
    const items = await this.queue.list(session.id);
    return items.map(toQueueItemDTO);
  }

  async listBySessionKey(sessionKey: string) {
    const session = await this.ensureSessionByKey(sessionKey);
    const items = await this.queue.list(session.id);
    return items.map(toQueueItemDTO);
  }

  async listGuestBySessionCode(sessionCode: string, participantId: string) {
    const session = await this.ensureSessionByCode(sessionCode);
    const items = await this.queue.listGuest(session.id, participantId);
    return items.map(toQueueItemDTO);
  }

  async listAdminBySessionCode(sessionCode: string) {
    const session = await this.ensureSessionByCode(sessionCode);
    const [items, pending, history] = await Promise.all([
      this.queue.list(session.id),
      this.queue.pending(session.id),
      this.queue.history(session.id)
    ]);

    return {
      queue: items.map(toQueueItemDTO),
      pending: pending.map(toQueueItemDTO),
      history: history.map(toQueueItemDTO)
    };
  }

  async add(sessionId: string, songId: string, singerName: string) {
    const session = await this.ensureSession(sessionId);
    await this.ensureSongCanBeQueued(session.id, songId, session.allowDuplicates);

    const item = await this.queue.add(sessionId, songId, singerName.trim(), QueueStatus.WAITING);
    await this.startFirstSongIfNeeded(sessionId);

    return toQueueItemDTO(item);
  }

  async addBySessionKey(sessionKey: string, songId: string, singerName: string) {
    const session = await this.ensureSessionByKey(sessionKey);
    await this.ensureSongCanBeQueued(session.id, songId, session.allowDuplicates);

    const item = await this.queue.add(session.id, songId, singerName.trim(), QueueStatus.WAITING);
    await this.startFirstSongIfNeeded(session.id);

    return toQueueItemDTO(item);
  }

  async addForGuest(sessionCode: string, songId: string, participantId: string, singerName: string) {
    const session = await this.ensureSessionByCode(sessionCode);
    const owner = await this.participants.findGuestInSession(participantId, session.id);

    if (!owner) {
      throw new Error("Guest not found");
    }

    await this.ensureSongCanBeQueued(session.id, songId, session.allowDuplicates);
    await this.ensureParticipantLimits(session.id, owner.id, session.maxPendingPerParticipant, session.maxWaitingPerParticipant);

    const singer =
      singerName.trim() === owner.name
        ? owner
        : await this.participants.findOrCreateByName(session.id, singerName.trim());
    const status = session.moderationEnabled ? QueueStatus.PENDING : QueueStatus.WAITING;
    const item = await this.queue.addForParticipant(session.id, songId, singer.id, owner.id, status);

    if (status === QueueStatus.WAITING) {
      await this.startFirstSongIfNeeded(session.id);
    }

    return toQueueItemDTO(item);
  }

  async approve(sessionCode: string, queueItemId: string) {
    const session = await this.ensureSessionByCode(sessionCode);
    const admin = await this.participants.findOrCreateAdmin(session.id);
    const item = await this.queue.approve(queueItemId, admin.id);

    if (!item) {
      throw new Error("Pending item not found");
    }

    await this.startFirstSongIfNeeded(session.id);
    return toQueueItemDTO(item);
  }

  async reject(sessionCode: string, queueItemId: string, reason?: string) {
    const session = await this.ensureSessionByCode(sessionCode);
    const admin = await this.participants.findOrCreateAdmin(session.id);
    const item = await this.queue.reject(queueItemId, admin.id, reason);

    if (!item) {
      throw new Error("Pending item not found");
    }

    return toQueueItemDTO(item);
  }

  async remove(queueItemId: string) {
    const item = await this.queue.remove(queueItemId);
    return item ? toQueueItemDTO(item) : null;
  }

  async removeOwn(queueItemId: string, participantId: string) {
    const item = await this.queue.removeOwn(queueItemId, participantId);
    return item ? toQueueItemDTO(item) : null;
  }

  async clear(sessionId: string) {
    await this.ensureSession(sessionId);
    return this.queue.clear(sessionId);
  }

  async clearByCode(sessionCode: string) {
    const session = await this.ensureSessionByCode(sessionCode);
    return this.queue.clear(session.id);
  }

  async clearBySessionKey(sessionKey: string) {
    const session = await this.ensureSessionByKey(sessionKey);
    return this.queue.clear(session.id);
  }

  async move(queueItemId: string, direction: "up" | "down") {
    const item = await this.queue.move(queueItemId, direction);
    return item ? toQueueItemDTO(item) : null;
  }

  async reorder(sessionCode: string, queueItemIds: string[]) {
    const session = await this.ensureSessionByCode(sessionCode);
    await this.queue.reorder(session.id, queueItemIds);
  }

  async next(sessionId: string) {
    await this.ensureSession(sessionId);
    const item = await this.queue.startNext(sessionId);
    await this.sessions.updatePlayerState(sessionId, {
      playerMode: item ? "KARAOKE" : "IDLE",
      countdownStartedAt: null,
      countdownEndsAt: null,
      countdownTargetQueueItemId: null
    });
    return item ? toQueueItemDTO(item) : null;
  }

  async skipByCode(sessionCode: string) {
    const session = await this.ensureSessionByCode(sessionCode);
    const item = await this.queue.startNext(session.id);
    await this.sessions.updatePlayerState(session.id, {
      playerMode: item ? "KARAOKE" : "IDLE",
      countdownStartedAt: null,
      countdownEndsAt: null,
      countdownTargetQueueItemId: null
    });
    return item ? toQueueItemDTO(item) : null;
  }

  async nextBySessionKey(sessionKey: string) {
    const session = await this.ensureSessionByKey(sessionKey);
    const item = await this.queue.startNext(session.id);
    await this.sessions.updatePlayerState(session.id, {
      playerMode: item ? "KARAOKE" : "IDLE",
      countdownStartedAt: null,
      countdownEndsAt: null,
      countdownTargetQueueItemId: null
    });
    return item ? toQueueItemDTO(item) : null;
  }

  private async ensureSongCanBeQueued(sessionId: string, songId: string, allowDuplicates: boolean) {
    const song = await this.songs.findById(songId);

    if (!song) {
      throw new Error("Song not found");
    }

    if (song.isBlocked) {
      throw new Error("Song is blocked");
    }

    if (!allowDuplicates) {
      const duplicate = await this.queue.activeDuplicateExists(sessionId, songId);

      if (duplicate) {
        throw new Error("Song already exists in queue or pending suggestions");
      }
    }
  }

  private async ensureParticipantLimits(
    sessionId: string,
    participantId: string,
    maxPending: number,
    maxWaiting: number
  ) {
    const [pendingCount, waitingCount] = await Promise.all([
      this.queue.countByOwner(sessionId, participantId, QueueStatus.PENDING),
      this.queue.countByOwner(sessionId, participantId, QueueStatus.WAITING)
    ]);

    if (pendingCount >= maxPending) {
      throw new Error("Pending suggestion limit reached");
    }

    if (waitingCount >= maxWaiting) {
      throw new Error("Waiting queue limit reached");
    }
  }

  private async startFirstSongIfNeeded(sessionId: string) {
    const [session, items] = await Promise.all([
      this.sessions.findActiveById(sessionId),
      this.queue.list(sessionId)
    ]);
    const hasPlaying = items.some((queueItem) => queueItem.status === QueueStatus.PLAYING);

    if (!hasPlaying && session && !session.showCountdown) {
      await this.queue.startNext(sessionId);
    }
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

  private async ensureSession(sessionId: string) {
    const session = await this.sessions.findActiveById(sessionId);

    if (!session) {
      throw new Error("Session not found");
    }

    return session;
  }

  private async ensureSessionByCode(sessionCode: string) {
    const session = await this.sessions.findActiveByCode(sessionCode);

    if (!session) {
      throw new Error("Session not found");
    }

    return session;
  }
}
