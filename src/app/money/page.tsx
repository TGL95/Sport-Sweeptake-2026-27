import Link from "next/link";
import { getLeaderboardData } from "@/lib/leaderboard";
import { getMoneyLeagueData } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function MoneyLeaguePage() {
  const lbData = await getLeaderboardData();
  const money = getMoneyLeagueData(lbData);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">💷 Money League</h1>
        <p className="text-sm text-slate-400">
          Only players who opted into the £10 buy-in appear here. Winner takes the pot,
          minus £10 refunded to 2nd place. Ties are broken by whoever guessed closest to
          the real Premier League Top Scorer&apos;s goal tally.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Paid Entrants" value={String(money.entrants)} />
        <StatCard label="Total Pot" value={`£${money.pot}`} />
        <StatCard label="2nd Place Refund" value={`£${money.secondPlaceRefund}`} />
        <StatCard label="Winner Takes" value={`£${money.winnerTakes}`} accent />
      </div>

      {money.entrants === 0 ? (
        <p className="text-slate-400">
          Nobody has opted in for money yet. Tick &quot;Playing for money&quot; on the{" "}
          <Link href="/" className="text-emerald-400 underline">Make Picks</Link> page to join.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-900 text-left text-slate-400">
              <tr>
                <th className="px-3 py-2 font-medium">#</th>
                <th className="px-3 py-2 font-medium">Player</th>
                <th className="px-3 py-2 text-right font-medium">Points</th>
                <th className="px-3 py-2 text-right font-medium">Correct Picks</th>
                <th className="px-3 py-2 text-right font-medium">Tie-Break Guess</th>
                <th className="px-3 py-2 text-right font-medium">Tie-Break Diff</th>
              </tr>
            </thead>
            <tbody>
              {money.players.map((p, i) => (
                <tr key={p.id} className="border-t border-slate-800">
                  <td className="px-3 py-2 text-slate-400">
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                  </td>
                  <td className="px-3 py-2 font-medium text-white">{p.name}</td>
                  <td className="px-3 py-2 text-right font-mono text-emerald-400">
                    {p.totalPoints.toFixed(2)}
                  </td>
                  <td className="px-3 py-2 text-right text-slate-300">{p.correctPicks}</td>
                  <td className="px-3 py-2 text-right text-slate-300">
                    {p.tieBreakGuess ?? "—"}
                  </td>
                  <td className="px-3 py-2 text-right text-slate-300">
                    {p.tieBreakDiff ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 text-sm text-slate-400">
        <p>
          <span className="text-white">Winner:</span>{" "}
          {money.winner ? `${money.winner.name} — takes £${money.winnerTakes}` : "—"}
        </p>
        <p>
          <span className="text-white">2nd place:</span>{" "}
          {money.secondPlace
            ? `${money.secondPlace.name} — gets their £${money.secondPlaceRefund} entry fee back`
            : "—"}
        </p>
        <p className="mt-2">
          Real Top Scorer tally:{" "}
          {money.actualTopScorer !== null ? money.actualTopScorer : "not entered yet"}
        </p>
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`text-xl font-bold ${accent ? "text-emerald-400" : "text-white"}`}>
        {value}
      </p>
    </div>
  );
}
