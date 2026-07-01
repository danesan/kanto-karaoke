import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { SongService } from "@/services/song.service";

const schema = z.object({ sessionCode: z.string().min(1), days: z.number().int().min(1).max(365).optional() });

export async function DELETE(request: Request) {
  const body = await request.json().catch(() => ({}));
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid cleanup" }, { status: 400 });
  }

  await requireAdmin(parsed.data.sessionCode);
  const service = new SongService();
  const result = await service.deleteOld(parsed.data.days ?? 30);

  return NextResponse.json({ result });
}
