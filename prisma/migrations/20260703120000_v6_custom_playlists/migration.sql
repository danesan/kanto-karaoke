CREATE TYPE "PlaylistType" AS ENUM ('CUSTOM', 'FAVORITES', 'MOST_PLAYED', 'GENRE', 'AMBIENT');

ALTER TABLE "ambient_playlists"
  ADD COLUMN "description" TEXT,
  ADD COLUMN "type" "PlaylistType" NOT NULL DEFAULT 'AMBIENT',
  ADD COLUMN "genre" TEXT,
  ADD COLUMN "is_system" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX "ambient_playlists_session_id_type_idx" ON "ambient_playlists"("session_id", "type");
