import type { PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export class SessionRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  create(name: string, code: string, adminPinHash: string) {
    return this.db.karaokeSession.create({
      data: { name, code, adminPinHash }
    });
  }

  findActiveById(id: string) {
    return this.db.karaokeSession.findFirst({
      where: { id, isActive: true, closedAt: null }
    });
  }

  findActiveByCode(code: string) {
    return this.db.karaokeSession.findFirst({
      where: { code: code.toUpperCase(), isActive: true, closedAt: null }
    });
  }

  findByCode(code: string) {
    return this.db.karaokeSession.findUnique({ where: { code: code.toUpperCase() } });
  }

  listActive() {
    return this.db.karaokeSession.findMany({
      where: { isActive: true, closedAt: null },
      orderBy: { createdAt: "desc" },
      take: 20
    });
  }

  updateSettings(
    id: string,
    data: {
      maxPendingPerParticipant?: number;
      maxWaitingPerParticipant?: number;
      allowDuplicates?: boolean;
      moderationEnabled?: boolean;
    }
  ) {
    return this.db.karaokeSession.update({ where: { id }, data });
  }

  close(id: string) {
    return this.db.karaokeSession.update({
      where: { id },
      data: { isActive: false, closedAt: new Date() }
    });
  }
}