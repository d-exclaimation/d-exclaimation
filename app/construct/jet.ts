//
//  jet.ts
//  d-exclaimation
//
//  The core of an afterburning turbofan: fan, compressor, combustor, turbines, augmentor and nozzle
//

import type { Blueprint, Section } from "./engine";
import { Mesh, RAD, TAU, axis, type Vec3 } from "./mesh";

const FORWARD: Vec3 = [1, 0, 0];
const SPIN = 7;
const centre = (x: number) => axis([x, 0, 0], FORWARD);
const onRing = (r: number, a: number): [number, number] => [r * Math.cos(a), r * Math.sin(a)];

/** A ring of twisted blades. */
function blades(M: Mesh, x: number, hub: number, tip: number, count: number, chord: number, twist: number) {
  M.thin = true;
  for (let n = 0; n < count; n++) {
    const a = (n / count) * TAU;
    M.skin(
      Array.from({ length: 6 }, (_, s) => {
        const r = hub + ((tip - hub) * s) / 5;
        return Array.from({ length: 3 }, (_, c) => {
          const along = (c / 2 - 0.5) * chord;
          const [y, z] = onRing(r, a + (twist * s) / 5 + (along / r) * 0.9);
          return [x + along, y, z] as Vec3;
        });
      })
    );
  }
  M.thin = false;
}

/** A bladed stage: the disc, its rim, and the blades on it. */
function stage(M: Mesh, x: number, hub: number, tip: number, count: number, chord: number, twist: number) {
  const w = chord * 0.62;
  M.lathe(centre(x - w), [[26, 0], [hub - 12, 0], [hub - 12, w * 0.5], [hub, w * 0.5], [hub, w * 1.5], [hub - 12, w * 1.5], [hub - 12, w * 2], [26, w * 2]]);
  blades(M, x, hub, tip, count, chord, twist);
}

/** Part of a casing, wrapped from a0 to a1 so the side facing the camera stays open. */
function shell(M: Mesh, profile: [number, number][], a0: number, a1: number) {
  M.thin = true;
  M.skin(
    profile.map(([r, x]) =>
      Array.from({ length: 49 }, (_, j) => {
        const [y, z] = onRing(r, a1 - ((a1 - a0) * j) / 48);
        return [x, y, z] as Vec3;
      })
    )
  );
  M.thin = false;
}

