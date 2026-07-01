import { NextResponse } from "next/server";
import { z } from "zod";
import { setAdminCookie } from "@/lib/admin-auth";
import { SessionService } from "@/services/session.service";

const loginSchema = z.object({
  sessionCode: z.string().trim().min(1),
  pin: z.string().trim().min(4).max(12)
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid login" }, { status: 400 });
  }

  const service = new SessionService();
  const ok = await service.validateAdminPin(parsed.data.sessionCode, parsed.data.pin);

  if (!ok) {
    return NextResponse.json({ error: "Invalid PIN" }, { status: 401 });
  }

  await setAdminCookie(parsed.data.sessionCode);
  return NextResponse.json({ ok: true });
}
