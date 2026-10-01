//
//  fan.ts
//  d-exclaimation
//
//  Geometry for the dealt hand of project cards
//

/** Fan shape: angles in degrees, `fan` is the side-card scale, `lift` the centred card rise in %, `pivot` how far below a card it turns. */
export type Geo = {
  gap: number;
  step: number;
  extra: number;
  fan: number;
  lift: number;
  pivot: number;
};

export const DESKTOP: Geo = { gap: 9, step: 5, extra: 0.8, fan: 0.84, lift: 12, pivot: 0.6 };
export const PHONE: Geo = { gap: 7, step: 3, extra: 0.6, fan: 0.84, lift: 12, pivot: 0.6 };

/** Resting tilt of each card in the squared pile before the fan opens, in degrees. */
export const JITTER = [0, -2, 1.5, -1, 2.5, -1.5, 1, -2.5, 2];

/**
 * Where cards land when tossed onto the table before the shuffle: `x` in % of card width,
 * `y` in % of card height, `r` in degrees. Hand placed so the mess covers the table without
 * hinting at the fan; fixed so server and client render the same.
 */
export const SCATTER = [
  { x: -20, y: -6, r: -14 },
  { x: 95, y: -18, r: 22 },
  { x: -120, y: 12, r: -28 },
  { x: 40, y: 16, r: 9 },
  { x: -165, y: -14, r: 18 },
  { x: 150, y: 10, r: -16 },
  { x: -60, y: -22, r: 31 },
  { x: 120, y: -24, r: -7 },
  { x: -95, y: 20, r: 6 },
  { x: 10, y: 22, r: -24 },
  { x: 165, y: -4, r: 27 },
  { x: -140, y: -2, r: -9 },
];

/** How much of the table the scatter uses; phones keep it on screen. */
export const SCATTER_SPAN = { wide: { x: 1, y: 1, r: 1 }, narrow: { x: 0.32, y: 0.7, r: 0.8 } };

export const scatterOf = (i: number, g: Geo) => {
  const { x, y, r } = SCATTER[i % SCATTER.length];
  const span = g === PHONE ? SCATTER_SPAN.narrow : SCATTER_SPAN.wide;
  return { x: x * span.x, y: y * span.y, r: r * span.r };
};

/** Order cards are tossed in, so they don't land left to right. */
export const tossRank = (i: number, n: number) => (i * 7 + 3) % n;

/** Projects fill slots centre-out: 0, +1, -1, +2, -2, ... */
export const slotOf = (i: number) => (i === 0 ? 0 : i % 2 ? (i + 1) / 2 : -i / 2);
export const indexAt = (s: number) => (s === 0 ? 0 : s > 0 ? s * 2 - 1 : -s * 2);
export const bounds = (n: number) =>
  [-Math.floor((n - 1) / 2), Math.ceil((n - 1) / 2)] as const;

export const clamp = (p: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, p));

/** 1 for the centred card, falling to 0 one slot away. `t` is the card's slot minus the hand position. */
export const closeness = (t: number) => Math.max(0, 1 - Math.abs(t));

/** Centre-out stacking. */
export const zOf = (t: number) => 30 - Math.round(Math.abs(t) * 2);

/** Rotation of a card `t` slots from the centre. Cards past the 4th tuck under it. */
export function angle(t: number, g: Geo) {
  const a = Math.abs(t);
  const deg =
    a <= 1
      ? g.gap * a
      : a <= 4
        ? g.gap + (a - 1) * g.step
        : g.gap + 3 * g.step + (a - 4) * g.extra;
  return Math.sign(t) * deg;
}

/** Lets the hand be pulled a little past either end. */
export const rubber = (p: number, lo: number, hi: number) =>
  p < lo
    ? lo - Math.min(0.6, (lo - p) * 0.3)
    : p > hi
      ? hi + Math.min(0.6, (p - hi) * 0.3)
      : p;

/**
 * Which card sits under a point, ignoring hover lift so the target never moves under the cursor.
 * `dx` is px right of the pivot, `dy` px above it; `cards` excludes the centred one.
 */
export function hitTest(
  dx: number,
  dy: number,
  cards: { index: number; t: number }[],
  g: Geo,
  W: number,
  H: number
) {
  const half = (W * g.fan) / 2;
  const v0 = g.pivot * H;
  const v1 = v0 + g.fan * H;
  for (const c of [...cards].sort((a, b) => Math.abs(a.t) - Math.abs(b.t))) {
    const r = (angle(c.t, g) * Math.PI) / 180;
    const u = dx * Math.cos(r) - dy * Math.sin(r);
    const v = dx * Math.sin(r) + dy * Math.cos(r);
    if (Math.abs(u) <= half && v >= v0 && v <= v1) return c.index;
  }
  return null;
}
