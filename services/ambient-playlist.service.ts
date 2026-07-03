import { AmbientPlaylistRepository } from "@/repositories/ambient-playlist.repository";
import { SessionRepository } from "@/repositories/session.repository";
import { toSongDTO } from "@/services/mappers";
import type { AmbientPlaylistDTO } from "@/types/karaoke";

type PlaylistWithItems = Awaited<ReturnType<AmbientPlaylistRepository["create"]>>;

function toAmbientPlaylistDTO(playlist: PlaylistWithItems): AmbientPlaylistDTO {
  return {
    id: playlist.id,
    sessionId: playlist.sessionId,
    name: playlist.name,
    enabled: playlist.enabled,
    createdAt: playlist.createdAt.toISOString(),
    items: playlist.items.map((item) => ({
      id: item.id,
      position: item.position,
      song: toSongDTO(item.song)
    }))
  };
}

export class AmbientPlaylistService {
  constructor(
    private readonly playlists = new AmbientPlaylistRepository(),
    private readonly sessions = new SessionRepository()
  ) {}

  async list(sessionCode: string) {
    const session = await this.ensureSessionByCode(sessionCode);
    const playlists = await this.playlists.list(session.id);
    return playlists.map(toAmbientPlaylistDTO);
  }

  async active(sessionKey: string) {
    const session = await this.ensureSessionByKey(sessionKey);

    if (!session.idleModeEnabled) {
      return null;
    }

    const playlist = await this.playlists.active(session.id);
    return playlist ? toAmbientPlaylistDTO(playlist) : null;
  }

  async create(sessionCode: string, name: string) {
    const session = await this.ensureSessionByCode(sessionCode);
    return toAmbientPlaylistDTO(await this.playlists.create(session.id, name.trim()));
  }

  async update(sessionCode: string, id: string, data: { name?: string; enabled?: boolean }) {
    const session = await this.ensureSessionByCode(sessionCode);
    return toAmbientPlaylistDTO(
      await this.playlists.update(id, session.id, {
        name: data.name,
        enabled: data.enabled
      })
    );
  }

  async delete(sessionCode: string, id: string) {
    const session = await this.ensureSessionByCode(sessionCode);
    return this.playlists.delete(id, session.id);
  }

  async addItem(sessionCode: string, playlistId: string, songId: string) {
    const session = await this.ensureSessionByCode(sessionCode);
    return toAmbientPlaylistDTO(await this.playlists.addItem(playlistId, session.id, songId));
  }

  async removeItem(sessionCode: string, playlistId: string, itemId: string) {
    const session = await this.ensureSessionByCode(sessionCode);
    return toAmbientPlaylistDTO(await this.playlists.removeItem(playlistId, session.id, itemId));
  }

  private async ensureSessionByCode(sessionCode: string) {
    const session = await this.sessions.findActiveByCode(sessionCode);

    if (!session) {
      throw new Error("Session not found");
    }

    return session;
  }

  private async ensureSessionByKey(sessionKey: string) {
    const session =
      (await this.sessions.findActiveById(sessionKey)) ??
      (await this.sessions.findActiveByCode(sessionKey));

    if (!session) {
      throw new Error("Session not found");
    }

    return session;
  }
}
