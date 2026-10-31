//
//  capture.ts
//  d-exclaimation
//
//  Partly Capture as a Polaroid OneStep: film, rollers and mirror close up into the wedge, the lens and rainbow go on, then it takes a picture and the print develops
//

import type { Blueprint, Section } from "./engine";
import { Mesh, TAU, axis, ridged, rounded, type Flat, type Vec3 } from "./mesh";

const HALF = 240;
const FLOOR = -210;
const LIP = -112;
const FACE = 120;
const ROOF = 190;
const LENS: Flat = [8, 75];
const SLOT: Flat = [150, -160];
const FRONT: Vec3 = [1, 0, 0];
const UP: Vec3 = [0, 0, 1];
const WIDE: Vec3 = [0, 1, 0];
/** The print leaves the slot tipped down, so it faces up at the viewer as it comes out. */
const TIP = 0.42;
const OUT: Flat = [Math.cos(TIP), -Math.sin(TIP)];
const FACING: Flat = [Math.sin(TIP), Math.cos(TIP)];
const PRINT = 214;
const SHOT = 1;

const circle = (r: number, steps = 40) =>
  Array.from({ length: steps }, (_, i): Flat => [r * Math.cos((i / steps) * TAU), r * Math.sin((i / steps) * TAU)]);
const smooth = (t: number) => {
  const k = Math.min(1, Math.max(0, t));
  return k * k * (3 - 2 * k);
};
/** A side profile, as [x, z], the way an axis running across the camera reads it. */
const profile = (points: Flat[]) => points.map(([x, z]): Flat => [x, -z]);

/** A point on the print, measured back from its leading edge, across it, and up off its face. */
const onPrint = (back: number, across: number, up = 0): Vec3 => [
  SLOT[0] - OUT[0] * back + FACING[0] * up,
  across,
  SLOT[1] - OUT[1] * back + FACING[1] * up,
];

/** How far out of the slot the print has come. */
const ejected = (seconds: number) => PRINT * smooth((seconds - SHOT - 0.15) / 1.8);

/** A flat rectangle facing the front of the camera, given its centre and size. */
function pane(M: Mesh, x: number, y: number, z: number, w: number, h: number) {
  M.fan([[x, y - w / 2, z - h / 2], [x, y + w / 2, z - h / 2], [x, y + w / 2, z + h / 2], [x, y - w / 2, z + h / 2]], FRONT);
}

