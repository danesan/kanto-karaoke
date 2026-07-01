import { NextResponse } from "next/server";
import { SessionService } from "@/services/session.service";

type Params = {
  params: Promise<{
    sessionId: string;
  }>;
};

export async function GET(_request: Request, { params }: Params) {
  const { sessionId } = await params;
  const service = new SessionService();
  const session = await service.get(sessionId);

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  return NextResponse.json({ session });
}