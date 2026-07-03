import { PlaylistService } from "@/services/playlist.service";
import type { AmbientPlaylistDTO } from "@/types/karaoke";

export class AmbientPlaylistService {
  constructor(private readonly playlists = new PlaylistService()) {}

  async list(sessionCode: string): Promise<AmbientPlaylistDTO[]> {
    return (await this.playlists.list(sessionCode)).filter((playlist) => playlist.type === "AMBIENT");
  }

  async active(sessionKey: string): Promise<AmbientPlaylistDTO | null> {
    return this.playlists.activeAmbient(sessionKey);
  }

  async create(sessionCode: string, name: string): Promise<AmbientPlaylistDTO> {
    return this.playlists.create(sessionCode, { name, type: "AMBIENT" });
  }

  async update(sessionCode: string, id: string, data: { name?: string; enabled?: boolean }): Promise<AmbientPlaylistDTO> {
    return this.playlists.update(sessionCode, id, data);
  }

  async delete(sessionCode: string, id: string) {
    return this.playlists.delete(sessionCode, id);
  }

  async addItem(sessionCode: string, playlistId: string, songId: string): Promise<AmbientPlaylistDTO> {
    return this.playlists.addItem(sessionCode, playlistId, songId);
  }

  async removeItem(sessionCode: string, playlistId: string, itemId: string): Promise<AmbientPlaylistDTO> {
    return this.playlists.removeItem(sessionCode, playlistId, itemId);
  }
}
