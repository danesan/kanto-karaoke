import { NextResponse } from "next/server";
import { AmbientPlaylistService } from "@/services/ambient-playlist.service";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get("sessionId") ?? url.searchParams.get("sessionCode") ?? "";

  if (!sessionId) {
    return NextResponse.json({ error: "Session not found" }, { status: 400 });
  }

  const service = new AmbientPlaylistService();
  const playlist = await service.active(sessionId);

  return NextResponse.json({ playlist });
}
