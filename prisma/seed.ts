import { PrismaClient } from "@prisma/client";
import events from "./data/events.json";

const prisma = new PrismaClient();

async function main() {
  await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });

  for (let i = 0; i < events.length; i++) {
    const ev = events[i];

    const existing = await prisma.event.findFirst({ where: { name: ev.name } });
    if (existing) {
      console.log(`Skipping existing event: ${ev.name}`);
      continue;
    }

    await prisma.event.create({
      data: {
        name: ev.name,
        dateLabel: ev.dateLabel,
        weight: ev.weight,
        hasWarning: ev.hasWarning,
        sortOrder: i,
        competitors: {
          create: ev.competitors.map((c, j) => ({
            name: c.name,
            oddsFraction: c.oddsFraction,
            decimalOdds: c.decimalOdds,
            sortOrder: j,
          })),
        },
      },
    });
    console.log(`Created event: ${ev.name} (${ev.competitors.length} competitors)`);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
