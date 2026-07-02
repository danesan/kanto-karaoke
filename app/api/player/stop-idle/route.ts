import { NextResponse } from "next/server";
import { z } from "zod";
import { PlayerEventService } from "@/services/player-event.service";

const schema = z.object({ sessionId: z.string().min(1) });

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid player event" }, { status: 400 });
  }

  const service = new PlayerEventService();
  return NextResponse.json(await service.stopIdle(parsed.data.sessionId));
}
