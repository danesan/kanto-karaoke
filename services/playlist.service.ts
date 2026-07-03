import { PlaylistRepository } from "@/repositories/playlist.repository";
import { SessionRepository } from "@/repositories/session.repository";
import { toSongDTO } from "@/services/mappers";
import type { PlaylistDTO, PlaylistItemDTO, PlaylistType, SongDTO } from "@/types/karaoke";

type RawPlaylist = {
  id: string;
  sessionId: string;
  name: string;
  description: string | null;
  type: PlaylistType;
  genre: string | null;
  enabled: boolean;
  isSystem: boolean;
  createdAt: Date;
  updatedAt?: Date;
  items: Array<{
    id: string;
    position: number;
    song: Parameters<typeof toSongDTO>[0];
  }>;
};

type CreatePlaylistInput = {
  name: string;
  description?: string | null;
  type?: PlaylistType;
  genre?: string | null;
  enabled?: boolean;
};

type UpdatePlaylistInput = {
  name?: string;
  description?: string | null;
  type?: PlaylistType;
  genre?: string | null;
  enabled?: boolean;
};

const SYSTEM_PLAYLISTS = [
  {
    type: "FAVORITES" as const,
    name: "Favoritas",
    description: "Musicas marcadas como favoritas no cache."
  },
  {
    type: "MOST_PLAYED" as const,
    name: "Mais Cantadas",
    description: "Gerada automaticamente com base no historico da sessao."
  }
];

export class PlaylistService {
  constructor(
    private readonly playlists = new PlaylistRepository(),
    private readonly sessions = new SessionRepository()
  ) {}

  async list(sessionCode: string) {
    const session = await this.ensureSessionByCode(sessionCode);
    await this.ensureSystemPlaylists(session.id);
    const playlists = await this.playlists.list(session.id);
    return Promise.all(playlists.map((playlist: RawPlaylist) => this.toDTO(playlist, session.id)));
  }

  async activeAmbient(sessionKey: string) {
    const session = await this.ensureSessionByKey(sessionKey);

    if (!session.idleModeEnabled) {
      return null;
    }

    const playlist = await this.playlists.activeAmbient(session.id);
    return playlist ? this.toDTO(playlist, session.id) : null;
  }

  async create(sessionCode: string, input: CreatePlaylistInput) {
    const session = await this.ensureSessionByCode(sessionCode);
    const type = input.type ?? "CUSTOM";

    if (type === "FAVORITES" || type === "MOST_PLAYED") {
      throw new Error("System playlist types are generated automatically");
    }

    return this.toDTO(
      await this.playlists.create(session.id, {
        name: input.name.trim(),
        description: normalizeText(input.description),
        type,
        genre: normalizeText(input.genre),
        enabled: input.enabled ?? false,
        isSystem: false
      }),
      session.id
    );
  }

  async update(sessionCode: string, id: string, input: UpdatePlaylistInput) {
    const session = await this.ensureSessionByCode(sessionCode);
    const data: UpdatePlaylistInput = {};

    if (input.name !== undefined) data.name = input.name.trim();
    if (input.description !== undefined) data.description = normalizeText(input.description);
    if (input.type !== undefined) data.type = input.type;
    if (input.genre !== undefined) data.genre = normalizeText(input.genre);
    if (input.enabled !== undefined) data.enabled = input.enabled;

    if (data.type === "FAVORITES" || data.type === "MOST_PLAYED") {
      throw new Error("System playlist types are generated automatically");
    }

    return this.toDTO(await this.playlists.update(id, session.id, data), session.id);
  }

  async delete(sessionCode: string, id: string) {
    const session = await this.ensureSessionByCode(sessionCode);
    return this.playlists.delete(id, session.id);
  }

  async addItem(sessionCode: string, playlistId: string, songId: string) {
    const session = await this.ensureSessionByCode(sessionCode);
    return this.toDTO(await this.playlists.addItem(playlistId, session.id, songId), session.id);
  }

  async removeItem(sessionCode: string, playlistId: string, itemId: string) {
    const session = await this.ensureSessionByCode(sessionCode);
    return this.toDTO(await this.playlists.removeItem(playlistId, session.id, itemId), session.id);
  }

  async reorderItems(sessionCode: string, playlistId: string, itemIds: string[]) {
    const session = await this.ensureSessionByCode(sessionCode);
    return this.toDTO(await this.playlists.reorderItems(playlistId, session.id, itemIds), session.id);
  }

  private async ensureSystemPlaylists(sessionId: string) {
    await Promise.all(
      SYSTEM_PLAYLISTS.map((playlist) =>
        this.playlists.ensureSystem(sessionId, playlist.type, playlist.name, playlist.description)
      )
    );
  }

  private async toDTO(playlist: RawPlaylist, sessionId: string): Promise<PlaylistDTO> {
    const items = await this.resolveItems(playlist, sessionId);

    return {
      id: playlist.id,
      sessionId: playlist.sessionId,
      name: playlist.name,
      description: playlist.description ?? null,
      type: playlist.type ?? "AMBIENT",
      genre: playlist.genre ?? null,
      enabled: playlist.enabled,
      isSystem: playlist.isSystem ?? false,
      createdAt: playlist.createdAt.toISOString(),
      updatedAt: (playlist.updatedAt ?? playlist.createdAt).toISOString(),
      items
    };
  }

  private async resolveItems(playlist: RawPlaylist, sessionId: string): Promise<PlaylistItemDTO[]> {
    if (playlist.type === "FAVORITES") {
      const songs = await this.playlists.favoriteSongs(80);
      return songs.map((song, index) => systemItem(playlist.type, index, toSongDTO(song)));
    }

    if (playlist.type === "MOST_PLAYED") {
      const songs = await this.playlists.mostPlayedSongs(sessionId, 80);
      return songs.map((item, index) => ({
        ...systemItem(playlist.type, index, toSongDTO(item.song)),
        playCount: item.playCount
      }));
    }

    return playlist.items.map((item) => ({
      id: item.id,
      position: item.position,
      song: toSongDTO(item.song)
    }));
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

function normalizeText(value?: string | null) {
  const text = value?.trim();
  return text ? text : null;
}

function systemItem(type: PlaylistType, index: number, song: SongDTO): PlaylistItemDTO {
  return {
    id: `system-${type}-${song.id}`,
    position: index + 1,
    song
  };
}
