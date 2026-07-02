import { AmbientPlaylistRepository } from "@/repositories/ambient-playlist.repository";
import { SessionRepository } from "@/repositories/session.repository";
import { toSongDTO } from "@/services/mappers";

function toAmbientPlaylistDTO(playlist: Awaited<ReturnType<AmbientPlaylistRepository["create"]>>) {
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
    const session = await this.ensureSession(sessionCode);
    const playlists = await this.playlists.list(session.id);
    return playlists.map(toAmbientPlaylistDTO);
  }

  async create(sessionCode: string, name: string) {
    const session = await this.ensureSession(sessionCode);
    return toAmbientPlaylistDTO(await this.playlists.create(session.id, name.trim()));
  }

  async update(sessionCode: string, id: string, data: { name?: string; enabled?: boolean }) {
    const session = await this.ensureSession(sessionCode);
    return toAmbientPlaylistDTO(await this.playlists.update(id, session.id, data));
  }

  async delete(sessionCode: string, id: string) {
    const session = await this.ensureSession(sessionCode);
    return this.playlists.delete(id, session.id);
  }

  private async ensureSession(sessionCode: string) {
    const session = await this.sessions.findActiveByCode(sessionCode);

    if (!session) {
      throw new Error("Session not found");
    }

    return session;
  }
}
