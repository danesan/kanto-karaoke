import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { AmbientPlaylistService } from "@/services/ambient-playlist.service";

const createSchema = z.object({
  sessionCode: z.string().min(1),
  name: z.string().trim().min(1).max(80)
});

const updateSchema = z.object({
  sessionCode: z.string().min(1),
  id: z.string().min(1),
  name: z.string().trim().min(1).max(80).optional(),
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

  const service = new AmbientPlaylistService();
  return NextResponse.json({ playlists: await service.list(sessionCode) });
}

export async function POST(request: Request) {
  const parsed = createSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid ambient playlist" }, { status: 400 });
  }

  await requireAdmin(parsed.data.sessionCode);
  const service = new AmbientPlaylistService();
  return NextResponse.json({ playlist: await service.create(parsed.data.sessionCode, parsed.data.name) }, { status: 201 });
}

export async function PATCH(request: Request) {
  const parsed = updateSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid ambient playlist" }, { status: 400 });
  }

  await requireAdmin(parsed.data.sessionCode);
  const service = new AmbientPlaylistService();
  return NextResponse.json({ playlist: await service.update(parsed.data.sessionCode, parsed.data.id, parsed.data) });
}

export async function DELETE(request: Request) {
  const parsed = deleteSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid ambient playlist" }, { status: 400 });
  }

  await requireAdmin(parsed.data.sessionCode);
  const service = new AmbientPlaylistService();
  await service.delete(parsed.data.sessionCode, parsed.data.id);
  return NextResponse.json({ ok: true });
}
