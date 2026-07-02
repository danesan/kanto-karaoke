import { NextResponse } from "next/server";
import { z } from "zod";
import { QueueService } from "@/services/queue.service";

const addGuestQueueItemSchema = z.object({
  songId: z.string().min(1),
  participantId: z.string().min(1),
  singerName: z.string().trim().min(1).max(80)
});

type Params = {
  params: Promise<{
    sessionCode: string;
  }>;
};

export async function GET(request: Request, { params }: Params) {
  const { sessionCode } = await params;
  const url = new URL(request.url);
  const participantId = url.searchParams.get("participantId");
  const service = new QueueService();

  if (participantId) {
    const queue = await service.listGuestBySessionCode(sessionCode, participantId);
    return NextResponse.json({ queue });
  }

  const queue = await service.listBySessionCode(sessionCode);
  return NextResponse.json({ queue });
}

export async function POST(request: Request, { params }: Params) {
  const { sessionCode } = await params;
  const body = await request.json();
  const parsed = addGuestQueueItemSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid queue item" }, { status: 400 });
  }

  const service = new QueueService();

  try {
    const item = await service.addForGuest(
      sessionCode,
      parsed.data.songId,
      parsed.data.participantId,
      parsed.data.singerName
    );

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not add song";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}