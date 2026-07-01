import { normalizeSearchTerm } from "@/lib/utils";
import { searchYouTubeVideos } from "@/lib/youtube";
import { SongRepository } from "@/repositories/song.repository";
import { toSongDTO } from "@/services/mappers";

export class SearchService {
  constructor(private readonly songs = new SongRepository()) {}

  async search(rawTerm: string) {
    const searchTerm = normalizeSearchTerm(rawTerm);

    if (searchTerm.length < 2) {
      return [];
    }

    const cached = await this.songs.findBySearchTerm(searchTerm);

    if (cached.length > 0) {
      return cached.map((item) => toSongDTO(item.song));
    }

    const videos = await searchYouTubeVideos(searchTerm);
    const saved = await this.songs.cacheSearchResults(searchTerm, videos);

    return saved.map((item) => toSongDTO(item.song));
  }
}