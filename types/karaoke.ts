import type { ParticipantRole, QueueStatus } from "@prisma/client";

export type SongDTO = {
  id: string;
  youtubeVideoId: string;
  title: string;
  displayTitle: string | null;
  effectiveTitle: string;
  channel: string;
  thumbnail: string;
  duration: string;
  isFavorite: boolean;
  isBlocked: boolean;
  blockedReason: string | null;
  blockedAt: string | null;
  createdAt?: string;
  updatedAt?: string;
  searchTerms?: string[];
};

export type ParticipantDTO = {
  id: string;
  sessionId: string;
  name: string;
  role: ParticipantRole;
  createdAt: string;
};

export type QueueItemDTO = {
  id: string;
  position: number | null;
  status: QueueStatus;
  rejectionReason: string | null;
  addedByParticipantId: string | null;
  approvedAt: string | null;
  approvedByParticipantId: string | null;
  rejectedAt: string | null;
  rejectedByParticipantId: string | null;
  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  song: SongDTO;
  participant: {
    id: string;
    name: string;
    role: ParticipantRole;
  };
};

export type SessionDTO = {
  id: string;
  code: string;
  name: string;
  createdAt: string;
  isActive: boolean;
  closedAt: string | null;
  maxPendingPerParticipant: number;
  maxWaitingPerParticipant: number;
  allowDuplicates: boolean;
  moderationEnabled: boolean;
  countdownSeconds: number;
  idleModeEnabled: boolean;
  showCountdown: boolean;
  showNextSongs: boolean;
  showQrCode: boolean;
  playerMode: "KARAOKE" | "COUNTDOWN" | "IDLE";
  countdownStartedAt: string | null;
  countdownEndsAt: string | null;
  countdownTargetQueueItemId: string | null;
  ambientPlaylistId: string | null;
};

export type PlaylistType = "CUSTOM" | "FAVORITES" | "MOST_PLAYED" | "GENRE" | "AMBIENT";

export type PlaylistItemDTO = {
  id: string;
  position: number;
  song: SongDTO;
  playCount?: number;
};

export type PlaylistDTO = {
  id: string;
  sessionId: string;
  name: string;
  description: string | null;
  type: PlaylistType;
  genre: string | null;
  enabled: boolean;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
  items: PlaylistItemDTO[];
};

export type AmbientPlaylistItemDTO = PlaylistItemDTO;
export type AmbientPlaylistDTO = PlaylistDTO;

export type SearchResultDTO = SongDTO;
