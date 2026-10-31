//
//  mirage.ts
//  d-exclaimation
//
//  A film camera shooting the Mirage AI logo: solid black bars with their mint reflection above, which never quite holds still
//

import type { Blueprint, Section } from "./engine";
import { Mesh, TAU, add, axis, cross, dot, norm, scale, sub, type Vec3 } from "./mesh";

/** The logo's bars in its own pixels: left, right, then the mint's top, the mint's bottom and the black's top at each side, and the black's bottom. */
const BARS = [
  [38, 49, 69, 71, 110, 114, 122, 126, 143],
  [59, 71, 91, 92, 118, 118, 129, 129, 165],
  [80, 92, 81, 81, 113, 110, 126, 122, 154],
  [102, 113, 69, 71, 106, 107, 118, 119, 143],
  [123, 134, 91, 91, 110, 113, 122, 125, 165],
];
const CENTRE = 86;
const FLOOR = 165;
const PIXEL = 8;
const DEPTH = 76;
/** The logo is turned to sit between the viewer and the film camera. */
const LOGO_TURN = 0.5;
/** How far along the logo stands, clear of the film camera. */
const LOGO_AT = 240;

/** Where the film camera stands, looking along +y at the logo. */
const CAM: Vec3 = [-40, -1040, 0];
const HEAD = 500;
const BODY = { w: 190, l: 340, h: 220 };
const REEL = { r: 125, half: 25, y: [110, -150], z: 891 };

const CLAP: Vec3 = [1080, -420, 0];
const BOARD = { w: 380, h: 260 };

const MINT = 6;

const smooth = (t: number) => {
  const k = Math.min(1, Math.max(0, t));
  return k * k * (3 - 2 * k);
};

/** Keeps a bar breathing in and out of sand once the logo is whole, each on its own beat. */
const shimmer = (n: number) => (seconds: number) => {
  const wake = smooth(seconds / 1.5);
  const wave = 0.5 * Math.sin(seconds * 1.7 + n * 1.3) + 0.5 * Math.sin(seconds * 2.9 + n * 2.1);
  return { form: 1.02 - wake * (0.1 + 0.11 * (1 + wave)), offset: [wake * wave * 12, 0, wake * wave * 5] as Vec3 };
};

/** Opens the clapper, holds it, then snaps it shut, over and over. */
const clap = (seconds: number) => {
  const beat = seconds % 6.5;
  return 0.5 * smooth((beat - 0.6) / 0.5) * (1 - smooth((beat - 2.2) / 0.08));
};

