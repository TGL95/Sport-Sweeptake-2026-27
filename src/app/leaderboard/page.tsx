import { getLeaderboardData, buildCumulativeSeries } from "@/lib/leaderboard";
import CumulativeChart from "@/components/CumulativeChart";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const data = await getLeaderboardData();
  const series = buildCumulativeSeries(data);
  const playerNames = data.players.map((p) => p.name);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">Leaderboard</h1>
        <p className="text-sm text-slate-400">
          All players, ranked by total points. Points come from correctly picking
          underdogs — a favourite scores almost nothing, a big shock scores a lot.
        </p>
      </header>

      {data.players.length === 0 ? (
        <p className="text-slate-400">No picks submitted yet — be the first!</p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-slate-800">
            <table className="w-full text-sm">
              <thead className="bg-slate-900 text-left text-slate-400">
                <tr>
                  <th className="px-3 py-2 font-medium">#</th>
                  <th className="px-3 py-2 font-medium">Player</th>
                  <th className="px-3 py-2 font-medium">Paid?</th>
                  <th className="px-3 py-2 text-right font-medium">Points</th>
                  <th className="px-3 py-2 text-right font-medium">Correct Picks</th>
                </tr>
              </thead>
              <tbody>
                {data.players.map((p, i) => (
                  <tr key={p.id} className="border-t border-slate-800">
                    <td className="px-3 py-2 text-slate-400">
                      {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                    </td>
                    <td className="px-3 py-2 font-medium text-white">{p.name}</td>
                    <td className="px-3 py-2 text-slate-400">{p.playingForMoney ? "💷 Yes" : "Free"}</td>
                    <td className="px-3 py-2 text-right font-mono text-emerald-400">
                      {p.totalPoints.toFixed(2)}
                    </td>
                    <td className="px-3 py-2 text-right text-slate-300">{p.correctPicks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-semibold text-white">
              Cumulative Points Over the Season
            </h2>
            <CumulativeChart data={series} playerNames={playerNames} />
          </div>
        </>
      )}
    </div>
  );
}
