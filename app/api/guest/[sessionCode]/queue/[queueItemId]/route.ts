import { NextResponse } from "next/server";
import { z } from "zod";
import { QueueService } from "@/services/queue.service";

const removeOwnSchema = z.object({
  participantId: z.string().min(1)
});

type Params = {
  params: Promise<{
    queueItemId: string;
  }>;
};

export async function DELETE(request: Request, { params }: Params) {
  const { queueItemId } = await params;
  const body = await request.json();
  const parsed = removeOwnSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid participant" }, { status: 400 });
  }

  const service = new QueueService();
  const item = await service.removeOwn(queueItemId, parsed.data.participantId);

  if (!item) {
    return NextResponse.json({ error: "Queue item not found" }, { status: 404 });
  }

  return NextResponse.json({ item });
}