export function mirage(): Blueprint {
  const M = new Mesh();
  const sections: Section[] = [];
  const part = (rank: number, offset: Vec3 = [0, 0, 0], rest: Partial<Section> = {}) => {
    M.section = sections.length;
    M.ink = false;
    M.paint = 0;
    sections.push({ offset, rank, ...rest });
  };
  const at = (x: number, y: number, z: number) => add(CAM, [x, y, z]);

  // The tripod, its legs first
  const legs = [0.25, 0.25 + 1 / 3, 0.25 + 2 / 3].map((k): Vec3 => [Math.cos(k * TAU) * 340, Math.sin(k * TAU) * 340, 0]);
  legs.forEach((foot, n) => {
    part(n * 0.12, scale(norm(add(foot, [0, 0, 1])), 300));
    M.tube([at(foot[0] * 0.04, foot[1] * 0.04, HEAD), at(foot[0], foot[1], 0)], 13);
  });
  part(0.45, [0, 0, -220]);
  legs.forEach((foot, n) => {
    const next = legs[(n + 1) % 3];
    M.tube([at(foot[0] * 0.55, foot[1] * 0.55, HEAD * 0.45), at(0, 0, HEAD * 0.55), at(next[0] * 0.55, next[1] * 0.55, HEAD * 0.45)], 6);
  });
  part(0.7, [0, 0, 380]);
  M.ink = true;
  M.box(CAM[0] - 60, CAM[1] - 80, HEAD, 120, 160, 46);
  M.ink = false;
  M.tube([at(50, -60, HEAD + 26), at(130, -440, HEAD - 70)], 10);

  // The camera itself
  const top = HEAD + 46 + BODY.h;
  part(1.1, [-420, 0, 120]);
  M.box(CAM[0] - BODY.w / 2, CAM[1] - BODY.l / 2, HEAD + 46, BODY.w, BODY.l, BODY.h);
  M.ink = true;
  M.box(CAM[0] + BODY.w / 2, CAM[1] - 120, HEAD + 80, 5, 200, 150);
  M.ink = false;
  M.lathe(axis(at(BODY.w / 2 + 5, 20, HEAD + 155), [1, 0, 0]), [[0, 0], [40, 0], [40, 26], [24, 26], [24, 44], [0, 44]], 32);

  // The lens turret, a lens on it and two more waiting their turn
  const front = BODY.l / 2;
  part(1.5, [0, 520, 40]);
  const lens = at(0, front, HEAD + 156);
  M.lathe(axis(lens, [0, 1, 0]), [[0, 0], [112, 0], [112, 24], [0, 24]], 48);
  M.lathe(axis(add(lens, [0, 24, 0]), [0, 1, 0]), [[62, 0], [62, 80], [76, 80], [76, 150], [62, 150], [62, 196], [50, 196], [50, 170]], 40);
  M.ink = true;
  M.disc(axis(add(lens, [0, 24, 0]), [0, 1, 0]), 50, 170, 1, 32);
  M.ink = false;
  [[66, 62], [-66, 62]].forEach(([x, z]) => M.lathe(axis(add(lens, [x, 24, z]), [0, 1, 0]), [[34, 0], [34, 60], [0, 60]], 24));

  // The matte box out front, on its two rods
  part(1.8, [0, 760, 60]);
  [-34, 34].forEach((x) => M.tube([add(lens, [x, 24, -92]), add(lens, [x, 340, -92])], 6));
  M.ink = true;
  const near = 196 + 24 + 6;
  const far = near + 130;
  const rim = (y: number, w: number, h: number): Vec3[] => [add(lens, [-w, y, -h]), add(lens, [w, y, -h]), add(lens, [w, y, h]), add(lens, [-w, y, h])];
  const a = rim(near, 74, 62);
  const b = rim(far, 128, 100);
  a.forEach((p, n) => {
    const m = (n + 1) % 4;
    const outward = norm(sub(add(p, a[m]), scale(lens, 2)));
    M.quad(p, a[m], b[m], b[n], [outward[0], 0, outward[2]]);
  });

  // The eyepiece, off the back
  part(2.1, [0, -460, 60]);
  M.tube([at(52, -BODY.l / 2, HEAD + 180), at(52, -BODY.l / 2 - 110, HEAD + 190)], 24);
  M.ink = true;
  M.lathe(axis(at(52, -BODY.l / 2 - 110, HEAD + 190), [0, -1, 0.09]), [[24, 0], [30, 0], [38, 60], [0, 60]], 24);

  // The magazine they sit on, then the two reels
  part(2.3, [0, 0, 460]);
  M.box(CAM[0] - 34, CAM[1] - 190, top, 68, 340, 34);
  REEL.y.forEach((y, n) => {
    const centre = at(0, y, REEL.z);
    part(2.5 + n * 0.15, [n ? -520 : 520, 0, 340], { spin: n ? 2.4 : 1.9, pivot: [centre[1], centre[2]] });
    M.ink = true;
    const f = axis(centre, [1, 0, 0]);
    M.lathe(f, [[0, -REEL.half], [REEL.r, -REEL.half], [REEL.r, REEL.half], [0, REEL.half]], 64);
    M.ink = false;
    for (let k = 0; k < 5; k++) {
      const turn = (k / 5) * TAU;
      const hole = add(centre, [0, Math.cos(turn) * 74, Math.sin(turn) * 74]);
      M.disc(axis(hole, [1, 0, 0]), 33, REEL.half + 1, 1, 24);
      M.disc(axis(hole, [1, 0, 0]), 33, -REEL.half - 1, -1, 24);
    }
    M.disc(f, 16, REEL.half + 1, 1, 24);
    M.disc(f, 16, -REEL.half - 1, -1, 24);
  });

  // The clapperboard, its face to the viewer
  const [cx, cy] = CLAP;
  const left = cy - BOARD.w / 2;
  part(3, [460, 0, 200]);
  M.ink = true;
  M.box(cx - 7, left, 0, 14, BOARD.w, BOARD.h);
  M.ink = false;
  [90, 175].forEach((z) => M.box(cx + 7, left + 14, z, 1, BOARD.w - 28, 4));
  [125, 250].forEach((y) => M.box(cx + 7, left + y, 14, 1, 4, 161));
  const stick = (z: number, slant: number) => {
    M.ink = true;
    M.box(cx - 8, left, z, 16, BOARD.w, 40);
    M.ink = false;
    for (let k = 0; k < 7; k++) {
      const y = left + 14 + k * 52;
      M.quad([cx + 9, y, z], [cx + 9, y + 25, z], [cx + 9, y + 25 + slant, z + 40], [cx + 9, y + slant, z + 40], [1, 0, 0]);
    }
  };
  stick(BOARD.h, 18);
  part(3.3, [560, 0, 300], { pivot: [left, BOARD.h + 42], idle: (seconds) => ({ angle: clap(seconds) }) });
  stick(BOARD.h + 42, -18);

  // The logo stands up last: the solid bars, then what's reflected above them
  const turn = ([x, y, z]: Vec3): Vec3 => [LOGO_AT + x * Math.cos(LOGO_TURN) - y * Math.sin(LOGO_TURN), x * Math.sin(LOGO_TURN) + y * Math.cos(LOGO_TURN), z];
  const bar = (x0: number, x1: number, top: [number, number], bottom: [number, number]) => {
    const z = (px: number) => (FLOOR - px) * PIXEL;
    const low = [(x0 - CENTRE) * PIXEL, (x1 - CENTRE) * PIXEL];
    const corner = (side: 0 | 1, y: number, height: number) => turn([low[side], y, height]);
    const faces: [Vec3, Vec3, Vec3, Vec3][] = [-DEPTH / 2, DEPTH / 2].flatMap((y) => [
      [corner(0, y, z(bottom[0])), corner(1, y, z(bottom[1])), corner(1, y, z(top[1])), corner(0, y, z(top[0]))] as [Vec3, Vec3, Vec3, Vec3],
    ]);
    const [front, back] = faces;
    const middle = scale(add(add(front[0], front[2]), add(back[0], back[2])), 0.25);
    const face = (p: Vec3, q: Vec3, r: Vec3, s: Vec3) => {
      const n = norm(cross(sub(q, p), sub(s, p)));
      M.quad(p, q, r, s, dot(n, sub(p, middle)) < 0 ? scale(n, -1) : n);
    };
    face(...front);
    face(...back);
    for (let k = 0; k < 4; k++) {
      const m = (k + 1) % 4;
      face(front[k], front[m], back[m], back[k]);
    }
  };
  BARS.forEach(([x0, x1, , , , , t0, t1, floor], n) => {
    part(3.7 + n * 0.14, [0, 0, -520 - n * 40]);
    M.ink = true;
    bar(x0, x1, [t0, t1], [floor, floor]);
  });
  BARS.forEach(([x0, x1, t0, t1, b0, b1], n) => {
    part(4.5 + n * 0.14, [0, 0, 560 + n * 50], { idle: shimmer(n) });
    M.paint = MINT;
    bar(x0, x1, [t0, t1], [b0, b1]);
  });

  return {
    mesh: M,
    sections,
    camera: { yaw: 0.8, pitch: 0.36 },
    pace: { spread: 0.7, form: 1.1, start: 2, stagger: 0.42, move: 0.5 },
    light: [0.62, -0.48, 0.62],
    hatch: 4.5,
    grains: 200_000,
    flow: 0.7,
    loop: false,
    extent: [add(CLAP, [0, 0, 480])],
  };
}
