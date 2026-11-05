//
//  commander.ts
//  d-exclaimation
//
//  Mage Table's board, laid out the way its own table does it: your creatures and lands along the front, the three other seats smaller across the back with
//  lines between them, and your hand fanned at the side. Once it's set, the turn goes round and each seat swings in
//

import type { Blueprint, Section } from "./engine";
import { Mesh, type Vec3 } from "./mesh";

/** Construct units per card height, which is the table's own unit. */
const U = 170;
const CARD_W = 63 / 88;
/** How far the table turns clockwise, as Mage Table leans it. */
const LEAN = (7 * Math.PI) / 180;
/** How much of a card shows past the next in a row of lands, and of creatures. */
const TIGHT_LAND = 0.15;
const TIGHT_CARD = 0.4;
/** Seconds each seat has the turn for. */
const TURN = 2.4;
const SEATS = 4;

const smooth = (t: number) => {
  const k = Math.min(1, Math.max(0, t));
  return k * k * (3 - 2 * k);
};

/** From Mage Table's table units, x across and z towards you, to the construct's, with the lean. */
const world = (x: number, z: number): [number, number] => {
  const [c, s] = [Math.cos(LEAN), Math.sin(LEAN)];
  return [(x * c - z * s) * U, -(x * s + z * c) * U];
};

/** How far into its attack a seat's creature is: forward and tapped on its turn, back and straight up after. */
const swing = (seconds: number, seat: number) => {
  const into = (((seconds - seat * TURN) % (TURN * SEATS)) + TURN * SEATS) % (TURN * SEATS);
  return smooth((into - 0.4) / 0.35) * (1 - smooth((into - TURN + 0.4) / 0.35));
};

type Row = { z: number; s: number; centre: number; cards: { tapped?: boolean; attacks?: boolean }[]; tight: number };

/** A flat slab over four corners on the table, from `z0` up to `z1`. */
function slab(M: Mesh, corners: [number, number][], z0: number, z1: number) {
  const lo = corners.map(([x, y]): Vec3 => [x, y, z0]);
  const hi = corners.map(([x, y]): Vec3 => [x, y, z1]);
  M.quad(hi[0], hi[3], hi[2], hi[1], [0, 0, 1]);
  M.quad(lo[0], lo[1], lo[2], lo[3], [0, 0, -1]);
  for (let i = 0; i < 4; i++) {
    const [p, q] = [i, (i + 1) % 4];
    const n: Vec3 = [hi[q][1] - hi[p][1], hi[p][0] - hi[q][0], 0];
    const len = Math.hypot(n[0], n[1]);
    M.quad(lo[p], hi[p], hi[q], lo[q], [-n[0] / len, -n[1] / len, 0]);
  }
}

/** How tall an agent sits, in construct units. */
const AGENT = 250;
const BLUE = 5;
/** Clawd's own terracotta, which the page keeps for him. */
const CLAY = 9;

/** A shape's outline traced off its SVG path, a loop for each piece of it, in the path's own units. */
function traced(d: string): [number, number][][] {
  const space = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(space, "svg");
  const path = document.createElementNS(space, "path");
  path.setAttribute("d", d);
  svg.appendChild(path);
  svg.style.position = "absolute";
  svg.style.width = svg.style.height = "0";
  document.body.appendChild(svg);
  const total = path.getTotalLength();
  const loops: [number, number][][] = [[]];
  let last: DOMPoint | null = null;
  for (let at = 0; at <= total; at += 0.12) {
    const p = path.getPointAtLength(at);
    if (last && Math.hypot(p.x - last.x, p.y - last.y) > 0.5) loops.push([]);
    loops[loops.length - 1].push([p.x, p.y]);
    last = p;
  }
  svg.remove();
  return loops.filter((loop) => loop.length > 3);
}

