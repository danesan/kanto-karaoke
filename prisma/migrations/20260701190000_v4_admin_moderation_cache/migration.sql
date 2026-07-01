ALTER TYPE "QueueStatus" ADD VALUE IF NOT EXISTS 'PENDING';
ALTER TYPE "QueueStatus" ADD VALUE IF NOT EXISTS 'REJECTED';

ALTER TABLE "karaoke_sessions"
  ADD COLUMN IF NOT EXISTS "admin_pin_hash" TEXT,
  ADD COLUMN IF NOT EXISTS "max_pending_per_participant" INTEGER NOT NULL DEFAULT 2,
  ADD COLUMN IF NOT EXISTS "max_waiting_per_participant" INTEGER NOT NULL DEFAULT 2,
  ADD COLUMN IF NOT EXISTS "allow_duplicates" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "moderation_enabled" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "closed_at" TIMESTAMP NULL;

ALTER TABLE "songs"
  ADD COLUMN IF NOT EXISTS "display_title" TEXT NULL,
  ADD COLUMN IF NOT EXISTS "is_favorite" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "is_blocked" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "blocked_reason" TEXT NULL,
  ADD COLUMN IF NOT EXISTS "blocked_at" TIMESTAMP NULL,
  ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP NOT NULL DEFAULT now();

ALTER TABLE "queue_items"
  ALTER COLUMN "position" DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS "rejection_reason" TEXT NULL,
  ADD COLUMN IF NOT EXISTS "approved_at" TIMESTAMP NULL,
  ADD COLUMN IF NOT EXISTS "approved_by_participant_id" TEXT NULL,
  ADD COLUMN IF NOT EXISTS "rejected_at" TIMESTAMP NULL,
  ADD COLUMN IF NOT EXISTS "rejected_by_participant_id" TEXT NULL;

ALTER TABLE "search_cache" RENAME COLUMN "search_term" TO "normalized_search_term";
ALTER TABLE "search_cache" ADD COLUMN IF NOT EXISTS "result_position" INTEGER NOT NULL DEFAULT 0;
DROP INDEX IF EXISTS "search_cache_search_term_idx";
DROP INDEX IF EXISTS "search_cache_search_term_song_id_key";
CREATE INDEX IF NOT EXISTS "search_cache_normalized_search_term_idx" ON "search_cache"("normalized_search_term");
CREATE UNIQUE INDEX IF NOT EXISTS "search_cache_normalized_search_term_song_id_key" ON "search_cache"("normalized_search_term", "song_id");

CREATE INDEX IF NOT EXISTS "songs_title_idx" ON "songs"("title");
CREATE INDEX IF NOT EXISTS "songs_channel_idx" ON "songs"("channel");
CREATE INDEX IF NOT EXISTS "songs_youtube_video_id_idx" ON "songs"("youtube_video_id");
CREATE INDEX IF NOT EXISTS "songs_is_blocked_idx" ON "songs"("is_blocked");
CREATE INDEX IF NOT EXISTS "participants_session_id_role_idx" ON "participants"("session_id", "role");
CREATE INDEX IF NOT EXISTS "queue_items_song_id_status_idx" ON "queue_items"("song_id", "status");