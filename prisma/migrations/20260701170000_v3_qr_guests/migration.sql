CREATE TYPE "ParticipantRole" AS ENUM ('ADMIN', 'GUEST');

ALTER TABLE "karaoke_sessions" ADD COLUMN "code" TEXT;
UPDATE "karaoke_sessions"
SET "code" = upper(substr(replace("id", '-', ''), 1, 6))
WHERE "code" IS NULL;
ALTER TABLE "karaoke_sessions" ALTER COLUMN "code" SET NOT NULL;
CREATE UNIQUE INDEX "karaoke_sessions_code_key" ON "karaoke_sessions"("code");

ALTER TABLE "participants" ADD COLUMN "role" "ParticipantRole" NOT NULL DEFAULT 'GUEST';
DROP INDEX IF EXISTS "participants_session_id_name_key";

ALTER TABLE "queue_items" ADD COLUMN "added_by_participant_id" TEXT;
UPDATE "queue_items" SET "added_by_participant_id" = "participant_id" WHERE "added_by_participant_id" IS NULL;
CREATE INDEX "queue_items_participant_id_idx" ON "queue_items"("participant_id");
CREATE INDEX "queue_items_added_by_participant_id_idx" ON "queue_items"("added_by_participant_id");