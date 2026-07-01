import { NextResponse } from "next/server";
import { z } from "zod";
import { SearchService } from "@/services/search.service";

const searchSchema = z.object({
  q: z.string().min(2)
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = searchSchema.safeParse({ q: url.searchParams.get("q") });

  if (!parsed.success) {
    return NextResponse.json({ error: "Search term is required" }, { status: 400 });
  }

  const service = new SearchService();
  const songs = await service.search(parsed.data.q);

  return NextResponse.json({ songs });
}
