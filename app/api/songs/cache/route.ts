import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { SongService } from "@/services/song.service";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const sessionCode = url.searchParams.get("sessionCode") ?? "";
  await requireAdmin(sessionCode);

  const page = Number(url.searchParams.get("page") ?? "1");
  const pageSize = Number(url.searchParams.get("pageSize") ?? "20");
  const service = new SongService();
  const cache = await service.listCache(
    url.searchParams.get("q") ?? "",
    Number.isFinite(page) ? page : 1,
    Number.isFinite(pageSize) ? pageSize : 20
  );

  return NextResponse.json(cache);
}
