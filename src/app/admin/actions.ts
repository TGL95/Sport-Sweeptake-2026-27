"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

function revalidateAll() {
  revalidatePath("/admin");
  revalidatePath("/leaderboard");
  revalidatePath("/money");
  revalidatePath("/picks");
}

export async function setWinner(formData: FormData) {
  const eventId = String(formData.get("eventId") ?? "");
  const competitorIdRaw = String(formData.get("competitorId") ?? "");
  if (!eventId) return;

  await prisma.event.update({
    where: { id: eventId },
    data: { winnerCompetitorId: competitorIdRaw === "" ? null : competitorIdRaw },
  });

  revalidateAll();
}

export async function setTopScorer(formData: FormData) {
  const raw = String(formData.get("value") ?? "").trim();
  const value = raw === "" ? null : Number(raw);

  await prisma.settings.upsert({
    where: { id: 1 },
    update: { actualTopScorer: value },
    create: { id: 1, actualTopScorer: value },
  });

  revalidateAll();
}

export async function deletePlayer(formData: FormData) {
  const playerId = String(formData.get("playerId") ?? "");
  if (!playerId) return;

  await prisma.player.delete({ where: { id: playerId } });

  revalidateAll();
}
