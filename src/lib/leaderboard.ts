import { prisma } from "@/lib/prisma";
import { pointsIfCorrect, round2 } from "@/lib/scoring";

export type PlayerRow = {
  id: string;
  name: string;
  playingForMoney: boolean;
  tieBreakGuess: number | null;
  totalPoints: number;
  correctPicks: number;
  tieBreakDiff: number | null;
  pointsByEvent: Record<string, number>; // eventId -> points earned that event (0 if wrong/unpicked/unresolved)
};

export type LeaderboardData = {
  players: PlayerRow[];
  events: { id: string; name: string; dateLabel: string; sortOrder: number; resolved: boolean }[];
  actualTopScorer: number | null;
};

export async function getLeaderboardData(): Promise<LeaderboardData> {
  const [players, events, settings] = await Promise.all([
    prisma.player.findMany({
      include: { picks: { include: { competitor: true, event: true } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.event.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.settings.findUnique({ where: { id: 1 } }),
  ]);

  const actualTopScorer = settings?.actualTopScorer ?? null;

  const rows: PlayerRow[] = players.map((player) => {
    let totalPoints = 0;
    let correctPicks = 0;
    const pointsByEvent: Record<string, number> = {};

    for (const pick of player.picks) {
      const isWinner =
        pick.event.winnerCompetitorId !== null &&
        pick.event.winnerCompetitorId === pick.competitorId;
      const pts = isWinner
        ? round2(pointsIfCorrect(pick.competitor.decimalOdds, pick.event.weight))
        : 0;
      pointsByEvent[pick.eventId] = pts;
      if (isWinner) {
        totalPoints += pts;
        correctPicks += 1;
      }
    }

    const tieBreakDiff =
      player.tieBreakGuess !== null && actualTopScorer !== null
        ? Math.abs(player.tieBreakGuess - actualTopScorer)
        : null;

    return {
      id: player.id,
      name: player.name,
      playingForMoney: player.playingForMoney,
      tieBreakGuess: player.tieBreakGuess,
      totalPoints: round2(totalPoints),
      correctPicks,
      tieBreakDiff,
      pointsByEvent,
    };
  });

  rows.sort((a, b) => b.totalPoints - a.totalPoints);

  return {
    players: rows,
    events: events.map((e) => ({
      id: e.id,
      name: e.name,
      dateLabel: e.dateLabel,
      sortOrder: e.sortOrder,
      resolved: e.winnerCompetitorId !== null,
    })),
    actualTopScorer,
  };
}

// Cumulative running total per player, in chronological (event sortOrder) order.
export function buildCumulativeSeries(data: LeaderboardData) {
  return data.events.map((event) => {
    const point: Record<string, number | string> = { event: event.name, dateLabel: event.dateLabel };
    for (const player of data.players) {
      const priorEvents = data.events.filter((e) => e.sortOrder <= event.sortOrder);
      const runningTotal = priorEvents.reduce(
        (sum, e) => sum + (player.pointsByEvent[e.id] ?? 0),
        0
      );
      point[player.name] = round2(runningTotal);
    }
    return point;
  });
}
