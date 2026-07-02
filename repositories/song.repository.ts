import type { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { YouTubeVideo } from "@/lib/youtube";

export class SongRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  findBySearchTerm(normalizedSearchTerm: string) {
    return this.db.searchCache.findMany({
      where: {
        normalizedSearchTerm,
        song: { isBlocked: false }
      },
      include: { song: true },
      orderBy: { resultPosition: "asc" }
    });
  }

  async cacheSearchResults(normalizedSearchTerm: string, videos: YouTubeVideo[]) {
    let position = 0;

    for (const video of videos) {
      const song = await this.db.song.upsert({
        where: { youtubeVideoId: video.youtubeVideoId },
        update: {
          title: video.title,
          channel: video.channel,
          thumbnail: video.thumbnail,
          duration: video.duration
        },
        create: video
      });

      await this.db.searchCache.upsert({
        where: {
          normalizedSearchTerm_songId: {
            normalizedSearchTerm,
            songId: song.id
          }
        },
        update: { resultPosition: position },
        create: {
          normalizedSearchTerm,
          songId: song.id,
          resultPosition: position
        }
      });

      position += 1;
    }

    return this.findBySearchTerm(normalizedSearchTerm);
  }

  findById(songId: string) {
    return this.db.song.findUnique({ where: { id: songId } });
  }

  private cacheWhere(query = ""): Prisma.SongWhereInput {
    const trimmed = query.trim();

    return trimmed
      ? {
          OR: [
            { title: { contains: trimmed, mode: "insensitive" } },
            { displayTitle: { contains: trimmed, mode: "insensitive" } },
            { channel: { contains: trimmed, mode: "insensitive" } },
            { youtubeVideoId: { contains: trimmed, mode: "insensitive" } }
          ]
        }
      : {};
  }

  listCache(query = "", page = 1, pageSize = 20) {
    const skip = (page - 1) * pageSize;

    return this.db.song.findMany({
      where: this.cacheWhere(query),
      include: { searchCaches: true },
      orderBy: [{ isBlocked: "asc" }, { updatedAt: "desc" }],
      skip,
      take: pageSize
    });
  }

  countCache(query = "") {
    return this.db.song.count({ where: this.cacheWhere(query) });
  }

  update(songId: string, data: { displayTitle?: string | null }) {
    return this.db.song.update({ where: { id: songId }, data });
  }

  block(songId: string, reason?: string) {
    return this.db.song.update({
      where: { id: songId },
      data: {
        isBlocked: true,
        blockedReason: reason?.trim() || null,
        blockedAt: new Date()
      }
    });
  }

  unblock(songId: string) {
    return this.db.song.update({
      where: { id: songId },
      data: { isBlocked: false, blockedReason: null, blockedAt: null }
    });
  }

  favorite(songId: string, isFavorite: boolean) {
    return this.db.song.update({ where: { id: songId }, data: { isFavorite } });
  }

  async deleteOld(before: Date) {
    await this.db.searchCache.deleteMany({ where: { createdAt: { lt: before } } });

    return this.db.song.deleteMany({
      where: {
        createdAt: { lt: before },
        isFavorite: false,
        isBlocked: false,
        queueItems: { none: {} },
        searchCaches: { none: {} }
      }
    });
  }
}