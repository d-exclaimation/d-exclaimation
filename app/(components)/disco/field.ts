//
//  field.ts
//  d-exclaimation
//
//  Disco tile field, ported from Partly Capture's disco trail
//

import type { Ramp } from "@/(common)/glow";

const CELL = 16;
const GAP = 2;
const CREST = 260;
const TRAIL = 330;
const RISE = 140;
const FADE = 700;
export const TRAVEL = 2200;
export const END = TRAVEL + FADE;

const RAMP: Ramp = [
  [76, 29, 149],
  [124, 58, 237],
  [167, 139, 250],
  [216, 180, 254],
  [250, 245, 255],
];

const lerp = (a: number, b: number, f: number) => a + (b - a) * f;

/** Colour at brightness `b` (0 to 1) along `ramps[0]`, blended towards `ramps[1]` by `mix`. */
const shade = (
  b: number,
  a: number,
  ramps: readonly [Ramp, Ramp] = [RAMP, RAMP],
  mix = 0
) => {
  const t = Math.min(0.999, Math.max(0, b)) * (RAMP.length - 1);
  const i = Math.floor(t);
  const f = t - i;
  const at = (ramp: Ramp, n: number) =>
    lerp(ramp[i][n], (ramp[i + 1] ?? ramp[i])[n], f);
  const ch = (n: number) =>
    Math.round(lerp(at(ramps[0], n), at(ramps[1], n), mix));
  return `rgba(${ch(0)},${ch(1)},${ch(2)},${a})`;
};

const smooth = (x: number) => x * x * (3 - 2 * x);

/** Distance falloff: 1 at the origin, 0 at `reach`. */
const falloff = (d: number, reach: number) =>
  1 - Math.pow(Math.min(1, d / reach), 1.4);

/** Draws one tile: a base square, then the face inset by the gap so the gap reads as grid lines. */
function tile(
  ctx: CanvasRenderingContext2D,
  px: number,
  py: number,
  cell: number,
  base: string,
  face: string
) {
  const gap = (cell * GAP) / CELL;
  ctx.fillStyle = base;
  ctx.fillRect(px, py, cell, cell);
  ctx.fillStyle = face;
  ctx.fillRect(px, py, cell - gap, cell - gap);
}

/** Sizes the backing store to the element at up to 2x density and draws in CSS pixels. */
export function fitCanvas(el: HTMLCanvasElement) {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const w = el.clientWidth;
  const h = el.clientHeight;
  if (el.width !== Math.round(w * dpr) || el.height !== Math.round(h * dpr)) {
    el.width = w * dpr;
    el.height = h * dpr;
    el.getContext("2d")?.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  return { w, h };
}

/** One frame of the ripple: a ring spreading from `origin` with fading echoes behind it. */
export function drawField(
  ctx: CanvasRenderingContext2D,
  size: { w: number; h: number },
  origin: { x: number; y: number },
  reach: number,
  t: number,
  fade: boolean,
  { cell = CELL, fadeAt = TRAVEL }: { cell?: number; fadeAt?: number } = {}
) {
  const { w, h } = size;
  ctx.clearRect(0, 0, w, h);
  const out = fade ? 1 - Math.max(0, (t - fadeAt) / FADE) : 1;
  const front = (t / TRAVEL) * reach;
  for (let px = 0; px < w; px += cell) {
    for (let py = 0; py < h; py += cell) {
      const d = Math.hypot(px + cell / 2 - origin.x, py + cell / 2 - origin.y);
      const behind = front - d;
      if (behind < 0) continue;
      const fall =
        falloff(d, reach) * out * smooth(Math.min(1, behind / RISE));
      if (fall <= 0.02) continue;
      const wave =
        Math.max(0, Math.cos((behind / CREST) * Math.PI * 2)) *
        Math.exp(-behind / TRAIL);
      const lit = fall * (0.2 + wave * 0.8);
      tile(
        ctx,
        px,
        py,
        cell,
        shade(0.05, fall * 0.5),
        shade(lit, Math.min(0.8, lit * 1.15))
      );
    }
  }
}

/**
 * The settled field without any ripple: tiles fading away from `origin`,
 * coloured from `ramps[0]` on the left to `ramps[1]` on the right.
 */
export function drawTiles(
  ctx: CanvasRenderingContext2D,
  size: { w: number; h: number },
  origin: { x: number; y: number },
  reach: number,
  ramps: readonly [Ramp, Ramp],
  { cell = CELL, strength = 1 }: { cell?: number; strength?: number } = {}
) {
  const { w, h } = size;
  ctx.clearRect(0, 0, w, h);
  for (let px = 0; px < w; px += cell) {
    for (let py = 0; py < h; py += cell) {
      const d = Math.hypot(px + cell / 2 - origin.x, py + cell / 2 - origin.y);
      const fall = falloff(d, reach) * strength;
      if (fall <= 0.02) continue;
      const mix = px / w;
      tile(
        ctx,
        px,
        py,
        cell,
        shade(0.3, fall * 0.35, ramps, mix),
        shade(0.5, fall * 0.5, ramps, mix)
      );
    }
  }
}
