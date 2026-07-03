import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { PlaylistService } from "@/services/playlist.service";

const playlistTypeSchema = z.enum(["CUSTOM", "FAVORITES", "MOST_PLAYED", "GENRE", "AMBIENT"]);

const createSchema = z.object({
  sessionCode: z.string().min(1),
  name: z.string().trim().min(1).max(80),
  description: z.string().trim().max(240).optional().nullable(),
  type: playlistTypeSchema.default("CUSTOM"),
  genre: z.string().trim().max(80).optional().nullable(),
  enabled: z.boolean().optional()
});

const updateSchema = z.object({
  sessionCode: z.string().min(1),
  id: z.string().min(1),
  name: z.string().trim().min(1).max(80).optional(),
  description: z.string().trim().max(240).optional().nullable(),
  type: playlistTypeSchema.optional(),
  genre: z.string().trim().max(80).optional().nullable(),
  enabled: z.boolean().optional()
});

const deleteSchema = z.object({
  sessionCode: z.string().min(1),
  id: z.string().min(1)
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const sessionCode = url.searchParams.get("sessionCode") ?? "";
  await requireAdmin(sessionCode);

  const service = new PlaylistService();
  return NextResponse.json({ playlists: await service.list(sessionCode) });
}

export async function POST(request: Request) {
  const parsed = createSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid playlist" }, { status: 400 });
  }

  await requireAdmin(parsed.data.sessionCode);
  const service = new PlaylistService();
  const { sessionCode, ...input } = parsed.data;
  return NextResponse.json({ playlist: await service.create(sessionCode, input) }, { status: 201 });
}

export async function PATCH(request: Request) {
  const parsed = updateSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid playlist" }, { status: 400 });
  }

  await requireAdmin(parsed.data.sessionCode);
  const service = new PlaylistService();
  const { sessionCode, id, ...input } = parsed.data;
  return NextResponse.json({ playlist: await service.update(sessionCode, id, input) });
}

export async function DELETE(request: Request) {
  const parsed = deleteSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid playlist" }, { status: 400 });
  }

  await requireAdmin(parsed.data.sessionCode);
  const service = new PlaylistService();
  await service.delete(parsed.data.sessionCode, parsed.data.id);
  return NextResponse.json({ ok: true });
}
