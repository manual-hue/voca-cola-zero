export function getKSTDate(): Date {
  return new Date(Date.now() + 9 * 60 * 60 * 1000);
}

export function getTodayKey(): string {
  const kst = getKSTDate();
  const y = kst.getUTCFullYear();
  const m = String(kst.getUTCMonth() + 1).padStart(2, "0");
  const d = String(kst.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getDayOfYear(): number {
  const kst = getKSTDate();
  const start = new Date(Date.UTC(kst.getUTCFullYear(), 0, 0));
  return Math.floor((kst.getTime() - start.getTime()) / 86400000);
}