export function capture(): Blueprint {
  const M = new Mesh();
  M.thin = true;
  const sections: Section[] = [];
  const part = (rank: number, offset: Vec3 = [0, 0, 0], rest: Partial<Section> = {}) => {
    M.section = sections.length;
    M.ink = false;
    sections.push({ offset, rank, ...rest });
  };
  const across = (y = -HALF) => axis([0, y, 0], WIDE);
  const out = (x: number, [y, z]: Flat) => axis([x, y, z], FRONT);
  const lens = (x = 0) => out(x, LENS);
  const lensBand = (r0: number, x0: number, r1: number, x1: number) => M.lathe(lens(), [[r0, x0], [r1, x1]], 56);
  const onPrintRect = (b0: number, b1: number, w: number, up: number) =>
    M.fan([onPrint(b0, -w, up), onPrint(b1, -w, up), onPrint(b1, w, up), onPrint(b0, w, up)], [FACING[0], 0, FACING[1]]);

  // The black base, with the slot across its front
  part(0);
  M.ink = true;
  M.prism(across(), profile([[124, FLOOR], [124, -190], [-170, -190], [-200, FLOOR]]), HALF * 2);
  M.prism(across(), profile([[150, FLOOR], [150, LIP], [124, -104], [124, FLOOR]]), HALF * 2);
  M.ink = false;
  pane(M, 151, 0, SLOT[1], 300, 7);
  pane(M, 151, 0, -128, 424, 2);
  pane(M, 151, 0, -186, 424, 2);
  pane(M, 151, -212, -157, 2, 58);
  pane(M, 151, 212, -157, 2, 58);

  // The film pack drops in, a white-bordered print sitting on top
  part(0.3, [0, 0, 440]);
  M.box(-130, -132, -188, 230, 264, 44);
  M.fan([[-124, -122, -143], [92, -122, -143], [92, 122, -143], [-124, 122, -143]], UP);
  M.ink = true;
  M.fan([[-96, -94, -142], [64, -94, -142], [64, 94, -142], [-96, 94, -142]], UP);
  M.ink = false;

  // Rollers and the gears that drive them, then the motor
  part(0.6, [320, 0, -40]);
  M.lathe(axis([112, -150, -146], WIDE), [[0.5, 0], [13, 0], [13, 300], [0.5, 300]], 18);
  M.lathe(axis([112, -150, -174], WIDE), [[0.5, 0], [13, 0], [13, 300], [0.5, 300]], 18);
  M.prism(axis([112, -168, -146], WIDE), ridged(24, 3, 14), 12);
  M.prism(axis([112, -168, -174], WIDE), ridged(24, 3, 14), 12);
  part(0.7, [0, -400, 0]);
  M.lathe(axis([-90, -192, -150], FRONT), [[0.5, 0], [30, 0], [30, 150], [12, 150], [12, 172], [0.5, 172]], 24);
  M.prism(axis([86, -192, -150], FRONT), ridged(22, 3, 12), 12);

  // The mirror that folds the light down onto the film
  part(0.9, [-300, 0, 260]);
  M.fan([[-176, -210, -186], [-176, 210, -186], [-26, 210, 170], [-26, -210, 170]], [0.92, 0, 0.39]);
  M.ink = true;
  M.fan([[-168, -196, -176], [-168, 196, -176], [-36, 196, 154], [-36, -196, 154]], [0.92, 0, 0.39]);
  M.ink = false;

  // The back of the wedge, then its two sides
  part(1.1, [-460, 0, 200]);
  M.ink = true;
  M.prism(across(), profile([[-200, FLOOR], [-22, ROOF]]), HALF * 2, false);
  const wedge: Flat[] = [[150, FLOOR], [150, LIP], [124, -104], [118, 150], [96, ROOF], [-22, ROOF], [-200, FLOOR]];
  [-1, 1].forEach((side) => {
    part(1.3 + side * 0.02, [0, side * 420, 0]);
    M.fan(wedge.map(([x, z]): Vec3 => [x, side * HALF, z]), [0, side, 0]);
    M.ink = true;
    M.fan([[150, side * (HALF + 1), FLOOR], [150, side * (HALF + 1), LIP], [-161, side * (HALF + 1), LIP], [-200, side * (HALF + 1), FLOOR]], [0, side, 0]);
    M.ink = false;
  });

  // The white front
  part(1.7, [520, 0, 0]);
  M.prism(out(112, [0, 23]), rounded(484, 254, 14, 6), 8);

  // The black lid, with the flash socket on top, and the viewfinder standing up behind
  part(2, [0, 0, 400]);
  M.ink = true;
  M.prism(across(-HALF - 4), profile([[124, 146], [100, ROOF + 4], [-24, ROOF + 4], [-34, 146]]), HALF * 2 + 8);
  part(2.1, [0, 0, 520]);
  M.box(-14, -92, ROOF + 4, 90, 184, 8);
  M.ink = true;
  M.fan([[-4, -80, ROOF + 13], [66, -80, ROOF + 13], [66, 80, ROOF + 13], [-4, 80, ROOF + 13]], UP);
  part(2.2, [-140, 0, 640]);
  M.ink = true;
  M.prism(across(60), profile([[-6, 176], [-30, 270], [-104, 256], [-70, 166]]), 150);
  M.ink = false;

  // The electric eye and its dial, the badge, and the red button that takes the picture
  part(2.3, [300, 0, 0]);
  M.box(FACE, 118, 66, 4, 98, 86);
  M.ink = true;
  pane(M, FACE + 4.5, 167, 109, 80, 68);
  M.ink = false;
  M.prism(out(FACE + 5, [167, 109]), circle(20, 24), 2);
  pane(M, FACE + 7.5, 160, 116, 6, 6);
  part(2.35, [340, 0, 0], { turn: TAU / 2, pivot: [143, 26] });
  M.ink = true;
  M.prism(out(FACE, [143, 26]), ridged(26, 2.5, 24), 26);
  part(2.4, [300, 0, 40]);
  M.ink = true;
  M.prism(out(FACE, [-155, 84]), rounded(106, 40, 8, 4), 4);
  part(2.45, [300, 0, -40]);
  M.prism(out(FACE, [-155, 26]), circle(38), 3);
  part(2.5, [340, 0, -40], {
    idle: (seconds) => ({ offset: [-7 * smooth((seconds - SHOT + 0.2) / 0.1) * (1 - smooth((seconds - SHOT - 0.12) / 0.14)), 0, 0] }),
  });
  M.paint = 1;
  M.prism(out(FACE, [-155, 26]), circle(29), 15);
  M.paint = 0;

  // The lens: a silver bezel, the ribbed black cone inside it, and the glass at the bottom
  part(2.6, [420, 0, 0]);
  M.lathe(lens(), [[102, FACE], [97, FACE + 5], [97, FACE + 32], [91, FACE + 38], [87, FACE + 36]], 56);
  part(2.7, [540, 0, 0]);
  M.ink = true;
  lensBand(88, FACE + 36, 46, FACE + 8);
  M.fan(circle(48).map(([y, z]): Vec3 => [FACE + 9, LENS[0] + y, LENS[1] + z]), FRONT);
  M.ink = false;
  [80, 72, 64, 56].forEach((r) => {
    const x = FACE + 8 + ((r - 46) / 42) * 28;
    lensBand(r, x + 1.5, r + 1, x + 2.2);
  });
  M.fan(
    Array.from({ length: 12 }, (_, i): Vec3 => {
      const a = 1.8 + (i < 6 ? i : 11 - i) * 0.14;
      const r = i < 6 ? 38 : 28;
      return [FACE + 10, LENS[0] + r * Math.cos(a), LENS[1] + r * Math.sin(a)];
    }),
    FRONT
  );

  // The rainbow, running down from the lens to the base
  part(2.9, [220, 0, 0]);
  for (let band = 0; band < 5; band++) {
    M.paint = band + 1;
    pane(M, FACE + 0.6, LENS[0] - 20.4 + band * 9.2, -60.5, 9.2, 87);
  }
  M.paint = 0;

  // The print itself, held back until the camera is shut, then pushed out of the slot after the shot
  const carried = (seconds: number): Vec3 => {
    const travel = ejected(seconds);
    return [OUT[0] * travel, 0, OUT[1] * travel];
  };
  part(3, [0, 0, 0], { late: true, idle: (seconds) => ({ offset: carried(seconds) }) });
  onPrintRect(0, PRINT, 89, 0);
  part(3.01, [0, 0, 0], { late: true, idle: (seconds) => ({ offset: carried(seconds) }) });
  const centre = 121;
  M.ink = true;
  M.fan(
    Array.from({ length: 36 }, (_, i): Vec3 => {
      const a = (i / 36) * TAU;
      const edge = (a % (TAU / 6)) - TAU / 12;
      const r = (58 * Math.cos(TAU / 12)) / Math.cos(edge * 0.82);
      return onPrint(centre - r * Math.sin(a), r * Math.cos(a), 0.6);
    }),
    [FACING[0], 0, FACING[1]]
  );
  M.ink = false;
  [-30, 8].forEach((y) => {
    M.fan(
      Array.from({ length: 30 }, (_, i): Vec3 => {
        const a = (i / 30) * TAU;
        const r = 17 * (0.76 + 0.24 * Math.pow((1 + Math.cos(6 * a)) / 2, 0.7));
        return onPrint(centre - r * Math.sin(a), y + r * Math.cos(a), 0.9);
      }),
      [FACING[0], 0, FACING[1]]
    );
  });
  part(3.02, [0, 0, 0], {
    late: true,
    idle: (seconds) => ({ offset: carried(seconds), form: 1.02 * (1 - smooth((seconds - SHOT - 2.2) / 3.2)) }),
  });
  M.ink = true;
  onPrintRect(46, 196, 74, 1.2);
  M.ink = false;

  const reach = onPrint(-PRINT, 0);
  return {
    mesh: M,
    sections,
    camera: { yaw: Math.PI - 1.05, pitch: 0.36 },
    pace: { spread: 0.7, form: 1.1, start: 2, stagger: 1.2, move: 0.5 },
    light: [0.74, 0.3, 0.6],
    hatch: 4.5,
    grains: 150_000,
    flow: 0.7,
    flash: (seconds) =>
      Math.exp(-Math.pow((seconds - SHOT - 0.06) / 0.09, 2)) * 0.92 +
      Math.exp(-Math.max(0, seconds - SHOT - 0.06) * 7) * 0.3 * smooth((seconds - SHOT) / 0.06),
    extent: [[reach[0], 89, reach[2]], [reach[0], -89, reach[2]]],
    loop: false,
  };
}
