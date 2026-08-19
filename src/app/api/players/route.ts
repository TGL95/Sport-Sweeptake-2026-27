import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const maxDuration = 30;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name")?.trim();
  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const player = await prisma.player.findFirst({
    where: { name: { equals: name, mode: "insensitive" } },
    include: { picks: true },
  });

  if (!player) {
    return NextResponse.json({ found: false });
  }

  return NextResponse.json({
    found: true,
    player: {
      id: player.id,
      name: player.name,
      playingForMoney: player.playingForMoney,
      tieBreakGuess: player.tieBreakGuess,
      picks: player.picks.map((p) => ({ eventId: p.eventId, competitorId: p.competitorId })),
    },
  });
}