/** Triangles filling a loop that goes round anticlockwise, an ear at a time. */
function fill(loop: [number, number][]): [number, number][][] {
  const left = [...loop];
  const out: [number, number][][] = [];
  const turn = (a: number[], b: number[], c: number[]) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
  let guard = left.length * left.length;
  while (left.length > 3 && guard-- > 0) {
    const i = left.findIndex((b, k) => {
      const a = left[(k + left.length - 1) % left.length];
      const c = left[(k + 1) % left.length];
      return turn(a, b, c) > 1e-9 && !left.some((p) => p !== a && p !== b && p !== c && turn(a, b, p) >= 0 && turn(b, c, p) >= 0 && turn(c, a, p) >= 0);
    });
    if (i < 0) break;
    out.push([left[(i + left.length - 1) % left.length], left[i], left[(i + 1) % left.length]]);
    left.splice(i, 1);
  }
  if (left.length === 3) out.push(left);
  return out;
}

/** A flat shape given depth, out of the page toward -y, from `front` back to `back`, as (x, up) pairs going round anticlockwise. */
function extrude(M: Mesh, loop: [number, number][], front: number, back: number) {
  for (let i = 0; i < loop.length; i++) {
    const [a, b] = [loop[i], loop[(i + 1) % loop.length]];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const out: Vec3 = [(b[1] - a[1]) / len, 0, -(b[0] - a[0]) / len];
    M.quad([a[0], front, a[1]], [a[0], back, a[1]], [b[0], back, b[1]], [b[0], front, b[1]], out);
  }
  for (const [a, b, c] of fill(loop)) {
    M.quad([a[0], front, a[1]], [b[0], front, b[1]], [c[0], front, c[1]], [c[0], front, c[1]], [0, -1, 0]);
    M.quad([a[0], back, a[1]], [c[0], back, c[1]], [b[0], back, b[1]], [b[0], back, b[1]], [0, 1, 0]);
  }
}

/** Mark coordinates, y down, into an agent's: across, and up from where it sits, `per` units to one of the mark's. */
const placed = (loop: [number, number][], per: number, middle: number, bottom: number) => {
  const out = loop.map(([x, y]): [number, number] => [(x - middle) * per, (bottom - y) * per]);
  const area = out.reduce((sum, [x, y], i) => sum + x * out[(i + 1) % out.length][1] - out[(i + 1) % out.length][0] * y, 0);
  return area < 0 ? out.reverse() : out;
};

/** Clawd, Claude Code's: its body, arms and four legs as the blocks its mark is drawn in, in its own terracotta, with its eyes inked in. */
function clawd(M: Mesh) {
  const per = AGENT / 15;
  const block = (x0: number, y0: number, x1: number, y1: number, deep: number) => extrude(M, placed([[x0, y0], [x1, y0], [x1, y1], [x0, y1]], per, 12, 20), -deep * per, deep * per);
  M.paint = CLAY;
  block(3, 5, 21, 17.08, 5);
  block(0, 10.95, 3, 14.05, 2.5);
  block(21, 10.95, 24, 14.05, 2.5);
  for (const x of [3, 6, 15, 18]) {
    for (const z of [-3.5, 3.5]) {
      const legs = placed([[x, 17.08], [x + 1.5, 17.08], [x + 1.5, 20], [x, 20]], per, 12, 20);
      extrude(M, legs, (z - 1) * per, (z + 1) * per);
    }
  }
  M.paint = 0;
  M.ink = true;
  for (const x of [6, 16.51]) extrude(M, placed([[x, 8.1], [x + 1.49, 8.1], [x + 1.49, 10.95], [x, 10.95]], per, 12, 20), -5 * per - 2, -5 * per + 2);
  M.ink = false;
}

/** Codex's cloud, traced off its mark, in blue, with its prompt standing out of it in paper. */
function codex(M: Mesh) {
  const loops = traced(CODEX);
  const per = AGENT / 18.5;
  const [cloud, ...prompt] = loops.sort((a, b) => b.length - a.length);
  M.paint = BLUE;
  extrude(M, placed(cloud, per, 12, 21.2), -4 * per, 4 * per);
  M.paint = 0;
  for (const glyph of prompt) extrude(M, placed(glyph, per, 12, 21.2), -4 * per - 4, -4 * per + 1);
}

