//
//  roadster.ts
//  d-exclaimation
//
//  A sports car with cold gas thrusters, standing in for Partly
//

import type { Blueprint, Section } from "./engine";
import { Mesh, RAD, axis, type Vec3 } from "./mesh";

/** Smooth curve through [x, y] knots. */
function curve(k: [number, number][]) {
  return (x: number) => {
    let i = 0;
    while (i < k.length - 2 && x > k[i + 1][0]) i++;
    const [x0, y0] = k[i];
    const [x1, y1] = k[i + 1];
    const m0 = i > 0 ? (y1 - k[i - 1][1]) / (x1 - k[i - 1][0]) : (y1 - y0) / (x1 - x0);
    const m1 = i < k.length - 2 ? (k[i + 2][1] - y0) / (k[i + 2][0] - x0) : (y1 - y0) / (x1 - x0);
    const h = x1 - x0;
    const t = Math.min(1, Math.max(0, (x - x0) / h));
    const t2 = t * t;
    const t3 = t2 * t;
    return (2 * t3 - 3 * t2 + 1) * y0 + (t3 - 2 * t2 + t) * h * m0 + (-2 * t3 + 3 * t2) * y1 + (t3 - t2) * h * m1;
  };
}

const belt = curve([[0, 96], [40, 106], [120, 112], [200, 106], [300, 98], [380, 88], [440, 72], [470, 50]]);
const sill = curve([[0, 46], [30, 32], [440, 32], [470, 44]]);
const half = curve([[0, 76], [40, 90], [100, 94], [230, 88], [360, 94], [420, 88], [470, 58]]);
const rise = curve([[0, 0], [96, 0], [130, 22], [175, 40], [230, 42], [262, 32], [306, 0], [470, 0]]);

const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const WHEELS = [92, 372];
const AXLE = 37;
const SMOOTH = 5;

/** The body's cross-section at x, from the near sill over the roof to the far sill. */
function ribs(x: number): [number, number][] {
  const w = half(x);
  const b = belt(x);
  const s = sill(x);
  const h = Math.max(0, rise(x));
  const glass = Math.min(1, h / 8);
  const near: [number, number][] = [
    [-0.9 * w, s],
    [-w, s + 0.4 * (b - s)],
    [-0.985 * w, s + 0.78 * (b - s)],
    [-0.86 * w, b],
    [-mix(0.62, 0.66, glass) * w, b + mix(5, 2, glass)],
    [-mix(0.32, 0.5, glass) * w, b + mix(8, h * 0.96 + 6, glass)],
    [0, b + h + 8.5],
  ];
  const far = near.slice(0, 6).reverse().map(([y, z]): [number, number] => [-y, z]);
  return [...near, ...far];
}

/** Rounds the cross-section off between its control points. */
function rounded(points: [number, number][]) {
  const out: [number, number][] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    for (let s = 0; s < SMOOTH; s++) {
      const t = s / SMOOTH;
      const t2 = t * t;
      const t3 = t2 * t;
      const at = (n: 0 | 1) =>
        0.5 * (2 * p1[n] + (p2[n] - p0[n]) * t + (2 * p0[n] - 5 * p1[n] + 4 * p2[n] - p3[n]) * t2 + (3 * p1[n] - p0[n] - 3 * p2[n] + p3[n]) * t3);
      out.push([at(0), at(1)]);
    }
  }
  out.push(points[points.length - 1]);
  return out;
}

