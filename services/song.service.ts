import { SongRepository } from "@/repositories/song.repository";
import { QueueRepository } from "@/repositories/queue.repository";
import { toSongDTO } from "@/services/mappers";

export class SongService {
  constructor(
    private readonly songs = new SongRepository(),
    private readonly queue = new QueueRepository()
  ) {}

  async listCache(query = "", page = 1, pageSize = 20) {
    const safePageSize = Math.min(100, Math.max(5, Math.floor(pageSize)));
    const total = await this.songs.countCache(query);
    const totalPages = Math.max(1, Math.ceil(total / safePageSize));
    const safePage = Math.min(Math.max(1, Math.floor(page)), totalPages);
    const songs = await this.songs.listCache(query, safePage, safePageSize);

    return {
      songs: songs.map(toSongDTO),
      total,
      page: safePage,
      pageSize: safePageSize,
      totalPages
    };
  }

  async update(songId: string, data: { displayTitle?: string | null }) {
    return toSongDTO(await this.songs.update(songId, data));
  }

  async block(songId: string, reason?: string, adminParticipantId?: string) {
    const song = await this.songs.block(songId, reason);
    await this.queue.rejectPendingBySong(songId, reason || "Música bloqueada pelo administrador", adminParticipantId);
    return toSongDTO(song);
  }

  async unblock(songId: string) {
    return toSongDTO(await this.songs.unblock(songId));
  }

  async favorite(songId: string, isFavorite: boolean) {
    return toSongDTO(await this.songs.favorite(songId, isFavorite));
  }

  async deleteOld(days = 30) {
    const before = new Date();
    before.setDate(before.getDate() - days);
    return this.songs.deleteOld(before);
  }
}
