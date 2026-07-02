CREATE TYPE "PlayerMode" AS ENUM ('KARAOKE', 'COUNTDOWN', 'IDLE');

ALTER TABLE "karaoke_sessions"
  ADD COLUMN "countdown_seconds" INTEGER NOT NULL DEFAULT 10,
  ADD COLUMN "idle_mode_enabled" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "show_countdown" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "show_next_songs" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "show_qr_code" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "player_mode" "PlayerMode" NOT NULL DEFAULT 'KARAOKE',
  ADD COLUMN "countdown_started_at" TIMESTAMP(3),
  ADD COLUMN "countdown_ends_at" TIMESTAMP(3),
  ADD COLUMN "countdown_target_queue_item_id" TEXT,
  ADD COLUMN "ambient_playlist_id" TEXT;

CREATE TABLE "performances" (
  "id" TEXT NOT NULL,
  "queue_item_id" TEXT NOT NULL,
  "session_id" TEXT NOT NULL,
  "participant_id" TEXT NOT NULL,
  "song_id" TEXT NOT NULL,
  "started_at" TIMESTAMP(3),
  "finished_at" TIMESTAMP(3) NOT NULL,
  "duration_seconds" INTEGER,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "performances_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ambient_playlists" (
  "id" TEXT NOT NULL,
  "session_id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ambient_playlists_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ambient_playlist_items" (
  "id" TEXT NOT NULL,
  "playlist_id" TEXT NOT NULL,
  "song_id" TEXT NOT NULL,
  "position" INTEGER NOT NULL,
  CONSTRAINT "ambient_playlist_items_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "performances_queue_item_id_key" ON "performances"("queue_item_id");
CREATE INDEX "performances_session_id_finished_at_idx" ON "performances"("session_id", "finished_at");
CREATE INDEX "performances_participant_id_idx" ON "performances"("participant_id");
CREATE INDEX "performances_song_id_idx" ON "performances"("song_id");
CREATE INDEX "ambient_playlists_session_id_idx" ON "ambient_playlists"("session_id");
CREATE INDEX "ambient_playlists_session_id_enabled_idx" ON "ambient_playlists"("session_id", "enabled");
CREATE UNIQUE INDEX "ambient_playlist_items_playlist_id_song_id_key" ON "ambient_playlist_items"("playlist_id", "song_id");
CREATE INDEX "ambient_playlist_items_playlist_id_position_idx" ON "ambient_playlist_items"("playlist_id", "position");

ALTER TABLE "performances" ADD CONSTRAINT "performances_queue_item_id_fkey" FOREIGN KEY ("queue_item_id") REFERENCES "queue_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "performances" ADD CONSTRAINT "performances_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "karaoke_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "performances" ADD CONSTRAINT "performances_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "participants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "performances" ADD CONSTRAINT "performances_song_id_fkey" FOREIGN KEY ("song_id") REFERENCES "songs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ambient_playlists" ADD CONSTRAINT "ambient_playlists_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "karaoke_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ambient_playlist_items" ADD CONSTRAINT "ambient_playlist_items_playlist_id_fkey" FOREIGN KEY ("playlist_id") REFERENCES "ambient_playlists"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ambient_playlist_items" ADD CONSTRAINT "ambient_playlist_items_song_id_fkey" FOREIGN KEY ("song_id") REFERENCES "songs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "karaoke_sessions" ADD CONSTRAINT "karaoke_sessions_ambient_playlist_id_fkey" FOREIGN KEY ("ambient_playlist_id") REFERENCES "ambient_playlists"("id") ON DELETE SET NULL ON UPDATE CASCADE;
