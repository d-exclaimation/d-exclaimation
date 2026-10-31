//
//  repair.ts
//  d-exclaimation
//
//  Interpreter, the hexagon behind Partly Repair AI: a chunky rounded hex bolt head with two six-lobed eyes screwed into it
//

import type { Blueprint, Section } from "./engine";
import { Mesh, TAU, axis, type Vec3 } from "./mesh";

type Flat = [number, number];

const SIZE = 240;
const ROUND = 74;
const HALF = 84;
const BEVEL = 16;
const EYE = 53;
const EYES: Flat[] = [
  [-122, 0],
  [4, 0],
];
const SIXTH = TAU / 6;
const COS30 = Math.cos(Math.PI / 6);
const FORWARD: Vec3 = [1, 0, 0];
const polar = (r: number, a: number): Flat => [r * Math.cos(a), r * Math.sin(a)];
const smooth = (t: number) => {
  const k = Math.min(1, Math.max(0, t));
  return k * k * (3 - 2 * k);
};

/** One side of the hexagon pulled in by `inset`: half a corner, the straight, then half the next corner. */
function side(k: number, inset: number): Flat[] {
  const corner = (c: number, angle: number): Flat => {
    const [cy, cz] = polar(SIZE - ROUND / COS30, c * SIXTH);
    const [y, z] = polar(ROUND - inset, angle);
    return [cy + y, cz + z];
  };
  const [ay, az] = corner(k, (k + 0.5) * SIXTH);
  const [by, bz] = corner(k + 1, (k + 0.5) * SIXTH);
  return [
    ...Array.from({ length: 6 }, (_, i) => corner(k, (k + i / 10) * SIXTH)),
    ...Array.from({ length: 7 }, (_, i): Flat => [ay + ((by - ay) * (i + 1)) / 8, az + ((bz - az) * (i + 1)) / 8]),
    ...Array.from({ length: 6 }, (_, i) => corner(k + 1, (k + 0.5 + i / 10) * SIXTH)),
  ];
}

const outline = (inset: number) => Array.from({ length: 6 }, (_, k) => side(k, inset).slice(0, -1)).flat();
const at = (x: number, points: Flat[]) => points.map(([y, z]): Vec3 => [x, y, z]);

/** A six-lobed shape, the socket of a Torx bolt: broad lobes, tight valleys, and one lobe straight up. */
const lobes = (r: number, [cy, cz]: Flat = [0, 0]) =>
  Array.from({ length: 120 }, (_, i): Flat => {
    const a = (i / 120) * TAU;
    const [y, z] = polar(r * (0.76 + 0.24 * Math.pow((1 + Math.cos(6 * (a - TAU / 4))) / 2, 0.7)), a);
    return [cy + y, cz + z];
  });

/** A solid with the same section all the way along, capped at both ends. */
function prism(M: Mesh, edge: Flat[], x0: number, x1: number) {
  M.thin = true;
  M.skin([x0, x1].map((x) => at(x, [...edge, edge[0]])));
  M.fan(at(x0, edge), [-1, 0, 0]);
  M.fan(at(x1, edge), [1, 0, 0]);
  M.thin = false;
}

/** Eyes shut for a moment every few seconds, starting just after it wakes. */
const blink = (seconds: number) => {
  const shut = (seconds + 3.1) % 3.6;
  return shut < 0.18 ? Math.max(0.08, Math.abs(shut - 0.09) / 0.09) : 1;
};

/** Looks across at the viewer now and then, before going back to how Partly draws it. */
const glance = (seconds: number) => {
  const beat = seconds % 7.2;
  return 64 * smooth((beat - 1.2) / 0.25) * (1 - smooth((beat - 3.1) / 0.25));
};

export function repair(): Blueprint {
  const M = new Mesh();
  const sections: Section[] = [];
  const part = (rank: number, offset: Vec3 = [0, 0, 0], rest: Partial<Section> = {}) => {
    M.section = sections.length;
    M.ink = false;
    sections.push({ offset, rank, ...rest });
  };

  // The core it is all built around
  part(0, [0, 0, 0], { spin: 3 });
  prism(M, lobes(84), -56, 56);
  M.lathe(axis([-40, 0, 0], FORWARD), [[150, 0], [170, 0], [170, 80], [150, 80], [150, 0]]);
  for (let s = 0; s < 6; s++) {
    const [y0, z0] = polar(72, (s + 0.5) * SIXTH);
    const [y1, z1] = polar(150, (s + 0.5) * SIXTH);
    M.tube([[0, y0, z0], [0, y1, z1]], 7, 8);
  }

  // Back plate, with the posts the core sits on
  part(0.3, [-460, 0, 0]);
  M.thin = true;
  M.fan(at(-HALF, outline(BEVEL)), [-1, 0, 0]);
  M.thin = false;
  for (let s = 0; s < 6; s++) {
    const [y, z] = polar(186, s * SIXTH);
    M.tube([[-HALF, y, z], [-30, y, z]], 9, 10);
  }

  // Six walls closing in around the sides, each rounded over at the front and back
  for (let k = 0; k < 6; k++) {
    const [y, z] = polar(380, (k + 0.5) * SIXTH);
    part(1 + k * 0.05, [0, y, z]);
    M.thin = true;
    const profile: [number, number][] = [[BEVEL, -HALF], [9, -80], [3, -71], [0, -56], [0, 56], [3, 71], [9, 80], [BEVEL, HALF]];
    M.skin(profile.map(([inset, x]) => at(x, side(k, inset))));
    M.thin = false;
  }

  // The black face
  part(2, [800, 0, 0]);
  M.ink = true;
  M.fan(at(HALF, outline(BEVEL)), FORWARD);

  // The eyes fly in last and screw home, half a turn each
  EYES.forEach(([y, z], n) => {
    part(2.4 + n * 0.1, [1220, 0, 90 - n * 180], {
      turn: TAU / 2,
      pivot: [y, z],
      idle: (seconds) => ({ squash: blink(seconds), offset: [0, glance(seconds), 0] }),
    });
    prism(M, lobes(EYE, [y, z]), HALF - 2, HALF + 3);
  });

  return {
    mesh: M,
    sections,
    camera: { yaw: Math.PI - 1.05, pitch: 0.3 },
    pace: { spread: 0.7, form: 1.1, start: 2, stagger: 0.8, move: 0.5 },
    light: [0.86, 0.22, 0.46],
    hatch: 4.5,
    grains: 140_000,
    flow: 0.7,
    loop: false,
  };
}
