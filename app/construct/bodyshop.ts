//
//  bodyshop.ts
//  d-exclaimation
//
//  Body Shop's title screen: the damaged SUV in for estimating, with the two of them stood beside it, built panel by panel from the game's own voxels
//

import { ANCHORS, GROUPS, PALETTE } from "./bodyshop-scene";
import type { Blueprint, Section } from "./engine";
import { Mesh, add, norm, scale, type Vec3 } from "./mesh";
import { addVoxels, blink, brightness, type Placement } from "./voxels";

/** Construct units per metre of the game's world. */
const UNITS = 300;
const CAR_VOX = 0.035;
const PEOPLE_VOX = 0.07;

/** Where everything stands on the title screen, in metres from the car. */
const CAR: Placement = { size: CAR_VOX, anchor: ANCHORS.car, at: [0, 0], yaw: Math.PI };
const PLAYER: Placement = { size: PEOPLE_VOX, anchor: ANCHORS.player, at: [1.75, 1.75], yaw: 0.2 };
const JO: Placement = { size: PEOPLE_VOX, anchor: ANCHORS.jo, at: [2.65, 1.05], yaw: -0.1 };

/** The panels in the order they go on, from the sills up and the lights last. */
const PANELS: [keyof typeof GROUPS, number][] = [
  ["car:rbumper", 1],
  ["car:fbumper", 1.1],
  ["car:lquarter", 1.3],
  ["car:rquarter", 1.3],
  ["car:ldoorr", 1.5],
  ["car:rdoorr", 1.5],
  ["car:ldoorf", 1.6],
  ["car:rdoorf", 1.6],
  ["car:lfender", 1.8],
  ["car:rfender", 1.8],
  ["car:trunk", 2],
  ["car:hood", 2.1],
  ["car:windshield", 2.3],
  ["car:roof", 2.5],
  ["car:lmirror", 2.7],
  ["car:rmirror", 2.7],
  ["car:lhead", 2.8],
  ["car:rhead", 2.8],
  ["car:ltail", 2.9],
  ["car:rtail", 2.9],
];
const WHEELS: (keyof typeof GROUPS)[] = ["wheel:rear:left", "wheel:rear:right", "wheel:front:left", "wheel:front:right"];

const ink = (hex: number) => brightness(hex) < 0.26;

/** The slow rise and fall of someone waiting about. */
const bob = (seconds: number, lag: number) => Math.abs(Math.sin(seconds * 1.6 + lag)) * 7;

export function bodyshop(): Blueprint {
  const M = new Mesh();
  const sections: Section[] = [];
  const part = (name: keyof typeof GROUPS, place: Placement, rank: number, rest: Partial<Section> = {}) => {
    M.section = sections.length;
    sections.push({ offset: [0, 0, 0], rank, ...rest });
    return addVoxels(M, GROUPS[name], PALETTE, place, UNITS, ink);
  };
  /** Hangs a part out from the middle of the car, the way it came off. */
  const hang = (middle: Vec3, reach: number, lift: number) => {
    sections[sections.length - 1].offset = add(scale(norm([middle[0], middle[1], 0]), reach), [0, 0, lift]);
  };

  part("car:chassis", CAR, 0);
  WHEELS.forEach((name, n) => hang(part(name, CAR, 0.4 + n * 0.05), 340, -40));
  PANELS.forEach(([name, rank]) => hang(part(name, CAR, rank), 420, 160));

  const person = (body: keyof typeof GROUPS, eyes: keyof typeof GROUPS, place: Placement, rank: number, lag: number) => {
    const idle = (seconds: number) => ({ offset: [0, 0, bob(seconds, lag)] as Vec3 });
    part(body, place, rank, { idle });
    sections[sections.length - 1].offset = [0, -260, 300];
    const middle = part(eyes, place, rank + 0.3, {
      idle: (seconds) => ({ ...idle(seconds), squash: blink(seconds, lag) }),
    });
    sections[sections.length - 1].offset = [0, -320, 120];
    sections[sections.length - 1].pivot = [middle[1], middle[2]];
  };
  person("player:body", "player:eyes", PLAYER, 3.2, 0);
  person("jo:body", "jo:eyes", JO, 3.5, 1.4);

  return {
    mesh: M,
    sections,
    camera: { yaw: 0.42, pitch: 0.36 },
    pace: { spread: 0.7, form: 1.1, start: 2, stagger: 0.55, move: 0.5 },
    light: [-0.5, -0.46, 0.72],
    hatch: 4.5,
    grains: 200_000,
    flow: 0.7,
    loop: false,
  };
}
