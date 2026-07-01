import { NextResponse } from "next/server";
import { z } from "zod";
import { clearAdminCookie } from "@/lib/admin-auth";

const logoutSchema = z.object({
  sessionCode: z.string().trim().min(1)
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = logoutSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid logout" }, { status: 400 });
  }

  await clearAdminCookie(parsed.data.sessionCode);
  return NextResponse.json({ ok: true });
}
