import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { SongService } from "@/services/song.service";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const sessionCode = url.searchParams.get("sessionCode") ?? "";
  await requireAdmin(sessionCode);

  const service = new SongService();
  const songs = await service.listCache(url.searchParams.get("q") ?? "");

  return NextResponse.json({ songs });
}
