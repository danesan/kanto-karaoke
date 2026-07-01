import type { KaraokeSession, Participant, QueueItem, SearchCache, Song } from "@prisma/client";
import type { ParticipantDTO, QueueItemDTO, SessionDTO, SongDTO } from "@/types/karaoke";

export function toSongDTO(song: Song & { searchCaches?: SearchCache[] }): SongDTO {
  return {
    id: song.id,
    youtubeVideoId: song.youtubeVideoId,
    title: song.title,
    displayTitle: song.displayTitle,
    effectiveTitle: song.displayTitle ?? song.title,
    channel: song.channel,
    thumbnail: song.thumbnail,
    duration: song.duration,
    isFavorite: song.isFavorite,
    isBlocked: song.isBlocked,
    blockedReason: song.blockedReason,
    blockedAt: song.blockedAt?.toISOString() ?? null,
    createdAt: song.createdAt.toISOString(),
    updatedAt: song.updatedAt.toISOString(),
    searchTerms: song.searchCaches?.map((cache) => cache.normalizedSearchTerm)
  };
}

export function toParticipantDTO(participant: Participant): ParticipantDTO {
  return {
    id: participant.id,
    sessionId: participant.sessionId,
    name: participant.name,
    role: participant.role,
    createdAt: participant.createdAt.toISOString()
  };
}

export function toSessionDTO(session: KaraokeSession): SessionDTO {
  return {
    id: session.id,
    code: session.code,
    name: session.name,
    createdAt: session.createdAt.toISOString(),
    isActive: session.isActive,
    closedAt: session.closedAt?.toISOString() ?? null,
    maxPendingPerParticipant: session.maxPendingPerParticipant,
    maxWaitingPerParticipant: session.maxWaitingPerParticipant,
    allowDuplicates: session.allowDuplicates,
    moderationEnabled: session.moderationEnabled
  };
}

export function toQueueItemDTO(
  item: QueueItem & { song: Song; participant: Participant }
): QueueItemDTO {
  return {
    id: item.id,
    position: item.position,
    status: item.status,
    rejectionReason: item.rejectionReason,
    addedByParticipantId: item.addedByParticipantId,
    approvedAt: item.approvedAt?.toISOString() ?? null,
    approvedByParticipantId: item.approvedByParticipantId,
    rejectedAt: item.rejectedAt?.toISOString() ?? null,
    rejectedByParticipantId: item.rejectedByParticipantId,
    createdAt: item.createdAt.toISOString(),
    startedAt: item.startedAt?.toISOString() ?? null,
    finishedAt: item.finishedAt?.toISOString() ?? null,
    song: toSongDTO(item.song),
    participant: {
      id: item.participant.id,
      name: item.participant.name,
      role: item.participant.role
    }
  };
}