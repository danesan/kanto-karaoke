import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
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

export async function GET(request: Request, { params }: Params) {
  const { sessionId } = await params;
  const url = new URL(request.url);
  const service = new QueueService();

  if (url.searchParams.get("admin") === "1") {
    await requireAdmin(sessionId);

    try {
      return NextResponse.json(await service.listAdminBySessionCode(sessionId));
    } catch {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }
  }

  const queue = await service.listBySessionKey(sessionId);
  return NextResponse.json({ queue });
}

export async function POST(request: Request, { params }: Params) {
  const { sessionId } = await params;
  const body = await request.json();
  const parsed = addQueueItemSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid queue item" }, { status: 400 });
  }

  await requireAdmin(sessionId);
  const service = new QueueService();
  const item = await service.addBySessionKey(sessionId, parsed.data.songId, parsed.data.singerName);

  return NextResponse.json({ item }, { status: 201 });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { sessionId } = await params;
  await requireAdmin(sessionId);
  const service = new QueueService();
  await service.clearBySessionKey(sessionId);

  return NextResponse.json({ ok: true });
}