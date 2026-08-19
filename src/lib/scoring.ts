// Points if a pick is correct: sqrt(decimal odds - 1) x event weight.
// A heavy favourite scores almost nothing; a huge outsider can score 15-25+ points.
export function pointsIfCorrect(decimalOdds: number, weight: number): number {
  return Math.sqrt(decimalOdds - 1) * weight;
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
