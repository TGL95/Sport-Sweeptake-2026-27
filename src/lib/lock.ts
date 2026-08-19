// Picks lock at kickoff of the Premier League's opening match of the season -
// Arsenal v Coventry City, Friday 21 August 2026, 20:00 BST. No changes after this.
export const LOCK_DATE = new Date("2026-08-21T20:00:00+01:00");

export function isLocked(now: Date = new Date()): boolean {
  return now.getTime() >= LOCK_DATE.getTime();
}

export function formatLockDate(): string {
  return LOCK_DATE.toLocaleString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Europe/London",
  });
}