export function roadster(): Blueprint {
  const M = new Mesh();
  const sections: Section[] = [];
  const part = (rank: number, x = 0, y = 0, z = 0) => {
    M.section = sections.length;
    M.ink = false;
    M.cut = false;
    sections.push({ offset: [x * 1.6, y * 1.6, z * 1.6], rank });
  };

  const stations = [...new Set([...Array.from({ length: 60 }, (_, i) => i * 8), 96, 165, 284, 335, 470])].sort((a, b) => a - b);
  const skin: Vec3[][] = stations.map((x) => rounded(ribs(x)).map(([y, z]): Vec3 => [x, y, z]));
  /** One body panel, between two stations and two control ribs. */
  const panel = (fromX: number, toX: number, fromRib: number, toRib: number) => {
    const a = stations.indexOf(fromX);
    const b = stations.indexOf(toX);
    M.skin(skin.slice(a, b + 1).map((row) => row.slice(fromRib * SMOOTH, toRib * SMOOTH + 1)));
  };

  // Chassis
  part(0);
  M.box(36, -72, 30, 400, 144, 8);
  M.box(60, -86, 26, 340, 14, 16);
  M.box(60, 72, 26, 340, 14, 16);
  M.box(146, -70, 38, 6, 140, 58);
  M.box(296, -70, 38, 6, 140, 58);
  for (let i = 0; i < 8; i++) M.box(70 + i * 46, -84, 40, 4, 168, 4);
  M.ink = true;
  WHEELS.forEach((x) => {
    M.lathe(axis([x, -52, AXLE], [0, -1, 0]), [[47, 0], [47, 40]]);
    M.lathe(axis([x, 52, AXLE], [0, 1, 0]), [[47, 0], [47, 40]]);
  });

  // Battery
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 3; c++) {
      part(1 + r * 0.3 + c * 0.05, (c - 1) * 60, r ? 64 : -64, 64);
      M.box(158 + c * 44, -58 + r * 58, 38, 40, 54, 16);
      M.box(162 + c * 44, -52 + r * 58, 54, 32, 42, 3);
      M.ink = true;
      M.box(170 + c * 44, -30 + r * 58, 57, 14, 3, 2);
    }
  }

  // Motors
  part(1.8, -40, 0, 54);
  M.lathe(axis([92, -44, 42], [0, 1, 0]), [[0.5, 0], [20, 0], [20, 88], [0.5, 88]]);
  M.lathe(axis([92, -10, 42], [0, 1, 0]), [[0.5, 0], [27, 0], [27, 20], [0.5, 20]]);
  for (let f = 0; f < 5; f++) M.lathe(axis([92, -40 + f * 6, 42], [0, 1, 0]), [[20, 0], [23, 0], [23, 2.5], [20, 2.5]]);
  part(1.9, 40, 0, 54);
  M.lathe(axis([372, -36, 42], [0, 1, 0]), [[0.5, 0], [17, 0], [17, 72], [0.5, 72]]);
  M.lathe(axis([372, -8, 42], [0, 1, 0]), [[0.5, 0], [23, 0], [23, 16], [0.5, 16]]);

  // Suspension and brakes at each corner
  WHEELS.flatMap((x) => [[x, -1], [x, 1]]).forEach(([x, side], n) => {
    const y = side * 62;
    part(2.2 + n * 0.08, 0, side * 56, 46);
    M.tube([[x - 26, side * 40, 40], [x, y, 36], [x + 26, side * 40, 40]], 2.8);
    M.tube([[x - 22, side * 40, 70], [x, y, 66], [x + 22, side * 40, 70]], 2.4);
    M.tube([[x, y - side * 8, 40], [x, y - side * 8, 84]], 3.5);
    M.coil(axis([x, y - side * 8, 46], [0, 0, 1]), 9, 32, 6, 1.5);
    part(2.3 + n * 0.08, 0, side * 96, 0);
    const hub = axis([x, side * 74, AXLE], [0, side, 0]);
    M.lathe(hub, [[6, 0], [24, 0], [24, 3], [6, 3]]);
    M.lathe(hub, [[0.5, -6], [10, -6], [10, 12], [0.5, 12]]);
    M.ink = true;
    M.box(x - 34, side * 74 - 4, AXLE + 8, 16, 8, 20);
  });

  // Cold gas tanks and their pipework
  [52, 24].forEach((x, n) => {
    part(3.2 + n * 0.1, -40 - n * 30, 0, 70 + n * 16);
    M.lathe(axis([x, -42, 66], [0, 1, 0]), [[0.5, 0], [8, 2], [13, 8], [14, 18], [14, 66], [13, 76], [8, 82], [0.5, 84]], 40);
    M.lathe(axis([x, -44, 66], [0, 1, 0]), [[3, 0], [5, 0], [5, 8], [3, 8]], 14);
  });
  part(3.5, -64, 0, 110);
  M.tube([[38, -50, 82], [30, -50, 90], [14, -50, 72], [14, 50, 72], [30, 50, 90], [38, 50, 82]], 2.8);

  // Cabin
  part(4, 0, 0, 44);
  M.box(268, -66, 62, 26, 132, 26);
  M.ink = true;
  M.box(267, -44, 74, 1, 30, 10);
  M.box(267, 8, 74, 1, 30, 10);
  part(4.1, -16, -30, 56);
  M.tube([[268, -34, 86], [244, -34, 94]], 2.6);
  M.lathe(axis([244, -34, 94], [1, 0, 0]), [[11, 0], [15, 0], [15, 3], [11, 3]], 28);
  [[176, 12], [176, -62]].forEach(([x, y], n) => {
    part(4.3 + n * 0.1, -30, n ? -40 : 40, 54);
    M.box(x + 12, y, 38, 50, 50, 16);
    M.block([x + 2, y + 25, 82], [7, 0, 0], [0, 25, 0], [2, 0, 28]);
    M.block([x - 2, y + 25, 118], [5, 0, 0], [0, 13, 0], [0, 0, 7]);
    M.ink = true;
    M.box(x + 14, y + 22, 54, 46, 6, 1);
  });

  // Body: the far side first, so nearer panels close over it
  part(5, -30, 110, 30);
  M.cut = true;
  panel(0, 165, 8, 12);
  part(5.1, 0, 140, 34);
  M.cut = true;
  panel(165, 284, 8, 12);
  part(5.2, 44, 110, 30);
  M.cut = true;
  panel(284, 470, 8, 12);

  part(5.3, -30, -110, 30);
  M.cut = true;
  panel(0, 165, 0, 4);
  M.cut = false;
  M.ink = true;
  M.box(122, -93.5, 70, 30, 2, 13);
  part(5.4, 0, -140, 34);
  M.cut = true;
  panel(165, 284, 0, 4);
  M.cut = false;
  M.box(236, -91, 92, 24, 3, 4);
  part(5.5, 44, -110, 30);
  M.cut = true;
  panel(284, 470, 0, 4);

  part(6, -70, 0, 124);
  panel(0, 96, 4, 8);
  part(6.1, 70, 0, 124);
  panel(335, 470, 4, 8);
  part(6.3, -50, 0, 176);
  M.ink = true;
  panel(96, 165, 4, 8);
  part(6.4, 40, 0, 172);
  M.ink = true;
  panel(284, 335, 4, 8);
  part(6.5, 0, -64, 150);
  M.ink = true;
  panel(165, 284, 4, 5);
  part(6.6, 0, 64, 150);
  M.ink = true;
  panel(165, 284, 7, 8);
  part(6.7, 0, 0, 216);
  panel(165, 284, 5, 7);

  // Tail, with the thrusters behind it
  part(7, -130, 0, 16);
  const tail = rounded(ribs(0)).map(([y, z]): Vec3 => [0, y, z]);
  M.fan(tail, [-1, 0, 0]);
  M.ink = true;
  M.box(-1.5, -66, 84, 2, 132, 8);
  M.ink = false;
  M.box(-2, -26, 56, 3, 52, 18);
  part(7.1, 130, 0, 10);
  M.fan(rounded(ribs(470)).map(([y, z]): Vec3 => [470, y, z]), [1, 0, 0]);

  const nozzles: Vec3[] = [];
  [[-58, 66], [-46, 54], [-34, 66], [34, 66], [46, 54], [58, 66]].forEach(([y, z], n) => {
    part(7.3 + n * 0.05, -170, y * 0.6, 16);
    const bell = axis([-1, y, z], [-1, 0, 0]);
    M.lathe(bell, [[1, 0], [3, 0], [4, 5], [7, 12], [10, 18]], 24);
    M.ink = true;
    M.disc(bell, 9.4, 17, -1 as const, 20);
    nozzles.push([-19, y, z]);
  });

  // Mirrors and wheels last
  part(8, 0, -96, 60);
  M.block([262, -96, 118], [10, 0, 0], [0, 7, 0], [0, 0, 7]);
  M.tube([[262, -88, 116], [268, -80, 110]], 2);
  part(8.1, 0, 96, 60);
  M.block([262, 96, 118], [10, 0, 0], [0, 7, 0], [0, 0, 7]);
  M.tube([[262, 88, 116], [268, 80, 110]], 2);

  WHEELS.flatMap((x) => [[x, 1], [x, -1]]).forEach(([x, side], n) => {
    part(4.6 + n * 0.1, 0, side * 130, 0);
    const wheel = axis([x, side * 98, AXLE], [0, -side, 0]);
    M.ink = true;
    M.lathe(wheel, [[12, 0], [31, 0], [36, 4], [37, 15], [36, 26], [31, 30], [12, 30]], 72);
    M.ink = false;
    M.lathe(wheel, [[26, 0.5], [27.5, 0.5], [27.5, 7], [26, 7]], 56);
    M.lathe(wheel, [[0.5, 6], [26, 6]], 56);
    for (let s = 0; s < 10; s++) {
      const a = s * 36 * RAD;
      const c = Math.cos(a);
      const q = Math.sin(a);
      M.block([x + c * 16, side * 98 - -side * 3, AXLE + q * 16], [c * 10, 0, q * 10], [0, 1.6, 0], [-q * (s % 2 ? 1.2 : 2.2), 0, c * (s % 2 ? 1.2 : 2.2)]);
    }
    M.lathe(wheel, [[0.5, 1.5], [7, 1.5], [7, 6]], 24);
  });

  return {
    mesh: M,
    sections,
    cuts: WHEELS.map((x): Vec3 => [x, AXLE, 46]),
    jets: { nozzles, blast: [-300, 0, -10] },
    camera: { yaw: -0.66, pitch: 0.52 },
    hatch: 3.4,
    flow: 0.55,
  };
}