/** Grok Bot: a ball in ink with its two eyes, the slanted capsules of its mark, standing out of it in paper. */
function grokbot(M: Mesh) {
  const r = AGENT / 2;
  const per = r / 10.3;
  M.ink = true;
  M.lathe(
    { origin: [0, 0, 0], along: [0, 0, 1], u: [1, 0, 0], v: [0, 1, 0] },
    Array.from({ length: 17 }, (_, i): [number, number] => [r * Math.sin((i / 16) * Math.PI), r * (1 - Math.cos((i / 16) * Math.PI))]),
    40
  );
  M.ink = false;
  // Each eye's ends on the mark, and how thick it is, laid onto the front of the ball. The mark has it glancing up and off to its right, so the ball's
  // turned round and down until it's looking out over the table
  const [turn, nod] = [-0.42, 0.32];
  const onBall = ([x, y]: [number, number]): Vec3 => {
    const [dx, dz] = [(x - 12) * per, (12 - y) * per];
    const dy = -Math.sqrt(Math.max(0, r * r - dx * dx - dz * dz)) - 2;
    const [tx, ty] = [dx * Math.cos(turn) - dy * Math.sin(turn), dx * Math.sin(turn) + dy * Math.cos(turn)];
    return [tx, ty * Math.cos(nod) - dz * Math.sin(nod), ty * Math.sin(nod) + dz * Math.cos(nod) + r];
  };
  for (const [a, b, thick] of [[[11.6, 6.7], [14.6, 10.5], 0.95], [[16.4, 4.6], [19.2, 8.3], 0.6]] as [[number, number], [number, number], number][]) {
    M.tube(Array.from({ length: 6 }, (_, i) => onBall([a[0] + ((b[0] - a[0]) * i) / 5, a[1] + ((b[1] - a[1]) * i) / 5])), thick * per, 12);
  }
}

/** Codex's mark, its cloud with the prompt cut out of it (from LobeHub's icon set, codex-color.svg). */
const CODEX =
  "M9.064 3.344a4.578 4.578 0 012.285-.312c1 .115 1.891.54 2.673 1.275.01.01.024.017.037.021a.09.09 0 00.043 0 4.55 4.55 0 013.046.275l.047.022.116.057a4.581 4.581 0 012.188 2.399c.209.51.313 1.041.315 1.595a4.24 4.24 0 01-.134 1.223.123.123 0 00.03.115c.594.607.988 1.33 1.183 2.17.289 1.425-.007 2.71-.887 3.854l-.136.166a4.548 4.548 0 01-2.201 1.388.123.123 0 00-.081.076c-.191.551-.383 1.023-.74 1.494-.9 1.187-2.222 1.846-3.711 1.838-1.187-.006-2.239-.44-3.157-1.302a.107.107 0 00-.105-.024c-.388.125-.78.143-1.204.138a4.441 4.441 0 01-1.945-.466 4.544 4.544 0 01-1.61-1.335c-.152-.202-.303-.392-.414-.617a5.81 5.81 0 01-.37-.961 4.582 4.582 0 01-.014-2.298.124.124 0 00.006-.056.085.085 0 00-.027-.048 4.467 4.467 0 01-1.034-1.651 3.896 3.896 0 01-.251-1.192 5.189 5.189 0 01.141-1.6c.337-1.112.982-1.985 1.933-2.618.212-.141.413-.251.601-.33.215-.089.43-.164.646-.227a.098.098 0 00.065-.066 4.51 4.51 0 01.829-1.615 4.535 4.535 0 011.837-1.388zm3.482 10.565a.637.637 0 000 1.272h3.636a.637.637 0 100-1.272h-3.636zM8.462 9.23a.637.637 0 00-1.106.631l1.272 2.224-1.266 2.136a.636.636 0 101.095.649l1.454-2.455a.636.636 0 00.005-.64L8.462 9.23z";

