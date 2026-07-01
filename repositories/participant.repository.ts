import { ParticipantRole, type PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export class ParticipantRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  createGuest(sessionId: string, name: string) {
    return this.db.participant.create({
      data: { sessionId, name, role: ParticipantRole.GUEST }
    });
  }

  async findOrCreateByName(
    sessionId: string,
    name: string,
    role: ParticipantRole = ParticipantRole.GUEST
  ) {
    const existing = await this.db.participant.findFirst({
      where: { sessionId, name, role },
      orderBy: { createdAt: "asc" }
    });

    if (existing) {
      return existing;
    }

    return this.db.participant.create({ data: { sessionId, name, role } });
  }

  async findOrCreateAdmin(sessionId: string) {
    return this.findOrCreateByName(sessionId, "Administrador", ParticipantRole.ADMIN);
  }

  findById(id: string) {
    return this.db.participant.findUnique({ where: { id } });
  }

  findGuestInSession(id: string, sessionId: string) {
    return this.db.participant.findFirst({
      where: { id, sessionId, role: ParticipantRole.GUEST }
    });
  }
}