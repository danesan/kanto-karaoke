import { SongRepository } from "@/repositories/song.repository";
import { QueueRepository } from "@/repositories/queue.repository";
import { toSongDTO } from "@/services/mappers";

export class SongService {
  constructor(
    private readonly songs = new SongRepository(),
    private readonly queue = new QueueRepository()
  ) {}

  async listCache(query = "") {
    const songs = await this.songs.listCache(query);
    return songs.map(toSongDTO);
  }

  async update(songId: string, data: { displayTitle?: string | null }) {
    return toSongDTO(await this.songs.update(songId, data));
  }

  async block(songId: string, reason?: string, adminParticipantId?: string) {
    const song = await this.songs.block(songId, reason);
    await this.queue.rejectPendingBySong(songId, reason || "Musica bloqueada pelo administrador", adminParticipantId);
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