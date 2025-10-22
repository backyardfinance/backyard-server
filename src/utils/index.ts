export * from './exception-filter';

export const startOfHour = (d = new Date()): Date => {
  const copy = new Date(d);
  copy.setUTCMinutes(0, 0, 0);
  return copy;
};

export const toNum = (v: unknown, fallback = 0): number => {
  if (v === null || v === undefined) return fallback;
  const n = typeof v === 'string' ? Number(v) : (v as number);
  return Number.isFinite(n) ? n : fallback;
};
