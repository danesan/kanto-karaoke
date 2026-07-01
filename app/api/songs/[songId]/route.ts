import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { SongService } from "@/services/song.service";

const schema = z.object({ sessionCode: z.string().min(1), displayTitle: z.string().max(180).nullable().optional() });

type Params = { params: Promise<{ songId: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { songId } = await params;
  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid song" }, { status: 400 });
  }

  await requireAdmin(parsed.data.sessionCode);
  const service = new SongService();
  const song = await service.update(songId, { displayTitle: parsed.data.displayTitle ?? null });

  return NextResponse.json({ song });
}
