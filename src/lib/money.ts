import { LeaderboardData, PlayerRow } from "@/lib/leaderboard";

const ENTRY_FEE = 10;

export type MoneyLeagueData = {
  players: PlayerRow[];
  entrants: number;
  pot: number;
  secondPlaceRefund: number;
  winnerTakes: number;
  winner: PlayerRow | null;
  secondPlace: PlayerRow | null;
  actualTopScorer: number | null;
};

// Ties on points are broken by whoever guessed closest to the real top-scorer tally.
// A player with no tie-break guess (or before the real number is known) sorts last among ties.
function compareForMoney(a: PlayerRow, b: PlayerRow): number {
  if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
  const aDiff = a.tieBreakDiff;
  const bDiff = b.tieBreakDiff;
  if (aDiff === null && bDiff === null) return 0;
  if (aDiff === null) return 1;
  if (bDiff === null) return -1;
  return aDiff - bDiff;
}

export function getMoneyLeagueData(data: LeaderboardData): MoneyLeagueData {
  const players = data.players.filter((p) => p.playingForMoney).sort(compareForMoney);
  const entrants = players.length;
  const pot = entrants * ENTRY_FEE;
  const secondPlaceRefund = entrants >= 2 ? ENTRY_FEE : 0;
  const winnerTakes = entrants === 0 ? 0 : pot - secondPlaceRefund;

  return {
    players,
    entrants,
    pot,
    secondPlaceRefund,
    winnerTakes,
    winner: players[0] ?? null,
    secondPlace: players[1] ?? null,
    actualTopScorer: data.actualTopScorer,
  };
}
