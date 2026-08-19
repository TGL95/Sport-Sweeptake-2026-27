import { prisma } from "@/lib/prisma";
import { setWinner, setTopScorer } from "./actions";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function AdminPage() {
  const [events, settings, playerCount] = await Promise.all([
    prisma.event.findMany({
      orderBy: { sortOrder: "asc" },
      include: { competitors: { orderBy: { sortOrder: "asc" } } },
    }),
    prisma.settings.findUnique({ where: { id: 1 } }),
    prisma.player.count(),
  ]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">⚙️ Admin</h1>
        <p className="text-sm text-slate-400">
          Mark each event&apos;s actual winner to auto-score every player&apos;s pick. This
          page is unlisted - don&apos;t share the link. {playerCount} player
          {playerCount === 1 ? "" : "s"} {playerCount === 1 ? "has" : "have"} submitted picks
          so far.
        </p>
      </header>

      <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
        <h2 className="mb-2 font-semibold text-white">
          Tie-breaker: actual Premier League Top Scorer goal total
        </h2>
        <form action={setTopScorer} className="flex gap-2">
          <input
            key={settings?.actualTopScorer ?? "none"}
            type="number"
            name="value"
            min={0}
            max={200}
            defaultValue={settings?.actualTopScorer ?? ""}
            placeholder="e.g. 24"
            className="w-32 rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-md bg-emerald-500 px-4 py-2 font-semibold text-slate-950 hover:bg-emerald-400"
          >
            Save
          </button>
        </form>
      </div>

      <div className="space-y-3">
        {events.map((event) => (
          <div key={event.id} className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
            <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <h3 className="font-semibold text-white">{event.name}</h3>
              <span className="text-xs text-slate-500">{event.dateLabel}</span>
            </div>
            <form action={setWinner} className="flex gap-2">
              <input type="hidden" name="eventId" value={event.id} />
              <select
                key={event.winnerCompetitorId ?? "none"}
                name="competitorId"
                defaultValue={event.winnerCompetitorId ?? ""}
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="">Not yet decided</option>
                {event.competitors.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.oddsFraction})
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="shrink-0 rounded-md bg-emerald-500 px-4 py-2 font-semibold text-slate-950 hover:bg-emerald-400"
              >
                Save
              </button>
            </form>
            {event.winnerCompetitorId && (
              <p className="mt-2 text-xs text-emerald-400">
                ✓ Winner set:{" "}
                {event.competitors.find((c) => c.id === event.winnerCompetitorId)?.name}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
