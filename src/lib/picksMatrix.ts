import { prisma } from "@/lib/prisma";

export type PicksMatrix = {
  players: { id: string; name: string }[];
  events: {
    id: string;
    name: string;
    dateLabel: string;
    winnerCompetitorId: string | null;
  }[];
  // cell[eventId][playerId] = { competitorName, correct } | undefined (no pick)
  cells: Record<string, Record<string, { competitorName: string; correct: boolean }>>;
};

export async function getPicksMatrix(): Promise<PicksMatrix> {
  const [players, events, picks] = await Promise.all([
    prisma.player.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.event.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, dateLabel: true, winnerCompetitorId: true },
    }),
    prisma.pick.findMany({
      include: { competitor: true },
    }),
  ]);

  const cells: PicksMatrix["cells"] = {};
  for (const event of events) cells[event.id] = {};

  const winnerByEvent = new Map(events.map((e) => [e.id, e.winnerCompetitorId]));
  for (const pick of picks) {
    const winnerId = winnerByEvent.get(pick.eventId);
    cells[pick.eventId][pick.playerId] = {
      competitorName: pick.competitor.name,
      correct: winnerId !== null && winnerId === pick.competitorId,
    };
  }

  return { players, events, cells };
}
