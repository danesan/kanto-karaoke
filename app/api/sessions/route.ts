import { NextResponse } from "next/server";
import { z } from "zod";
import { SessionService } from "@/services/session.service";

const createSessionSchema = z.object({
  name: z.string().trim().min(2).max(80)
});

export async function GET() {
  const service = new SessionService();
  const sessions = await service.list();

  return NextResponse.json({ sessions });
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = createSessionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid session name" }, { status: 400 });
  }

  const service = new SessionService();
  const session = await service.create(parsed.data.name);

  return NextResponse.json({ session }, { status: 201 });
}
