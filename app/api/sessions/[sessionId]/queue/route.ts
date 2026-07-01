import { NextResponse } from "next/server";
import { z } from "zod";
import { QueueService } from "@/services/queue.service";

type Params = {
  params: Promise<{
    sessionId: string;
  }>;
};

const addQueueItemSchema = z.object({
  songId: z.string().min(1),
  singerName: z.string().trim().min(1).max(80)
});

export async function GET(_request: Request, { params }: Params) {
  const { sessionId } = await params;
  const service = new QueueService();
  const queue = await service.list(sessionId);

  return NextResponse.json({ queue });
}

export async function POST(request: Request, { params }: Params) {
  const { sessionId } = await params;
  const body = await request.json();
  const parsed = addQueueItemSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid queue item" }, { status: 400 });
  }

  const service = new QueueService();
  const item = await service.add(sessionId, parsed.data.songId, parsed.data.singerName);

  return NextResponse.json({ item }, { status: 201 });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { sessionId } = await params;
  const service = new QueueService();
  await service.clear(sessionId);

  return NextResponse.json({ ok: true });
}