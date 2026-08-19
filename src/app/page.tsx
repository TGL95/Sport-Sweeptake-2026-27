import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { isLocked, LOCK_DATE } from "@/lib/lock";
import { pointsIfCorrect, round2 } from "@/lib/scoring";
import PicksForm from "@/components/PicksForm";

export default async function MakePicksPage() {
  const events = await prisma.event.findMany({
    orderBy: { sortOrder: "asc" },
    include: { competitors: { orderBy: { sortOrder: "asc" } } },
  });

  const eventsForForm = events.map((e) => ({
    id: e.id,
    name: e.name,
    dateLabel: e.dateLabel,
    weight: e.weight,
    hasWarning: e.hasWarning,
    competitors: e.competitors.map((c) => ({
      id: c.id,
      name: c.name,
      oddsFraction: c.oddsFraction,
      pointsIfCorrect: round2(pointsIfCorrect(c.decimalOdds, e.weight)),
    })),
  }));

  const locked = isLocked();

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-white">Make Your Picks</h1>
        <p className="text-sm text-slate-400">
          Pick a winner in as many of the 21 events as you like — entirely free, no
          budget. Correct picks score{" "}
          <span className="font-mono text-emerald-400">√(decimal odds − 1) × weight</span>.
          Favourites score fewer points, long shots score more — a genuine outsider landing
          can be worth 15-25+ points.
        </p>
        <p className="text-sm text-slate-400">
          Picks lock at midnight on <strong className="text-white">22 August 2026</strong> —
          no changes after the season starts.
        </p>
      </header>

      {locked ? (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-amber-300">
          🔒 Picks locked on {LOCK_DATE.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}.
          No further changes can be made — check the{" "}
          <Link href="/leaderboard" className="underline">Leaderboard</Link>.
        </div>
      ) : (
        <PicksForm events={eventsForForm} />
      )}
    </div>
  );
}
