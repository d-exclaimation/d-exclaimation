//
//  shelf.ts
//  d-exclaimation
//
//  The small projects, each a small thing on one shelf: picking one brings it forward
//

import type { Blueprint, Section } from "./engine";
import { Mesh, TAU, add, axis, norm, scale, sub, type Vec3 } from "./mesh";

const WIDTH = 1300;
const DEPTH = 340;
const HEIGHT = 1120;
const PLANK = 34;
/** The height of each plank's top. */
const LOW = 60;
const HIGH = 590;

const smooth = (t: number) => {
  const k = Math.min(1, Math.max(0, t));
  return k * k * (3 - 2 * k);
};

export function shelf(): Blueprint {
  const M = new Mesh();
  const sections: Section[] = [];
  const part = (offset: Vec3, rank: number, rest: Partial<Section> = {}) => {
    M.section = sections.length;
    M.ink = false;
    sections.push({ offset, rank, ...rest });
  };

  // The one picked comes forward at its own pace, and whatever was picked goes back
  let picked = -1;
  let clock = 0;
  const forward = [0, 0, 0, 0, 0];
  const out = (n: number, seconds: number): Vec3 => {
    if (seconds !== clock) {
      const dt = Math.max(0, seconds - clock);
      clock = seconds;
      forward.forEach((was, i) => (forward[i] = was + ((i === picked ? 1 : 0) - was) * Math.min(1, dt * 7)));
    }
    return [0, -190 * forward[n], 46 * forward[n]];
  };
  const moved = (n: number) => (seconds: number) => ({ offset: out(n, seconds) });

  // The shelf: its two sides, then the planks
  part([-420, 0, 0], 0);
  M.box(-WIDTH / 2 - PLANK, -DEPTH / 2, 0, PLANK, DEPTH, HEIGHT);
  part([420, 0, 0], 0.15);
  M.box(WIDTH / 2, -DEPTH / 2, 0, PLANK, DEPTH, HEIGHT);
  [LOW, HIGH, HEIGHT].forEach((z, n) => {
    part([0, -380, 0], 0.4 + n * 0.15);
    M.box(-WIDTH / 2, -DEPTH / 2, z - PLANK, WIDTH, DEPTH, PLANK);
  });

  // Pioneer: the probe on a little stand, its dish turned up to the viewer
  {
    const base: Vec3 = [-330, 0, LOW];
    part([0, -420, 200], 1, { idle: moved(0) });
    M.lathe(axis(base, [0, 0, 1]), [[0, 0], [90, 0], [90, 14], [14, 22], [14, 170], [0, 170]], 32);
    const centre = add(base, [0, 0, 240]);
    const up = norm([-0.62, -0.5, 0.6]);
    part([0, -520, 260], 1.2, { idle: moved(0) });
    M.ink = true;
    M.block(sub(centre, scale(up, 60)), [64, 0, 0], [0, 56, 28], scale(up, 34));
    M.ink = false;
    part([-360, -320, 260], 1.35, { idle: moved(0) });
    const far = add(centre, [-230, 60, -70]);
    M.tube([sub(centre, scale(up, 60)), far], 5);
    M.lathe(axis(far, [-0.95, 0.2, -0.2]), [[0, 0], [24, 0], [24, 70], [0, 70]], 16);
    part([360, -320, 260], 1.45, { idle: moved(0) });
    const other = add(centre, [230, 60, -70]);
    M.tube([sub(centre, scale(up, 60)), other], 5);
    M.lathe(axis(other, [0.95, 0.2, -0.2]), [[0, 0], [24, 0], [24, 70], [0, 70]], 16);
    M.tube([sub(centre, scale(up, 60)), add(centre, [20, 150, -210])], 3, 8);
    part([0, -560, 460], 1.6, { idle: moved(0) });
    const dish = axis(sub(centre, scale(up, 30)), up);
    const curve = (r: number, lift: number): [number, number] => [r, (r * r) / 520 + lift];
    M.lathe(dish, [[0, 0], curve(60, 0), curve(120, 0), curve(170, 0), curve(174, 6), curve(120, 8), curve(60, 8), [0, 8]], 56);
    M.tube([add(sub(centre, scale(up, 30)), scale(up, 8)), add(sub(centre, scale(up, 30)), scale(up, 110))], 4, 8);
  }

  // Spotlight: a stage lamp on its stand, which looks up when it's picked
  {
    const base: Vec3 = [310, 0, LOW];
    part([0, -420, 200], 1.8, { idle: moved(1) });
    M.ink = true;
    M.lathe(axis(base, [0, 0, 1]), [[0, 0], [96, 0], [96, 16], [18, 26], [0, 26]], 32);
    M.ink = false;
    M.tube([add(base, [0, 0, 20]), add(base, [0, 0, 250])], 10);
    M.tube([add(base, [-86, 0, 250]), add(base, [86, 0, 250])], 8);
    [-86, 86].forEach((x) => M.tube([add(base, [x, 0, 250]), add(base, [x, 0, 340])], 8));
    const pivot = add(base, [0, 0, 330]);
    const lamp = axis(add(pivot, [0, 90, 0]), [0, -1, 0]);
    const swing = (seconds: number) => ({ offset: out(1, seconds), angle: -0.62 * smooth(forward[1] * 1.4) + 0.12 * forward[1] * Math.sin(seconds * 1.4) });
    part([0, -520, 360], 2, { pivot: [pivot[1], pivot[2]], idle: swing });
    M.ink = true;
    M.lathe(lamp, [[0, 0], [70, 0], [78, 60], [78, 190], [0, 190]], 40);
    M.ink = false;
    M.disc(lamp, 66, 191, 1, 40);
    M.ink = true;
    M.disc(lamp, 30, 192, 1, 24);
    M.ink = false;
  }

  // Pixle: a little stack of instant photos, the top one with its picture
  {
    const base: Vec3 = [-420, 0, HIGH];
    [0.32, -0.2, 0.08].forEach((turn, n) => {
      const c = Math.cos(turn);
      const s = Math.sin(turn);
      const centre = add(base, [n * 6, -n * 4, 6 + n * 13]);
      part([0, -300, 240 + n * 60], 2.3 + n * 0.1, { idle: moved(2) });
      M.block(centre, [118 * c, 118 * s, 0], [-140 * s, 140 * c, 0], [0, 0, 5]);
      if (n === 2) {
        M.ink = true;
        M.block(add(centre, [14 * s, 22 * -c + 44 * c, 6]), [96 * c, 96 * s, 0], [-96 * s, 96 * c, 0], [0, 0, 1]);
      }
    });
  }

  // Seraph: a pair of wings, folded, feathers overlapping
  {
    const base: Vec3 = [0, 0, HIGH];
    part([0, -260, 200], 2.7, { idle: moved(3) });
    M.lathe(axis(base, [0, 0, 1]), [[0, 0], [54, 0], [54, 12], [10, 18], [10, 170], [0, 170]], 24);
    /** A long feather as a thin plate, from its root along an angle. */
    const feather = (root: Vec3, angle: number, length: number, side: number) => {
      const edge = Array.from({ length: 14 }, (_, i): [number, number] => {
        const a = (i / 14) * TAU;
        return [(Math.cos(a) * 0.5 + 0.5) * length, Math.sin(a) * length * 0.2];
      });
      const point = (along: number, across: number, y: number): Vec3 =>
        add(root, [side * (Math.cos(angle) * along - Math.sin(angle) * across), y, Math.sin(angle) * along + Math.cos(angle) * across]);
      M.fan(edge.map(([p, q]) => point(p, q, -7)), [0, -1, 0]);
      M.fan(edge.map(([p, q]) => point(p, q, 7)), [0, 1, 0]);
      edge.forEach(([p, q], i) => {
        const [r, t] = edge[(i + 1) % edge.length];
        const n = norm(sub(point(p, q, 0), point(length / 2, 0, 0)));
        M.quad(point(p, q, -7), point(r, t, -7), point(r, t, 7), point(p, q, 7), n);
      });
    };
    [1, -1].forEach((side) => {
      const spine = add(base, [side * 8, 0, 150]);
      part([side * 300, -200, 300], 2.9, {
        upright: true,
        pivot: [spine[0], spine[1]],
        idle: (seconds) => ({ offset: out(3, seconds), angle: side * forward[3] * (0.2 + 0.16 * Math.sin(seconds * 3.2)) }),
      });
      // Along the arm from the body to the tip, each feather hanging further out than the last
      for (let k = 0; k < 12; k++) {
        const t = k / 11;
        feather(add(spine, [side * t * 210, -k * 4, 40 + t * 190 - t * t * 90]), -1.9 + t * 1.1, 130 + t * 100, side);
      }
    });
  }

  // Downpour: a small cloud that won't stop raining sand
  {
    const base: Vec3 = [420, 0, HIGH];
    const ball = (c: Vec3, r: number) => {
      const steps = 16;
      M.lathe(
        axis(add(c, [0, 0, -r]), [0, 0, 1]),
        Array.from({ length: steps + 1 }, (_, i): [number, number] => {
          const a = (i / steps) * Math.PI;
          return [Math.sin(a) * r, r - Math.cos(a) * r];
        }),
        28
      );
    };
    part([0, -320, 360], 3.1, { idle: moved(4) });
    ([[-70, 0, 300, 76], [24, 16, 322, 96], [108, -6, 292, 66], [10, -26, 284, 64]] as [number, number, number, number][]).forEach(([x, y, z, r]) => ball(add(base, [x, y, z]), r));
    for (let k = 0; k < 6; k++) {
      const x = -96 + k * 40;
      const y = k % 2 ? 14 : -18;
      part([0, 0, 200], 3.3, {
        late: true,
        idle: (seconds) => {
          const fall = (seconds * 0.7 + k * 0.37) % 1;
          return { offset: add(out(4, seconds), [0, 0, -fall * 220]), form: Math.min(smooth(fall / 0.12), smooth((1 - fall) / 0.2)) * 1.02 };
        },
      });
      M.ink = true;
      M.lathe(axis(add(base, [x, y, 216]), [0, 0, 1]), [[0, 0], [8, 8], [0, 34]], 10);
    }
  }

  return {
    mesh: M,
    sections,
    camera: { yaw: 0.46, pitch: 0.3 },
    pace: { spread: 0.7, form: 1.1, start: 2, stagger: 0.42, move: 0.5 },
    light: [0.55, -0.5, 0.68],
    hatch: 4.5,
    grains: 170_000,
    flow: 0.7,
    loop: false,
    extent: [[-WIDTH / 2, -DEPTH / 2 - 120, 0], [WIDTH / 2, -DEPTH / 2 - 120, 0]],
    pick: (index) => {
      picked = index;
    },
  };
}
