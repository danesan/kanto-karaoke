import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { AmbientPlaylistService } from "@/services/ambient-playlist.service";

const addSchema = z.object({
  sessionCode: z.string().min(1),
  playlistId: z.string().min(1),
  songId: z.string().min(1)
});

const removeSchema = z.object({
  sessionCode: z.string().min(1),
  playlistId: z.string().min(1),
  itemId: z.string().min(1)
});

export async function POST(request: Request) {
  const parsed = addSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid ambient playlist item" }, { status: 400 });
  }

  await requireAdmin(parsed.data.sessionCode);
  const service = new AmbientPlaylistService();
  const playlist = await service.addItem(parsed.data.sessionCode, parsed.data.playlistId, parsed.data.songId);

  return NextResponse.json({ playlist }, { status: 201 });
}

export async function DELETE(request: Request) {
  const parsed = removeSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid ambient playlist item" }, { status: 400 });
  }

  await requireAdmin(parsed.data.sessionCode);
  const service = new AmbientPlaylistService();
  const playlist = await service.removeItem(parsed.data.sessionCode, parsed.data.playlistId, parsed.data.itemId);

  return NextResponse.json({ playlist });
}
