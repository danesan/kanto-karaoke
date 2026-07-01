import { NextResponse } from "next/server";
import { QueueService } from "@/services/queue.service";

type Params = {
  params: Promise<{
    sessionId: string;
  }>;
};

export async function POST(_request: Request, { params }: Params) {
  const { sessionId } = await params;
  const service = new QueueService();
  const item = await service.nextBySessionKey(sessionId);

  return NextResponse.json({ item });
}