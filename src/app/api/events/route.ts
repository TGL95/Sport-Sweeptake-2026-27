import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const maxDuration = 30;

export async function GET() {
  const events = await prisma.event.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      competitors: { orderBy: { sortOrder: "asc" } },
    },
  });
  return NextResponse.json(events);
}
