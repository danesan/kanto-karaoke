# Kanto

Kanto is a web karaoke queue manager built with Next.js App Router, TypeScript, Prisma, Supabase PostgreSQL/Realtime, React Query and the official YouTube IFrame Player API.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env
```

3. Fill in:

- `DATABASE_URL`: Supabase/PostgreSQL connection string.
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon key.
- `NEXT_PUBLIC_APP_URL`: public application URL used by the TV QR Code, for example `http://localhost:3000` locally or the Vercel URL in production.
- `YOUTUBE_API_KEY`: YouTube Data API v3 key for search only.

4. Generate Prisma client and migrate:

```bash
npm run prisma:generate
npm run prisma:migrate
```

5. Start development server:

```bash
npm run dev
```

## Realtime

Enable Supabase Realtime for the `queue_items` table. Control, player and guest screens subscribe to queue changes and invalidate React Query automatically.

## Routes

- `/`: create or join an admin session.
- `/session/[sessionId]/control`: admin control screen. Admin can search, add singers, reorder, skip, clear and remove any queue item.
- `/player/[sessionCode]`: TV player with QR Code pointing to `/join/[sessionCode]`.
- `/join/[sessionCode]`: guest entry form.
- `/guest/[sessionCode]`: guest screen for searching songs, adding to queue and seeing realtime queue updates.

## Guest permissions

Guests are stored as `participants.role = GUEST`. Queue items store `added_by_participant_id`, so a guest can remove only songs they added, even when the singer name is different.

## YouTube policy

The app uses the YouTube Data API v3 only for search and metadata caching. Playback is performed exclusively through the official YouTube IFrame Player API.