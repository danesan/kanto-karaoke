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
};

export type SearchResultDTO = SongDTO;