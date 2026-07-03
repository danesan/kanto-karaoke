import type { PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { PlaylistType } from "@/types/karaoke";

const playlistInclude = {
  items: { include: { song: true }, orderBy: { position: "asc" } }
};

type PlaylistWriteData = {
  name?: string;
  description?: string | null;
  type?: PlaylistType;
  genre?: string | null;
  enabled?: boolean;
  isSystem?: boolean;
};

export class PlaylistRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  list(sessionId: string) {
    return (this.db as any).ambientPlaylist.findMany({
      where: { sessionId },
      include: playlistInclude,
      orderBy: [{ isSystem: "desc" }, { createdAt: "desc" }]
    });
  }

  activeAmbient(sessionId: string) {
    return (this.db as any).ambientPlaylist.findFirst({
      where: { sessionId, enabled: true, type: "AMBIENT" },
      include: playlistInclude,
      orderBy: { updatedAt: "desc" }
    });
  }

  find(sessionId: string, id: string) {
    return (this.db as any).ambientPlaylist.findFirst({
      where: { id, sessionId },
      include: playlistInclude
    });
  }

  async ensureSystem(sessionId: string, type: "FAVORITES" | "MOST_PLAYED", name: string, description: string) {
    const found = await (this.db as any).ambientPlaylist.findFirst({
      where: { sessionId, type, isSystem: true },
      include: playlistInclude
    });

    if (found) {
      return found;
    }

    return (this.db as any).ambientPlaylist.create({
      data: { sessionId, type, name, description, isSystem: true, enabled: false },
      include: playlistInclude
    });
  }

  create(sessionId: string, data: Required<Pick<PlaylistWriteData, "name" | "type">> & Pick<PlaylistWriteData, "description" | "genre" | "enabled" | "isSystem">) {
    return (this.db as any).ambientPlaylist.create({
      data: {
        sessionId,
        name: data.name,
        description: data.description ?? null,
        type: data.type,
        genre: data.genre ?? null,
        enabled: data.enabled ?? false,
        isSystem: data.isSystem ?? false
      },
      include: playlistInclude
    });
  }

  async update(id: string, sessionId: string, data: PlaylistWriteData) {
    return this.db.$transaction(async (tx) => {
      const playlist = await (tx as any).ambientPlaylist.findFirst({ where: { id, sessionId } });

      if (!playlist) {
        throw new Error("Playlist not found");
      }

      if (playlist.isSystem && (data.name || data.description !== undefined || data.type || data.genre !== undefined)) {
        throw new Error("System playlists cannot be edited");
      }

      const nextType = data.type ?? playlist.type;

      if (data.enabled && nextType === "AMBIENT") {
        await (tx as any).ambientPlaylist.updateMany({
          where: { sessionId, type: "AMBIENT", id: { not: id } },
          data: { enabled: false }
        });
      }

      const updated = await (tx as any).ambientPlaylist.update({
        where: { id },
        data,
        include: playlistInclude
      });

      if (nextType === "AMBIENT") {
        await tx.karaokeSession.update({
          where: { id: sessionId },
          data: { ambientPlaylistId: updated.enabled ? updated.id : null }
        });
      }

      return updated;
    });
  }

  async delete(id: string, sessionId: string) {
    return this.db.$transaction(async (tx) => {
      const playlist = await (tx as any).ambientPlaylist.findFirst({ where: { id, sessionId } });

      if (!playlist) {
        throw new Error("Playlist not found");
      }

      if (playlist.isSystem) {
        throw new Error("System playlists cannot be deleted");
      }

      if (playlist.type === "AMBIENT") {
        await tx.karaokeSession.updateMany({
          where: { id: sessionId, ambientPlaylistId: id },
          data: { ambientPlaylistId: null }
        });
      }

      return (tx as any).ambientPlaylist.delete({ where: { id } });
    });
  }

  async addItem(playlistId: string, sessionId: string, songId: string) {
    return this.db.$transaction(async (tx) => {
      const playlist = await (tx as any).ambientPlaylist.findFirst({ where: { id: playlistId, sessionId } });

      if (!playlist) {
        throw new Error("Playlist not found");
      }

      if (playlist.isSystem) {
        throw new Error("System playlists cannot be changed manually");
      }

      const song = await tx.song.findFirst({ where: { id: songId, isBlocked: false } });

      if (!song) {
        throw new Error("Song not found");
      }

      const lastItem = await (tx as any).ambientPlaylistItem.findFirst({
        where: { playlistId },
        orderBy: { position: "desc" }
      });

      await (tx as any).ambientPlaylistItem.upsert({
        where: { playlistId_songId: { playlistId, songId } },
        update: {},
        create: { playlistId, songId, position: (lastItem?.position ?? 0) + 1 }
      });

      return (tx as any).ambientPlaylist.findUniqueOrThrow({
        where: { id: playlistId },
        include: playlistInclude
      });
    });
  }

  async removeItem(playlistId: string, sessionId: string, itemId: string) {
    return this.db.$transaction(async (tx) => {
      await this.ensureEditablePlaylist(tx as unknown as PrismaClient, playlistId, sessionId);
      await (tx as any).ambientPlaylistItem.deleteMany({ where: { id: itemId, playlistId } });
      await this.compactPositions(tx as unknown as PrismaClient, playlistId);

      return (tx as any).ambientPlaylist.findUniqueOrThrow({
        where: { id: playlistId },
        include: playlistInclude
      });
    });
  }

  async reorderItems(playlistId: string, sessionId: string, itemIds: string[]) {
    return this.db.$transaction(async (tx) => {
      await this.ensureEditablePlaylist(tx as unknown as PrismaClient, playlistId, sessionId);

      const currentItems = await (tx as any).ambientPlaylistItem.findMany({ where: { playlistId } });
      const currentIds = new Set(currentItems.map((item: { id: string }) => item.id));

      if (itemIds.length !== currentIds.size || itemIds.some((id) => !currentIds.has(id))) {
        throw new Error("Invalid playlist order");
      }

      await Promise.all(
        itemIds.map((itemId, index) =>
          (tx as any).ambientPlaylistItem.update({ where: { id: itemId }, data: { position: index + 1 } })
        )
      );

      return (tx as any).ambientPlaylist.findUniqueOrThrow({
        where: { id: playlistId },
        include: playlistInclude
      });
    });
  }

  favoriteSongs(limit: number) {
    return this.db.song.findMany({
      where: { isFavorite: true, isBlocked: false },
      orderBy: { updatedAt: "desc" },
      take: limit
    });
  }

  async mostPlayedSongs(sessionId: string, limit: number) {
    const grouped = await this.db.performance.groupBy({
      by: ["songId"],
      where: { sessionId },
      _count: { songId: true },
      orderBy: { _count: { songId: "desc" } },
      take: limit
    });
    const ids = grouped.map((item) => item.songId);

    if (ids.length === 0) {
      return [];
    }

    const songs = await this.db.song.findMany({ where: { id: { in: ids }, isBlocked: false } });
    const songsById = new Map(songs.map((song) => [song.id, song]));

    return grouped
      .map((item) => ({ song: songsById.get(item.songId), playCount: item._count.songId }))
      .filter((item): item is { song: NonNullable<typeof item.song>; playCount: number } => Boolean(item.song));
  }

  private async ensureEditablePlaylist(tx: PrismaClient, playlistId: string, sessionId: string) {
    const playlist = await (tx as any).ambientPlaylist.findFirst({ where: { id: playlistId, sessionId } });

    if (!playlist) {
      throw new Error("Playlist not found");
    }

    if (playlist.isSystem) {
      throw new Error("System playlists cannot be changed manually");
    }
  }

  private async compactPositions(tx: PrismaClient, playlistId: string) {
    const items = await (tx as any).ambientPlaylistItem.findMany({
      where: { playlistId },
      orderBy: { position: "asc" }
    });

    await Promise.all(
      items.map((item: { id: string }, index: number) =>
        (tx as any).ambientPlaylistItem.update({ where: { id: item.id }, data: { position: index + 1 } })
      )
    );
  }
}
