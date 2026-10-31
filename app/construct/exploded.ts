//
//  exploded.ts
//  d-exclaimation
//
//  Exploded View's title screen: the two of them walking down the desert road, built from the game's own voxels, with the poles still going past
//

import type { Blueprint, Section } from "./engine";
import { ANCHORS, GROUPS, PALETTE } from "./exploded-scene";
import { Mesh, type Vec3 } from "./mesh";
import { addVoxels, blink, brightness, type Placement } from "./voxels";

/** Construct units per metre of the game's world. */
const UNITS = 300;
const VOX = 0.07;
/** Where the road starts and ends along the way they're walking, squashed up around them the way the game's long lens does. */
const ROAD = [-4, 2.4];
const HALF = 1.75;
/** The double yellow and the white edges, in metres either side of the middle. */
const YELLOWS = [
  [0.06, 0.16],
  [-0.16, -0.06],
];
const EDGES = [
  [1.48, 1.58],
  [-1.58, -1.48],
];
/** The way the game's title has them walking, towards the camera. */
const FORWARD = Math.PI / 2;
const LARRY: Placement = { size: VOX, anchor: ANCHORS.larry, at: [0, -0.62], yaw: FORWARD };
const BLOB: Placement = { size: VOX, anchor: ANCHORS.blob, at: [0, 0.62], yaw: FORWARD };
/** Metres a second the world goes past them. */
const PACE = 0.7;
const YELLOW = 3;

const ink = (hex: number) => brightness(hex) < 0.26;
const smooth = (t: number) => {
  const k = Math.min(1, Math.max(0, t));
  return k * k * (3 - 2 * k);
};

/** The little hop of each step. */
const stride = (seconds: number, lag: number) => Math.abs(Math.sin(seconds * 5 + lag)) * 10;

/** Carries something back along the road, turning it to sand as it nears either end so it can come round again. */
const passing = (x: number) => (seconds: number) => {
  const span = ROAD[1] - ROAD[0];
  const at = ROAD[0] + (((x - ROAD[0] - seconds * PACE) % span) + span) % span;
  return { offset: [(at - x) * UNITS, 0, 0] as Vec3, form: Math.min(smooth((at - ROAD[0]) / 0.6), smooth((ROAD[1] - at) / 0.6)) * 1.02 };
};

export function exploded(): Blueprint {
  const M = new Mesh();
  const sections: Section[] = [];
  const part = (offset: Vec3, rank: number, rest: Partial<Section> = {}) => {
    M.section = sections.length;
    M.ink = false;
    M.paint = 0;
    sections.push({ offset, rank, ...rest });
  };

  // The road comes down a lane at a time, then its lines
  const strip = (from: number, to: number, height: number) =>
    M.box(ROAD[0] * UNITS, from * UNITS, 0, (ROAD[1] - ROAD[0]) * UNITS, (to - from) * UNITS, height);
  part([0, 420, -160], 0);
  strip(0, HALF, -30);
  part([0, -420, -160], 0.4);
  strip(-HALF, 0, -30);
  part([0, 0, 260], 1);
  M.paint = YELLOW;
  YELLOWS.forEach(([from, to]) => strip(from, to, 2));
  part([0, 0, 260], 1.3);
  M.ink = true;
  EDGES.forEach(([from, to]) => strip(from, to, 2));

  const prop = (group: keyof typeof GROUPS, anchor: readonly number[], x: number, z: number, scale: number, rank: number) => {
    part([0, 0, 420], rank, { idle: passing(x) });
    addVoxels(M, GROUPS[group], PALETTE, { size: VOX * scale, anchor, at: [x, z], yaw: 0 }, UNITS, ink);
  };
  prop("pole", ANCHORS.pole, -3.2, -2.3, 0.6, 1.7);
  prop("pole", ANCHORS.pole, -1, -2.3, 0.6, 1.8);
  prop("pole", ANCHORS.pole, 1.2, -2.3, 0.6, 1.9);
  prop("cactus", ANCHORS.cactus, -2, 2.3, 0.8, 2);
  prop("cactus", ANCHORS.cactus, 0.2, -3, 0.8, 2.1);

  const hero = (body: keyof typeof GROUPS, eyes: keyof typeof GROUPS, place: Placement, rank: number, lag: number) => {
    const idle = (seconds: number) => ({ offset: [0, 0, stride(seconds, lag)] as Vec3 });
    part([420, 0, 300], rank, { idle });
    addVoxels(M, GROUPS[body], PALETTE, place, UNITS, ink);
    part([520, 0, 160], rank + 0.3, { idle: (seconds) => ({ ...idle(seconds), squash: blink(seconds, lag) }) });
    const middle = addVoxels(M, GROUPS[eyes], PALETTE, place, UNITS, ink);
    sections[sections.length - 1].pivot = [middle[1], middle[2]];
  };
  hero("larry:body", "larry:eyes", LARRY, 2.7, 0);
  hero("blob:body", "blob:eyes", BLOB, 3, 1.1);

  return {
    mesh: M,
    sections,
    camera: { yaw: Math.PI / 2 - 0.24, pitch: 0.36 },
    pace: { spread: 0.7, form: 1.1, start: 2, stagger: 0.55, move: 0.5 },
    light: [0.35, -0.6, 0.72],
    hatch: 4.5,
    grains: 170_000,
    flow: 0.7,
    loop: false,
  };
}
