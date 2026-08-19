// Picks lock 22 August 2026, 00:00 UK time (BST, UTC+1) - no changes after this.
export const LOCK_DATE = new Date("2026-08-22T00:00:00+01:00");

export function isLocked(now: Date = new Date()): boolean {
  return now.getTime() >= LOCK_DATE.getTime();
}
