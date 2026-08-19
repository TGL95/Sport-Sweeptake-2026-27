import { prisma } from "@/lib/prisma";
import { pointsIfCorrect, round2 } from "@/lib/scoring";

export const dynamic = "force-dynamic";

export default async function OddsPage() {
  const events = await prisma.event.findMany({
    orderBy: { sortOrder: "asc" },
    include: { competitors: { orderBy: { sortOrder: "asc" } } },
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">📋 Odds &amp; Points</h1>
        <p className="text-sm text-slate-400">
          Every competitor in every event, with their odds and exactly what a correct pick
          is worth — all in one place, so you can plan your picks before committing on the{" "}
          Make Picks page.
        </p>
      </header>

      <div className="space-y-4">
        {events.map((event) => (
          <div key={event.id} className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
            <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <h3 className="font-semibold text-white">{event.name}</h3>
              <span className="text-xs text-slate-500">{event.dateLabel}</span>
            </div>
            {event.weight !== 1 && (
              <div className="mb-2">
                <span className="rounded-full bg-sky-500/15 px-2 py-0.5 text-xs text-sky-300">
                  {event.weight}× weight
                </span>
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-slate-500">
                  <tr>
                    <th className="py-1 pr-3 font-medium">Competitor</th>
                    <th className="py-1 pr-3 font-medium">Odds</th>
                    <th className="py-1 text-right font-medium">Points if Correct</th>
                  </tr>
                </thead>
                <tbody>
                  {event.competitors.map((c) => (
                    <tr key={c.id} className="border-t border-slate-800/60">
                      <td className="py-1 pr-3 text-white">{c.name}</td>
                      <td className="py-1 pr-3 text-slate-400">{c.oddsFraction}</td>
                      <td className="py-1 text-right font-mono text-emerald-400">
                        {round2(pointsIfCorrect(c.decimalOdds, event.weight))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
