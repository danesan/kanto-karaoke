import type { PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export class AmbientPlaylistRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  list(sessionId: string) {
    return this.db.ambientPlaylist.findMany({
      where: { sessionId },
      include: { items: { include: { song: true }, orderBy: { position: "asc" } } },
      orderBy: { createdAt: "desc" }
    });
  }

  create(sessionId: string, name: string) {
    return this.db.ambientPlaylist.create({
      data: { sessionId, name },
      include: { items: { include: { song: true }, orderBy: { position: "asc" } } }
    });
  }

  update(id: string, sessionId: string, data: { name?: string; enabled?: boolean }) {
    return this.db.ambientPlaylist.update({
      where: { id, sessionId },
      data,
      include: { items: { include: { song: true }, orderBy: { position: "asc" } } }
    });
  }

  delete(id: string, sessionId: string) {
    return this.db.ambientPlaylist.delete({ where: { id, sessionId } });
  }
}
