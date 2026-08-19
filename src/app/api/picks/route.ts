import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isLocked } from "@/lib/lock";

const bodySchema = z.object({
  name: z.string().trim().min(1).max(60),
  playingForMoney: z.boolean(),
  tieBreakGuess: z.number().int().min(0).max(200).nullable(),
  picks: z.array(
    z.object({
      eventId: z.string().min(1),
      competitorId: z.string().min(1),
    })
  ),
});

export async function POST(request: Request) {
  if (isLocked()) {
    return NextResponse.json(
      { error: "Picks are locked - the season has started." },
      { status: 403 }
    );
  }

  const json = await request.json();
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }
  const { name, playingForMoney, tieBreakGuess, picks } = parsed.data;

  // Validate every pick references a real competitor belonging to the stated event.
  const competitorIds = picks.map((p) => p.competitorId);
  const competitors = await prisma.competitor.findMany({
    where: { id: { in: competitorIds } },
    select: { id: true, eventId: true },
  });
  const competitorById = new Map(competitors.map((c) => [c.id, c.eventId]));
  for (const pick of picks) {
    if (competitorById.get(pick.competitorId) !== pick.eventId) {
      return NextResponse.json({ error: "Invalid pick submitted." }, { status: 400 });
    }
  }

  const existing = await prisma.player.findFirst({
    where: { name: { equals: name, mode: "insensitive" } },
  });

  try {
    const player = await prisma.$transaction(async (tx) => {
      const p = existing
        ? await tx.player.update({
            where: { id: existing.id },
            data: { playingForMoney, tieBreakGuess },
          })
        : await tx.player.create({
            data: { name, playingForMoney, tieBreakGuess },
          });

      await tx.pick.deleteMany({ where: { playerId: p.id } });
      if (picks.length > 0) {
        await tx.pick.createMany({
          data: picks.map((pk) => ({
            playerId: p.id,
            eventId: pk.eventId,
            competitorId: pk.competitorId,
          })),
        });
      }
      return p;
    });

    return NextResponse.json({ success: true, playerId: player.id });
  } catch {
    return NextResponse.json(
      { error: "That name is already taken. Try a more unique name (e.g. add your surname)." },
      { status: 409 }
    );
  }
}
