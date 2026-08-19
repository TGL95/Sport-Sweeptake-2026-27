import { NextResponse } from "next/server";
import { getPicksMatrix } from "@/lib/picksMatrix";

export const maxDuration = 30;

function csvEscape(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET() {
  const { players, events, cells } = await getPicksMatrix();

  const header = ["Event", "Date", ...players.map((p) => p.name)];
  const rows = events.map((event) => {
    const row = [event.name, event.dateLabel];
    for (const player of players) {
      const cell = cells[event.id]?.[player.id];
      row.push(cell ? cell.competitorName : "");
    }
    return row;
  });

  const csv = [header, ...rows]
    .map((row) => row.map(csvEscape).join(","))
    .join("\r\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="sport-sweepstake-picks-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
