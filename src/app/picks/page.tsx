import { isLocked, LOCK_DATE } from "@/lib/lock";
import { getPicksMatrix } from "@/lib/picksMatrix";

export const dynamic = "force-dynamic";

export default async function AllPicksPage() {
  const locked = isLocked();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">🔍 All Picks</h1>
        <p className="text-sm text-slate-400">
          See what everyone picked, event by event. Hidden until picks lock so nobody can
          copy anyone else&apos;s bets.
        </p>
      </header>

      {!locked ? (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-amber-300">
          🔒 Picks are hidden until the season starts on{" "}
          {LOCK_DATE.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}.
          Check back after that to see everyone&apos;s picks.
        </div>
      ) : (
        <AllPicksTable />
      )}
    </div>
  );
}

async function AllPicksTable() {
  const { players, events, cells } = await getPicksMatrix();

  if (players.length === 0) {
    return <p className="text-slate-400">No picks were submitted this season.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-800">
      <table className="w-full text-sm">
        <thead className="bg-slate-900 text-left text-slate-400">
          <tr>
            <th className="sticky left-0 z-10 bg-slate-900 px-3 py-2 font-medium">Event</th>
            {players.map((p) => (
              <th key={p.id} className="whitespace-nowrap px-3 py-2 font-medium">
                {p.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr key={event.id} className="border-t border-slate-800">
              <td className="sticky left-0 z-10 bg-slate-950 px-3 py-2 font-medium text-white">
                {event.name}
              </td>
              {players.map((p) => {
                const cell = cells[event.id]?.[p.id];
                return (
                  <td
                    key={p.id}
                    className={`whitespace-nowrap px-3 py-2 ${
                      cell?.correct ? "text-emerald-400" : "text-slate-300"
                    }`}
                  >
                    {cell ? (cell.correct ? `✓ ${cell.competitorName}` : cell.competitorName) : "—"}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
