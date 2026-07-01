import { NextResponse } from "next/server";
import { z } from "zod";
import { ParticipantService } from "@/services/participant.service";

const joinSchema = z.object({
  name: z.string().trim().min(1).max(80)
});

type Params = {
  params: Promise<{
    sessionCode: string;
  }>;
};

export async function POST(request: Request, { params }: Params) {
  const { sessionCode } = await params;
  const body = await request.json();
  const parsed = joinSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid participant name" }, { status: 400 });
  }

  const service = new ParticipantService();
  const result = await service.joinBySessionCode(sessionCode, parsed.data.name);

  return NextResponse.json(result, { status: 201 });
}