import { NextResponse } from "next/server";
import { SessionService } from "@/services/session.service";

type Params = {
  params: Promise<{
    sessionCode: string;
  }>;
};

export async function GET(_request: Request, { params }: Params) {
  const { sessionCode } = await params;
  const service = new SessionService();
  const session = await service.getByCode(sessionCode);

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  return NextResponse.json({ session });
}