import { ParticipantRole, QueueStatus, type Prisma, type PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type TransactionClient = Prisma.TransactionClient;

const ACTIVE_DUPLICATE_STATUSES = [QueueStatus.PENDING, QueueStatus.WAITING, QueueStatus.PLAYING];

export class QueueRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  list(sessionId: string) {
    return this.db.queueItem.findMany({
      where: { sessionId, status: { in: [QueueStatus.WAITING, QueueStatus.PLAYING] } },
      include: { song: true, participant: true },
      orderBy: [{ status: "desc" }, { position: "asc" }, { createdAt: "asc" }]
    });
  }

  listAdmin(sessionId: string) {
    return this.db.queueItem.findMany({
      where: { sessionId },
      include: { song: true, participant: true },
      orderBy: [{ createdAt: "desc" }]
    });
  }

  listGuest(sessionId: string, participantId: string) {
    return this.db.queueItem.findMany({
      where: {
        sessionId,
        OR: [
          { status: { in: [QueueStatus.WAITING, QueueStatus.PLAYING] } },
          { addedByParticipantId: participantId, status: { in: [QueueStatus.PENDING, QueueStatus.REJECTED] } }
        ]
      },
      include: { song: true, participant: true },
      orderBy: [{ status: "asc" }, { position: "asc" }, { createdAt: "desc" }]
    });
  }

  pending(sessionId: string) {
    return this.db.queueItem.findMany({
      where: { sessionId, status: QueueStatus.PENDING },
      include: { song: true, participant: true },
      orderBy: { createdAt: "asc" }
    });
  }

  history(sessionId: string) {
    return this.db.queueItem.findMany({
      where: { sessionId, status: { in: [QueueStatus.FINISHED, QueueStatus.SKIPPED, QueueStatus.REJECTED] } },
      include: { song: true, participant: true },
      orderBy: { createdAt: "desc" },
      take: 50
    });
  }

  findById(id: string) {
    return this.db.queueItem.findUnique({
      where: { id },
      include: { song: true, participant: true }
    });
  }

  countByOwner(sessionId: string, participantId: string, status: QueueStatus) {
    return this.db.queueItem.count({
      where: { sessionId, addedByParticipantId: participantId, status }
    });
  }

  activeDuplicateExists(sessionId: string, songId: string) {
    return this.db.queueItem.findFirst({
      where: { sessionId, songId, status: { in: ACTIVE_DUPLICATE_STATUSES } }
    });
  }

  async add(sessionId: string, songId: string, singerName: string, status: QueueStatus) {
    return this.db.$transaction(async (tx) => {
      const participant = await this.findOrCreateParticipant(tx, sessionId, singerName);
      const position = status === QueueStatus.WAITING ? await this.nextWaitingPosition(tx, sessionId) : null;
      return this.createQueueItem(tx, sessionId, songId, participant.id, participant.id, status, position);
    });
  }

  async addForParticipant(
    sessionId: string,
    songId: string,
    participantId: string,
    addedByParticipantId: string,
    status: QueueStatus
  ) {
    return this.db.$transaction(async (tx) => {
      const position = status === QueueStatus.WAITING ? await this.nextWaitingPosition(tx, sessionId) : null;
      return this.createQueueItem(tx, sessionId, songId, participantId, addedByParticipantId, status, position);
    });
  }

  async approve(id: string, adminParticipantId: string) {
    return this.db.$transaction(async (tx) => {
      const item = await tx.queueItem.findUnique({ where: { id } });

      if (!item || item.status !== QueueStatus.PENDING) {
        return null;
      }

      return tx.queueItem.update({
        where: { id },
        data: {
          status: QueueStatus.WAITING,
          position: await this.nextWaitingPosition(tx, item.sessionId),
          approvedAt: new Date(),
          approvedByParticipantId: adminParticipantId
        },
        include: { song: true, participant: true }
      });
    });
  }

  async reject(id: string, adminParticipantId: string, reason?: string) {
    const item = await this.db.queueItem.findUnique({ where: { id } });

    if (!item || item.status !== QueueStatus.PENDING) {
      return null;
    }

    return this.db.queueItem.update({
      where: { id },
      data: {
        status: QueueStatus.REJECTED,
        rejectionReason: reason?.trim() || null,
        rejectedAt: new Date(),
        rejectedByParticipantId: adminParticipantId
      },
      include: { song: true, participant: true }
    });
  }

  async remove(id: string) {
    const item = await this.findById(id);

    if (!item) {
      return null;
    }

    await this.db.queueItem.delete({ where: { id } });
    await this.reposition(item.sessionId);

    return item;
  }

  async removeOwn(id: string, participantId: string) {
    const item = await this.findById(id);

    if (!item || item.addedByParticipantId !== participantId || item.status === QueueStatus.PLAYING) {
      return null;
    }

    await this.db.queueItem.delete({ where: { id } });
    await this.reposition(item.sessionId);

    return item;
  }

  async clear(sessionId: string) {
    await this.db.queueItem.updateMany({
      where: { sessionId, status: QueueStatus.PLAYING },
      data: { status: QueueStatus.SKIPPED, finishedAt: new Date() }
    });

    return this.db.queueItem.deleteMany({ where: { sessionId, status: QueueStatus.WAITING } });
  }

  async move(id: string, direction: "up" | "down") {
    return this.db.$transaction(async (tx) => {
      const current = await tx.queueItem.findUnique({ where: { id } });

      if (!current || current.status !== QueueStatus.WAITING || current.position === null) {
        return null;
      }

      const sibling = await tx.queueItem.findFirst({
        where: {
          sessionId: current.sessionId,
          status: QueueStatus.WAITING,
          position: direction === "up" ? { lt: current.position } : { gt: current.position }
        },
        orderBy: { position: direction === "up" ? "desc" : "asc" }
      });

      if (!sibling || sibling.position === null) {
        return tx.queueItem.findUnique({ where: { id: current.id }, include: { song: true, participant: true } });
      }

      await tx.queueItem.update({ where: { id: current.id }, data: { position: sibling.position } });
      await tx.queueItem.update({ where: { id: sibling.id }, data: { position: current.position } });

      return tx.queueItem.findUnique({ where: { id: current.id }, include: { song: true, participant: true } });
    });
  }

  async reorder(sessionId: string, queueItemIds: string[]) {
    await this.db.$transaction(
      queueItemIds.map((id, index) =>
        this.db.queueItem.updateMany({
          where: { id, sessionId, status: QueueStatus.WAITING },
          data: { position: index + 1 }
        })
      )
    );
  }

  async finishPlaying(sessionId: string) {
    return this.db.$transaction(async (tx) => this.finishPlayingInTransaction(tx, sessionId));
  }

  nextWaiting(sessionId: string) {
    return this.db.queueItem.findFirst({
      where: { sessionId, status: QueueStatus.WAITING },
      include: { song: true, participant: true },
      orderBy: { position: "asc" }
    });
  }

  async startNext(sessionId: string) {
    return this.db.$transaction(async (tx) => {
      await this.finishPlayingInTransaction(tx, sessionId);

      const next = await tx.queueItem.findFirst({
        where: { sessionId, status: QueueStatus.WAITING },
        orderBy: { position: "asc" }
      });

      if (!next) {
        return null;
      }

      return tx.queueItem.update({
        where: { id: next.id },
        data: { status: QueueStatus.PLAYING, startedAt: new Date() },
        include: { song: true, participant: true }
      });
    });
  }

  private async finishPlayingInTransaction(tx: TransactionClient, sessionId: string) {
    const finishedAt = new Date();
    const playingItems = await tx.queueItem.findMany({
      where: { sessionId, status: QueueStatus.PLAYING }
    });

    for (const item of playingItems) {
      const durationSeconds = item.startedAt
        ? Math.max(0, Math.round((finishedAt.getTime() - item.startedAt.getTime()) / 1000))
        : null;

      await tx.queueItem.update({
        where: { id: item.id },
        data: { status: QueueStatus.FINISHED, finishedAt }
      });

      await tx.performance.upsert({
        where: { queueItemId: item.id },
        update: {
          finishedAt,
          durationSeconds
        },
        create: {
          queueItemId: item.id,
          sessionId: item.sessionId,
          participantId: item.participantId,
          songId: item.songId,
          startedAt: item.startedAt,
          finishedAt,
          durationSeconds
        }
      });
    }
  }
  async rejectPendingBySong(songId: string, reason: string, adminParticipantId?: string) {
    return this.db.queueItem.updateMany({
      where: { songId, status: QueueStatus.PENDING },
      data: {
        status: QueueStatus.REJECTED,
        rejectionReason: reason,
        rejectedAt: new Date(),
        rejectedByParticipantId: adminParticipantId
      }
    });
  }

  private async findOrCreateParticipant(tx: TransactionClient, sessionId: string, name: string) {
    const existing = await tx.participant.findFirst({
      where: { sessionId, name, role: ParticipantRole.GUEST },
      orderBy: { createdAt: "asc" }
    });

    if (existing) {
      return existing;
    }

    return tx.participant.create({ data: { sessionId, name, role: ParticipantRole.GUEST } });
  }

  private async nextWaitingPosition(tx: TransactionClient, sessionId: string) {
    const lastItem = await tx.queueItem.findFirst({
      where: { sessionId, status: QueueStatus.WAITING },
      orderBy: { position: "desc" }
    });

    return (lastItem?.position ?? 0) + 1;
  }

  private async createQueueItem(
    tx: TransactionClient,
    sessionId: string,
    songId: string,
    participantId: string,
    addedByParticipantId: string,
    status: QueueStatus,
    position: number | null
  ) {
    return tx.queueItem.create({
      data: { sessionId, songId, participantId, addedByParticipantId, status, position },
      include: { song: true, participant: true }
    });
  }

  private async reposition(sessionId: string) {
    const items = await this.db.queueItem.findMany({
      where: { sessionId, status: QueueStatus.WAITING },
      orderBy: { position: "asc" }
    });

    await Promise.all(
      items.map((item, index) =>
        this.db.queueItem.update({ where: { id: item.id }, data: { position: index + 1 } })
      )
    );
  }
}
