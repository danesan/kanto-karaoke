import { getRequiredEnv } from "@/lib/env";

type YouTubeSearchResponse = {
  items?: Array<{
    id?: { videoId?: string };
  }>;
};

type YouTubeVideosResponse = {
  items?: Array<{
    id: string;
    snippet: {
      title: string;
      channelTitle: string;
      thumbnails: {
        medium?: { url: string };
        default?: { url: string };
      };
    };
    contentDetails: {
      duration: string;
    };
  }>;
};

export type YouTubeVideo = {
  youtubeVideoId: string;
  title: string;
  channel: string;
  thumbnail: string;
  duration: string;
};

export async function searchYouTubeVideos(query: string): Promise<YouTubeVideo[]> {
  const key = getRequiredEnv("YOUTUBE_API_KEY");
  const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
  searchUrl.searchParams.set("key", key);
  searchUrl.searchParams.set("part", "id");
  searchUrl.searchParams.set("type", "video");
  searchUrl.searchParams.set("videoEmbeddable", "true");
  searchUrl.searchParams.set("maxResults", "8");
  searchUrl.searchParams.set("q", query);

  const searchResponse = await fetch(searchUrl, { cache: "no-store" });

  if (!searchResponse.ok) {
    throw new Error("YouTube search failed");
  }

  const searchData = (await searchResponse.json()) as YouTubeSearchResponse;
  const ids =
    searchData.items?.map((item) => item.id?.videoId).filter(Boolean).join(",") ?? "";

  if (!ids) {
    return [];
  }

  const videosUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
  videosUrl.searchParams.set("key", key);
  videosUrl.searchParams.set("part", "snippet,contentDetails");
  videosUrl.searchParams.set("id", ids);

  const videosResponse = await fetch(videosUrl, { cache: "no-store" });

  if (!videosResponse.ok) {
    throw new Error("YouTube videos lookup failed");
  }

  const videosData = (await videosResponse.json()) as YouTubeVideosResponse;

  return (
    videosData.items?.map((item) => ({
      youtubeVideoId: item.id,
      title: item.snippet.title,
      channel: item.snippet.channelTitle,
      thumbnail:
        item.snippet.thumbnails.medium?.url ??
        item.snippet.thumbnails.default?.url ??
        `https://i.ytimg.com/vi/${item.id}/mqdefault.jpg`,
      duration: item.contentDetails.duration
    })) ?? []
  );
}