export function commander(): Blueprint {
  const M = new Mesh();
  const sections: Section[] = [];
  const part = (rank: number, offset: Vec3, rest: Partial<Section> = {}) => {
    M.section = sections.length;
    M.ink = false;
    M.paint = 0;
    sections.push({ offset, rank, ...rest });
  };

  /** A card lying on the table at a centre in table units, tapped sideways or not, with its art and name bar showing. */
  const card = (x: number, z: number, s: number, tapped: boolean, lift: number) => {
    const face = (dx: number, dz: number, w: number, h: number, up: number, thick: number) => {
      // Tapped cards are turned a quarter clockwise about the card's middle
      const at = (u: number, v: number) => (tapped ? world(x - v, z + u) : world(x + u, z + v));
      slab(M, [at(dx - w / 2, dz - h / 2), at(dx + w / 2, dz - h / 2), at(dx + w / 2, dz + h / 2), at(dx - w / 2, dz + h / 2)], up, up + thick);
    };
    const w = CARD_W * s;
    face(0, 0, w, s, lift, 3);
    face(0, -0.1 * s, w * 0.84, 0.42 * s, lift + 3, 1.5);
    M.ink = true;
    face(0, -0.4 * s, w * 0.84, 0.06 * s, lift + 3, 1.5);
    M.ink = false;
    face(0, 0.27 * s, w * 0.84, 0.22 * s, lift + 3, 1.5);
  };

  /** A row laid out as Mage Table lays it: each card overlapping the last by its row's tightness, tapped ones apart, centred on its seat. */
  const row = (seat: number, rank: number, { z, s, centre, cards, tight }: Row, forward: number) => {
    const w = CARD_W * s;
    const size = (tapped?: boolean) => (tapped ? s : w);
    const gaps = cards.slice(0, -1).map((c, i) => (!!c.tapped === !!cards[i + 1].tapped ? size(c.tapped) * tight : (size(c.tapped) + size(cards[i + 1].tapped)) / 2 + 0.1 * s));
    const span = gaps.reduce((a, b) => a + b, 0) + (size(cards[0].tapped) + size(cards[cards.length - 1].tapped)) / 2;
    let x = centre - span / 2 + size(cards[0].tapped) / 2;
    cards.forEach((c, i) => {
      const [px, py] = world(x, z);
      const [fx, fy] = world(x, z + forward);
      const attack = (seconds: number) => {
        const k = swing(seconds, seat);
        return { angle: (-k * Math.PI) / 2, offset: [(fx - px) * k, (fy - py) * k, 0] as Vec3 };
      };
      part(rank + i * 0.05, [0, 0, 260], c.attacks ? { upright: true, pivot: [px, py], idle: attack } : {});
      card(x, z, s, !!c.tapped, 2 + i * 0.8);
      x += gaps[i] ?? 0;
    });
  };

  // The table, and the lines Mage Table draws across it between the seats
  const [left, right, top, bottom] = [-3.3, 3.7, -1.65, 2.3];
  part(0, [0, 0, -200]);
  slab(M, [world(left, top), world(right, top), world(right, bottom), world(left, bottom)], -24, 0);
  part(0.4, [0, 0, 120]);
  M.ink = true;
  const line = (x0: number, z0: number, x1: number, z1: number) => {
    const [a, b] = [world(x0, z0), world(x1, z1)];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const [nx, ny] = [(-(b[1] - a[1]) / len) * 2.5, ((b[0] - a[0]) / len) * 2.5];
    M.quad([a[0] - nx, a[1] - ny, 0.5], [b[0] - nx, b[1] - ny, 0.5], [b[0] + nx, b[1] + ny, 0.5], [a[0] + nx, a[1] + ny, 0.5], [0, 0, 1]);
  };
  const third = (2.7 - left) / 3;
  line(left, 0, right, 0);
  line(left + third, top, left + third, 0);
  line(left + third * 2, top, left + third * 2, 0);
  M.ink = false;

  // Your side: creatures up front, lands behind them tucked under each other
  row(0, 1, { z: 0.6, s: 1, centre: -0.3, tight: TIGHT_CARD, cards: [{ attacks: true }, { attacks: true }, {}, { tapped: true }] }, -0.22);
  row(0, 1.4, { z: 1.62, s: 1, centre: -0.4, tight: TIGHT_LAND, cards: [{}, {}, {}, {}, {}, { tapped: true }, { tapped: true }] }, 0);

  // The other three, smaller, across the back in the order the turn goes
  const opponent = (seat: number, centre: number, creatures: Row["cards"], lands: Row["cards"]) => {
    row(seat, 1.8 + seat * 0.25, { z: -0.49, s: 0.66, centre, tight: TIGHT_CARD, cards: creatures }, 0.16);
    row(seat, 1.9 + seat * 0.25, { z: -1.17, s: 0.66, centre, tight: TIGHT_LAND, cards: lands }, 0);
  };
  opponent(1, left + third * 0.5, [{ attacks: true }, {}, {}], [{}, {}, {}, {}, { tapped: true }]);
  opponent(2, left + third * 1.5, [{ attacks: true }, { attacks: true }], [{}, {}, {}, {}, {}, {}]);
  opponent(3, left + third * 2.5, [{ attacks: true }, {}, {}, {}], [{}, {}, {}, { tapped: true }, { tapped: true }]);

  // Your hand, fanned out at the right
  part(3, [300, 0, 200]);
  for (let i = 0; i < 5; i++) {
    const a = (i - 2) * 0.16;
    const [cx, cz] = [3.0 + Math.sin(a) * 1.6, 1.95 - Math.cos(a) * 0.35 + 0.35];
    const [c, s] = [Math.cos(a), Math.sin(a)];
    const at = (u: number, v: number) => world(cx + u * c - v * s, cz + u * s + v * c);
    const lift = 14 + i * 4;
    const [w, h] = [CARD_W * 0.42, 0.5];
    slab(M, [at(-w, -h), at(w, -h), at(w, h), at(-w, h)], lift, lift + 3);
    M.ink = true;
    slab(M, [at(-w * 0.84, -h * 0.86), at(w * 0.84, -h * 0.86), at(w * 0.84, -h * 0.76), at(-w * 0.84, -h * 0.76)], lift + 3, lift + 4.5);
    M.ink = false;
  }

  // The three agents playing it, each sat behind its seat across the back, in the order the turn goes: Clawd, Codex and Grok Bot, each its own mark
  // given depth. Whoever's turn it is comes up off its seat as it swings in
  const AGENTS = [clawd, codex, grokbot];
  AGENTS.forEach((agent, n) => {
    const seat = n + 1;
    const [x, y] = world(left + third * (n + 0.5) + (n === 2 ? 0.3 : 0), top - 0.95);
    part(3.4 + n * 0.25, [0, 220, 260], { idle: (seconds) => ({ offset: [0, 0, 30 * swing(seconds, seat) + 3 * Math.sin(seconds * 1.4 + n)] }) });
    const from = M.positions.length / 3;
    agent(M);
    // Built facing straight out of the page, then turned with the table and sat down behind it
    const [c, s] = [Math.cos(-LEAN), Math.sin(-LEAN)];
    for (let i = from * 3; i < M.positions.length; i += 3) {
      const [px, py] = [M.positions[i], M.positions[i + 1]];
      M.positions[i] = px * c - py * s + x;
      M.positions[i + 1] = px * s + py * c + y;
      M.positions[i + 2] -= AGENT * 0.3;
      const [nx, ny] = [M.normals[i], M.normals[i + 1]];
      M.normals[i] = nx * c - ny * s;
      M.normals[i + 1] = nx * s + ny * c;
    }
  });

  return {
    mesh: M,
    sections,
    camera: { yaw: 0.12, pitch: 0.75 },
    pace: { spread: 0.7, form: 1.1, start: 2, stagger: 0.45, move: 0.5 },
    light: [-0.5, -0.46, 0.72],
    hatch: 4.5,
    grains: 180_000,
    flow: 0.7,
    loop: false,
  };
}
