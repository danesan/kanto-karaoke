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

  active(sessionId: string) {
    return this.db.ambientPlaylist.findFirst({
      where: { sessionId, enabled: true },
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

  async update(id: string, sessionId: string, data: { name?: string; enabled?: boolean }) {
    return this.db.$transaction(async (tx) => {
      const playlist = await tx.ambientPlaylist.findFirst({ where: { id, sessionId } });

      if (!playlist) {
        throw new Error("Ambient playlist not found");
      }

      if (data.enabled) {
        await tx.ambientPlaylist.updateMany({
          where: { sessionId, id: { not: id } },
          data: { enabled: false }
        });
      }

      const updated = await tx.ambientPlaylist.update({
        where: { id },
        data,
        include: { items: { include: { song: true }, orderBy: { position: "asc" } } }
      });

      await tx.karaokeSession.update({
        where: { id: sessionId },
        data: { ambientPlaylistId: updated.enabled ? updated.id : null }
      });

      return updated;
    });
  }

  async delete(id: string, sessionId: string) {
    const playlist = await this.db.ambientPlaylist.findFirst({ where: { id, sessionId } });

    if (!playlist) {
      throw new Error("Ambient playlist not found");
    }

    return this.db.ambientPlaylist.delete({ where: { id } });
  }

  async addItem(playlistId: string, sessionId: string, songId: string) {
    return this.db.$transaction(async (tx) => {
      const playlist = await tx.ambientPlaylist.findFirst({ where: { id: playlistId, sessionId } });

      if (!playlist) {
        throw new Error("Ambient playlist not found");
      }

      const song = await tx.song.findFirst({ where: { id: songId, isBlocked: false } });

      if (!song) {
        throw new Error("Song not found");
      }

      const lastItem = await tx.ambientPlaylistItem.findFirst({
        where: { playlistId },
        orderBy: { position: "desc" }
      });

      await tx.ambientPlaylistItem.upsert({
        where: { playlistId_songId: { playlistId, songId } },
        update: {},
        create: {
          playlistId,
          songId,
          position: (lastItem?.position ?? 0) + 1
        }
      });

      return tx.ambientPlaylist.findUniqueOrThrow({
        where: { id: playlistId },
        include: { items: { include: { song: true }, orderBy: { position: "asc" } } }
      });
    });
  }

  async removeItem(playlistId: string, sessionId: string, itemId: string) {
    return this.db.$transaction(async (tx) => {
      const playlist = await tx.ambientPlaylist.findFirst({ where: { id: playlistId, sessionId } });

      if (!playlist) {
        throw new Error("Ambient playlist not found");
      }

      await tx.ambientPlaylistItem.deleteMany({ where: { id: itemId, playlistId } });

      const items = await tx.ambientPlaylistItem.findMany({
        where: { playlistId },
        orderBy: { position: "asc" }
      });

      await Promise.all(
        items.map((item, index) =>
          tx.ambientPlaylistItem.update({ where: { id: item.id }, data: { position: index + 1 } })
        )
      );

      return tx.ambientPlaylist.findUniqueOrThrow({
        where: { id: playlistId },
        include: { items: { include: { song: true }, orderBy: { position: "asc" } } }
      });
    });
  }
}
