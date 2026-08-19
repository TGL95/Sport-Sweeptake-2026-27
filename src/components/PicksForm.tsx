"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Competitor = {
  id: string;
  name: string;
  oddsFraction: string;
  pointsIfCorrect: number;
};

type EventData = {
  id: string;
  name: string;
  dateLabel: string;
  weight: number;
  hasWarning: boolean;
  competitors: Competitor[];
};

export default function PicksForm({ events }: { events: EventData[] }) {
  const [name, setName] = useState("");
  const [playingForMoney, setPlayingForMoney] = useState(false);
  const [tieBreakGuess, setTieBreakGuess] = useState("");
  const [picks, setPicks] = useState<Record<string, string>>({});
  const [lookupMsg, setLookupMsg] = useState<string | null>(null);
  const [submitState, setSubmitState] = useState<"idle" | "submitting" | "success" | "error">(
    "idle"
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const lookupTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (lookupTimer.current) clearTimeout(lookupTimer.current);
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      lookupTimer.current = setTimeout(() => setLookupMsg(null), 0);
      return;
    }
    lookupTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/players?name=${encodeURIComponent(trimmed)}`);
        const data = await res.json();
        if (data.found) {
          setPlayingForMoney(data.player.playingForMoney);
          setTieBreakGuess(
            data.player.tieBreakGuess !== null ? String(data.player.tieBreakGuess) : ""
          );
          const restored: Record<string, string> = {};
          for (const pick of data.player.picks) {
            restored[pick.eventId] = pick.competitorId;
          }
          setPicks(restored);
          setLookupMsg(`Welcome back, ${data.player.name} — editing your existing picks.`);
        } else {
          setLookupMsg(null);
        }
      } catch {
        // ignore lookup errors, non-critical
      }
    }, 500);
  }, [name]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    const trimmed = name.trim();
    if (!trimmed) {
      setErrorMsg("Enter your name to submit picks.");
      return;
    }

    const picksArray = Object.entries(picks)
      .filter(([, competitorId]) => competitorId)
      .map(([eventId, competitorId]) => ({ eventId, competitorId }));

    setSubmitState("submitting");
    try {
      const res = await fetch("/api/picks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmed,
          playingForMoney,
          tieBreakGuess: tieBreakGuess.trim() === "" ? null : Number(tieBreakGuess),
          picks: picksArray,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error ?? "Something went wrong. Try again.");
        setSubmitState("error");
        return;
      }
      setSubmitState("success");
    } catch {
      setErrorMsg("Network error - check your connection and try again.");
      setSubmitState("error");
    }
  }

  const pickedCount = Object.values(picks).filter(Boolean).length;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-300">Your name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Tom L"
            maxLength={60}
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
            required
          />
          {lookupMsg && <p className="mt-1 text-xs text-emerald-400">{lookupMsg}</p>}
          <p className="mt-1 text-xs text-slate-500">
            No repeat names — if this name is taken, try adding your surname.
          </p>
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={playingForMoney}
            onChange={(e) => setPlayingForMoney(e.target.checked)}
            className="h-4 w-4 rounded border-slate-700 bg-slate-950 accent-emerald-500"
          />
          Playing for money — £10 buy-in, paid to the organiser (winner takes the pot)
        </label>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-300">
            Tie-breaker: final Premier League Top Scorer&apos;s goal total
          </label>
          <input
            type="number"
            min={0}
            max={200}
            value={tieBreakGuess}
            onChange={(e) => setTieBreakGuess(e.target.value)}
            placeholder="e.g. 24"
            className="w-32 rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
          />
          <p className="mt-1 text-xs text-slate-500">
            No points from this — used only to break ties in the Money League.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Events ({pickedCount}/{events.length} picked)</h2>
      </div>

      <div className="space-y-3">
        {events.map((event) => (
          <div key={event.id} className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
            <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <h3 className="font-semibold text-white">{event.name}</h3>
              <span className="text-xs text-slate-500">{event.dateLabel}</span>
            </div>
            {event.weight !== 1 && (
              <div className="mb-2 flex flex-wrap gap-1.5">
                <span className="rounded-full bg-sky-500/15 px-2 py-0.5 text-xs text-sky-300">
                  {event.weight}× weight
                </span>
              </div>
            )}
            <select
              value={picks[event.id] ?? ""}
              onChange={(e) =>
                setPicks((prev) => ({ ...prev, [event.id]: e.target.value }))
              }
              className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
            >
              <option value="">— No pick —</option>
              {event.competitors.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.oddsFraction}) — {c.pointsIfCorrect} pts if correct
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {errorMsg && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
          {errorMsg}
        </div>
      )}
      {submitState === "success" && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300">
          Picks saved! You can come back and edit them (using the same name) until picks lock
          on 22 August 2026. Check the{" "}
          <Link href="/leaderboard" className="underline">Leaderboard</Link>.
        </div>
      )}

      <button
        type="submit"
        disabled={submitState === "submitting"}
        className="w-full rounded-md bg-emerald-500 px-4 py-3 font-semibold text-slate-950 transition-colors hover:bg-emerald-400 disabled:opacity-50"
      >
        {submitState === "submitting" ? "Saving..." : "Save My Picks"}
      </button>
    </form>
  );
}