export function jet(): Blueprint {
  const M = new Mesh();
  const sections: Section[] = [];
  const part = (rank: number, [x, y, z]: Vec3 = [0, 0, 0], spin = 0) => {
    M.section = sections.length;
    M.ink = false;
    sections.push({ offset: [x, y, z], rank, spin });
  };
  const OPEN_FROM = 150 * RAD;
  const OPEN_TO = 382 * RAD;

  // Combustor at the heart of it, then the shaft through the middle
  part(0);
  M.lathe(centre(0), [[96, 338], [134, 346], [142, 372], [134, 414], [100, 424]].map(([r, x]): [number, number] => [r, x]));
  M.ink = true;
  M.lathe(centre(0), [[58, 340], [90, 340], [90, 424], [58, 424]]);
  for (let f = 0; f < 22; f++) {
    const a = (f / 22) * TAU;
    M.ink = true;
    const [y, z] = onRing(118, a);
    M.lathe(axis([339, y, z], FORWARD), [[0.5, 0], [8, 0], [8, 4]], 12);
    M.ink = false;
    const [oy, oz] = onRing(162, a);
    const [iy, iz] = onRing(120, a);
    M.tube([[372, oy, oz], [352, oy * 0.86, oz * 0.86], [340, iy, iz]], 2.6, 7);
  }
  part(0.2, [0, 0, 0], SPIN);
  M.lathe(centre(30), [[0.5, 0], [26, 0], [26, 520], [0.5, 520]]);

  // Six compressor stages, tightening toward the combustor
  [[318, 84, 102], [286, 80, 106], [254, 75, 110], [222, 70, 114], [190, 65, 118], [158, 60, 122]].forEach(([x, hub, tip], n) => {
    part(1 + n * 0.05, [-96 - n * 96, 0, 0], SPIN);
    stage(M, x, hub, tip, 40 - n * 2, 19, 0.42);
    M.lathe(centre(x - 25), [[hub - 16, 0], [hub - 10, 0], [hub - 10, 12], [hub - 16, 12]]);
  });

  // High and low pressure turbines just behind the fire
  part(1.05, [110, 0, 0]);
  blades(M, 432, 100, 124, 44, 14, -0.1);
  part(1.1, [200, 0, 0], SPIN);
  stage(M, 454, 88, 124, 58, 22, -0.5);
  part(1.2, [290, 0, 0]);
  blades(M, 480, 92, 136, 40, 16, 0.15);
  part(1.25, [380, 0, 0], SPIN);
  stage(M, 504, 84, 142, 54, 26, -0.6);

  // Three fan stages at the front
  [[108, 50, 150, 22, 0.7], [66, 48, 166, 20, 0.75], [20, 44, 178, 16, 0.85]].forEach(([x, hub, tip, count, twist], n) => {
    part(1.6 + n * 0.1, [-690 - n * 120, 0, 0], SPIN);
    stage(M, x, hub, tip, count, 34, twist);
  });
  part(1.9, [-1060, 0, 0], SPIN);
  M.lathe(centre(-44), [[0.5, 0], [18, 14], [36, 44], [44, 74], [26, 74]]);

  // Augmentor: spray bars and flame holders behind the turbine
  part(2.1, [500, 0, 0]);
  M.lathe(centre(536), [[58, 0], [66, 0], [58, 12], [50, 12]]);
  M.lathe(centre(536), [[104, 0], [112, 0], [104, 12], [96, 12]]);
  for (let b = 0; b < 14; b++) {
    const [ay, az] = onRing(40, (b / 14) * TAU);
    const [by, bz] = onRing(126, (b / 14) * TAU);
    M.tube([[530, ay, az], [530, by, bz]], 2.6, 7);
  }

  // Short serrated nozzle
  const PETALS = 14;
  for (let p = 0; p < PETALS; p++) {
    const a = (p / PETALS) * TAU;
    part(2.3 + p * 0.01, [640, 0, 0]);
    const side = TAU / PETALS / 2 + 0.012;
    M.thin = true;
    M.skin(
      [[562, 132, 1], [596, 122, 1], [628, 113, 1], [652, 106, 1], [664, 103, 0.62], [678, 101, 0.06]].map(([x, r, narrow]) =>
        Array.from({ length: 7 }, (_, s) => {
          const [y, z] = onRing(r, a - side * narrow + (s / 6) * side * 2 * narrow);
          return [x, y, z] as Vec3;
        })
      )
    );
  }

  // Fan case, open on the camera side
  part(2.8, [-900, 0, 0]);
  shell(M, [[150, -38], [176, -30], [190, 0], [192, 60], [186, 120], [150, 132]], 118 * RAD, 402 * RAD);
  [0, 60, 120].forEach((x, i) => {
    const r = [196, 196, 190][i];
    shell(M, [[r, x - 4], [r, x + 4]], 118 * RAD, 402 * RAD);
  });

  // Casing wrapped around the far side only, so the stages stay in view
  part(3, [0, -190, -210]);
  shell(M, [[132, 132], [124, 200], [116, 270], [108, 334]], OPEN_FROM, OPEN_TO);
  [132, 200, 270, 334].forEach((x, i) => {
    shell(M, [[136 - i * 8, x - 3], [136 - i * 8, x + 3]], OPEN_FROM, OPEN_TO);
  });
  part(3.1, [0, -230, -260]);
  shell(M, [[150, 336], [156, 372], [150, 424]], OPEN_FROM, OPEN_TO);
  part(3.2, [0, -190, -210]);
  shell(M, [[140, 426], [152, 500], [136, 556]], OPEN_FROM, OPEN_TO);
  [426, 500, 556].forEach((x, i) => {
    shell(M, [[[146, 158, 142][i], x - 3], [[146, 158, 142][i], x + 3]], OPEN_FROM, OPEN_TO);
  });
  part(3.3, [0, -160, -180]);
  shell(M, [[134, 556], [132, 600]], OPEN_FROM, OPEN_TO);

  return {
    mesh: M,
    sections,
    camera: { yaw: Math.PI - 0.82, pitch: 0.36 },
    pace: { spread: 0.7, form: 1.1, start: 2, stagger: 0.8, move: 0.5 },
    light: [0.3, 0.55, 0.78],
    hatch: 4.5,
    grains: 190_000,
    flow: 0.7,
    flame: { x: 664, radius: 100, length: 840, bore: 90 },
    loop: false,
  };
}
