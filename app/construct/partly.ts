//
//  partly.ts
//  d-exclaimation
//
//  Partly as a V8, sectioned straight across the front cylinders so both banks can be seen meeting at the crank, then running
//

import type { Blueprint, Section } from "./engine";
import { Mesh, TAU, axis, ridged, type Flat, type Vec3 } from "./mesh";

const FORWARD: Vec3 = [1, 0, 0];
const UP: Vec3 = [0, 0, 1];
const S = Math.SQRT1_2;
const BORE = 50;
const THROW = 44;
const ROD = 150;
const DECK = THROW + ROD + 30;
const HEAD = DECK + 86;
const COVER = HEAD + 88;
const CAM = 128;
/** Where the section runs through the block. */
const CUT = 183;
const REAR = -224;
const SPIN = 8;
const LIFT = 12;
const PINS = [-159, -45, 69, 183];
/** A cross-plane crank, each throw a quarter turn from the next. */
const THROWS = [0, TAU / 4, (TAU * 3) / 4, TAU / 2];
const SIDES = [1, -1];
/** The two banks share a crank pin, one rod either side of it. */
const row = (side: number, pin: number) => pin - side * 12;

/** A bank's direction away from the crank, and the direction outward from the valley. */
const rising = (side: number): Flat => [side * S, S];
const outward = (side: number): Flat => [side * S, -S];
/** A point on a bank, measured up its cylinders and outward across them. */
const bank = (side: number, up: number, out: number): Flat => [side * S * (up + out), S * (up - out)];
const onBank = (side: number, points: Flat[]) => points.map(([up, out]) => bank(side, up, out));

const crankPin = (angle: number): Flat => [-THROW * Math.sin(angle), THROW * Math.cos(angle)];

/** Where the wrist pin sits in its bore for a crank angle. */
function wrist(side: number, angle: number): Flat {
  const [py, pz] = crankPin(angle);
  const [ay, az] = rising(side);
  const [ny, nz] = outward(side);
  const along = py * ay + pz * az;
  const off = py * ny + pz * nz;
  const up = along + Math.sqrt(ROD * ROD - off * off);
  return [ay * up, az * up];
}

const circle = (r: number, steps = 32) =>
  Array.from({ length: steps }, (_, i): Flat => [r * Math.cos((i / steps) * TAU), r * Math.sin((i / steps) * TAU)]);

/** Points in the yz plane as an axis along x reads them. */
const facing = (points: Flat[]) => points.map(([y, z]): Flat => [-y, -z]);

/** A rectangle from its low corner and size, as [y, z] points. */
const rectangle = (y: number, z: number, w: number, h: number): Flat[] => [[y, z], [y + w, z], [y + w, z + h], [y, z + h]];

/** A crank web: rounded around the throw, with a counterweight swung out the other way. */
function web(angle: number) {
  const arc = (cz: number, r: number, from: number, to: number, steps: number) =>
    Array.from({ length: steps + 1 }, (_, i): Flat => {
      const a = from + ((to - from) * i) / steps;
      return [r * Math.cos(a), cz + r * Math.sin(a)];
    });
  const [c, q] = [Math.cos(angle), Math.sin(angle)];
  return facing([...arc(THROW, 34, 0, TAU / 2, 12), ...arc(0, 88, TAU * 0.56, TAU * 0.94, 14)].map(([y, z]): Flat => [c * y - q * z, q * y + c * z]));
}

/** A smooth path through points. */
function curve(points: Vec3[], steps = 8) {
  const at = (i: number) => points[Math.min(points.length - 1, Math.max(0, i))];
  return Array.from({ length: (points.length - 1) * steps + 1 }, (_, n): Vec3 => {
    const i = Math.min(points.length - 2, Math.floor(n / steps));
    const t = n / steps - i;
    const [a, b, c, d] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
    return [0, 1, 2].map(
      (k) =>
        0.5 *
        (2 * b[k] +
          (c[k] - a[k]) * t +
          (2 * a[k] - 5 * b[k] + 4 * c[k] - d[k]) * t * t +
          (3 * b[k] - a[k] - 3 * c[k] + d[k]) * t * t * t)
    ) as Vec3;
  });
}

export function partly(): Blueprint {
  const M = new Mesh();
  M.thin = true;
  const sections: Section[] = [];
  const part = (rank: number, offset: Vec3 = [0, 0, 0], rest: Partial<Section> = {}) => {
    M.section = sections.length;
    M.ink = false;
    sections.push({ offset, rank, ...rest });
  };
  const along = (x: number, y = 0, z = 0) => axis([x, y, z], FORWARD);
  const upright = (x: number, z: number, y = 0) => axis([x, y, z], UP);
  const up = (side: number, distance: number): Vec3 => [0, side * S * distance, S * distance];
  /** A flat shape facing the viewer, on or just in front of the section. */
  const plate = (points: Flat[], x = CUT) => M.fan(points.map(([y, z]): Vec3 => [x, y, z]), FORWARD);
  /** The rim where a sheet is sliced through by the section. */
  const rim = (points: Flat[]) => {
    M.ink = true;
    M.prism(along(CUT - 5), facing(points), 6, false);
    M.ink = false;
  };

  // The block: the V itself, cut through the front cylinders
  part(0);
  const shell: Flat[] = [
    [118, -80],
    [118, -30],
    bank(1, 58, 66),
    bank(1, DECK, 66),
    bank(1, DECK, -66),
    [79, 172],
    [-79, 172],
    bank(-1, DECK, -66),
    bank(-1, DECK, 66),
    bank(-1, 58, 66),
    [-118, -30],
    [-118, -80],
  ];
  M.prism(along(REAR), facing(shell), CUT - REAR, false);
  SIDES.forEach((side) => {
    const [ay, az] = rising(side);
    const [ny, nz] = outward(side);
    const centre = row(side, PINS[3]);
    const reach = Math.acos(Math.max(-1, Math.min(1, (CUT - centre) / BORE)));
    M.skin(
      [66, DECK].map((u) =>
        Array.from({ length: 21 }, (_, i): Vec3 => {
          const a = reach + (i / 20) * (TAU - reach * 2);
          const w = BORE * Math.sin(a);
          return [centre + BORE * Math.cos(a), ay * u + ny * w, az * u + nz * w];
        })
      )
    );
    PINS.forEach((pin) => {
      const [y, z] = bank(side, DECK + 0.6, 0);
      M.ink = true;
      M.lathe(axis([row(side, pin), y, z], [0, ay, az]), [[BORE - 2, 0], [BORE + 2, 0]], 36);
      M.ink = false;
    });
    [-120, 0, 110].forEach((x) => {
      const [y, z] = bank(side, 130, 66.5);
      M.lathe(axis([x, y, z], [0, ny, nz]), [[0.5, 0], [20, 0], [20, 2], [0.5, 2]], 18);
    });
  });
  M.ink = true;
  SIDES.forEach((side) => {
    plate(onBank(side, [[58, 52], [DECK, 52], [DECK, 66], [58, 66]]));
    plate(onBank(side, [[58, -52], [DECK, -52], [DECK, -66], [58, -66]]));
    plate([bank(side, 58, 66), bank(side, 58, 52), [side * 96, -80], [side * 118, -80], [side * 118, -30]]);
  });
  plate([[0, 72], [90, 158], [79, 172], [-79, 172], [-90, 158]]);
  M.ink = false;
  SIDES.forEach((side) => {
    plate(onBank(side, [[96, 56], [DECK - 16, 56], [DECK - 16, 62], [96, 62]]), CUT + 0.5);
    plate(onBank(side, [[150, -56], [DECK - 16, -56], [DECK - 16, -62], [150, -62]]), CUT + 0.5);
  });
  plate(circle(34).map(([y, z]): Flat => [y, CAM + z]), CUT + 0.5);

  // The crankshaft swings in from underneath
  part(0.25, [0, 0, -360], { spin: SPIN });
  [-216, -102, 12, 126].forEach((x) => {
    M.lathe(along(x), [[0.5, -14], [30, -14], [30, 14], [0.5, 14]], 24);
  });
  M.lathe(along(-290), [[0.5, 0], [46, 0], [46, 60], [0.5, 60]], 28);
  PINS.forEach((x, p) => {
    const [y, z] = crankPin(THROWS[p]);
    M.lathe(along(x, y, z), [[0.5, -26], [24, -26], [24, 26], [0.5, 26]], 20);
    M.prism(along(x - 44), web(THROWS[p]), 18);
    if (p < PINS.length - 1) M.prism(along(x + 26), web(THROWS[p]), 18);
  });

  // The oil pan goes on under it
  part(0.6, [0, 0, -560]);
  const pan: Flat[] = [[118, -80], [118, -112], [92, -196], [-92, -196], [-118, -112], [-118, -80]];
  M.prism(along(REAR), facing(pan), CUT - REAR, false);
  rim(pan);
  M.fan(pan.map(([y, z]): Vec3 => [REAR, y, z]), [-1, 0, 0]);

  // Eight pistons and rods, dropped down their bores, the two banks sharing each crank pin
  SIDES.forEach((side, s) => {
    PINS.forEach((pin, p) => {
      const home = THROWS[p];
      const x = row(side, pin);
      const small = wrist(side, home);
      const big = crankPin(home);
      const [ay, az] = rising(side);
      const moved = (turned: number): Vec3 => {
        const now = wrist(side, turned * SPIN + home);
        return [0, now[0] - small[0], now[1] - small[1]];
      };
      const flight = up(side, 460 + p * 34);
      part(0.9 + s * 0.2 + p * 0.03, flight, { idle: (_, turned) => ({ offset: moved(turned) }) });
      M.lathe(
        axis([x, small[0], small[1]], [0, ay, az]),
        [[0.5, 26], [42, 30], [BORE - 1, 30], [BORE - 1, 23], [BORE - 3, 23], [BORE - 3, 18], [BORE - 1, 18], [BORE - 1, 13], [BORE - 3, 13], [BORE - 3, 8], [BORE - 1, 8], [BORE - 1, -36], [42, -36]],
        36
      );
      part(0.92 + s * 0.2 + p * 0.03, flight, {
        pivot: small,
        idle: (_, turned) => {
          const angle = turned * SPIN + home;
          const now = wrist(side, angle);
          const throwAt = crankPin(angle);
          return {
            offset: moved(turned),
            angle: Math.atan2(throwAt[1] - now[1], throwAt[0] - now[0]) - Math.atan2(big[1] - small[1], big[0] - small[0]),
          };
        },
      });
      const length = Math.hypot(big[0] - small[0], big[1] - small[1]);
      const across: Flat = [-(big[1] - small[1]) / length, (big[0] - small[0]) / length];
      const beam = (t: number, w: number): Flat => [
        small[0] + (big[0] - small[0]) * t + across[0] * w,
        small[1] + (big[1] - small[1]) * t + across[1] * w,
      ];
      M.lathe(along(x, small[0], small[1]), [[12, -8], [22, -8], [22, 8], [12, 8], [12, -8]], 18);
      M.lathe(along(x, big[0], big[1]), [[25, -9], [38, -9], [38, 9], [25, 9], [25, -9]], 22);
      M.prism(along(x - 5), facing([beam(0.12, -11), beam(0.12, 11), beam(0.76, 19), beam(0.76, -19)]), 10);
    });
  });

  // The camshaft slides in along the valley, with a lobe for each lifter at the front
  const gear = (side: number) => {
    const rocker = bank(side, HEAD + 54, -46);
    const distance = Math.hypot(rocker[0], rocker[1] - CAM);
    const push: Flat = [rocker[0] / distance, (rocker[1] - CAM) / distance];
    const stroke = side > 0 ? -TAU * 0.375 : -TAU * 0.125;
    const facingCam = Math.atan2(push[1], push[0]);
    const lobe = facingCam - (stroke - THROWS[3]) / 2;
    return { rocker, distance, push, facingCam, lobe, x: CUT + (side > 0 ? 8 : 28) };
  };
  const lifted = (side: number, turned: number) => {
    const { lobe, facingCam } = gear(side);
    return LIFT * Math.min(1, turned * 2) * Math.pow(Math.max(0, Math.cos(lobe + (turned * SPIN) / 2 - facingCam)), 3);
  };
  part(1.3, [640, 0, 0], { spin: SPIN / 2, pivot: [0, CAM] });
  M.lathe(along(REAR, 0, CAM), [[0.5, 0], [15, 0], [15, CUT - REAR + 44], [0.5, CUT - REAR + 44]], 20);
  SIDES.forEach((side) => {
    const { lobe, x } = gear(side);
    const edge = Array.from({ length: 40 }, (_, i): Flat => {
      const a = (i / 40) * TAU;
      const r = 24 + LIFT * Math.pow(Math.max(0, Math.cos(a - lobe)), 3);
      return [r * Math.cos(a), r * Math.sin(a)];
    });
    M.prism(along(x - 7, 0, CAM), facing(edge), 14);
  });

  // The heads bolt down onto each bank, cut through the chamber and the ports
  SIDES.forEach((side, s) => {
    part(1.5 + s * 0.05, up(side, 340));
    const head = onBank(side, [[DECK, -70], [DECK, 84], [DECK + 62, 96], [HEAD, 82], [HEAD, -60], [DECK + 44, -78]]);
    M.prism(along(REAR), facing(head), CUT - REAR);
    M.ink = true;
    plate(head, CUT + 0.5);
    M.ink = false;
    plate(onBank(side, [[DECK, -34], [DECK, 34], [DECK + 16, 24], [DECK + 16, -24]]), CUT + 1);
    PINS.forEach((pin) => {
      const [y, z] = bank(side, DECK + 44, 96);
      M.lathe(axis([row(side, pin), y, z], [0, side * S, -S]), [[9, 0], [9, 26], [5, 26], [5, 40]], 12);
    });
  });

  // Lifters and pushrods, valves and springs, and the rockers tying them together
  SIDES.forEach((side, s) => {
    const { rocker, distance, push, x } = gear(side);
    const camAt = (t: number): Flat => [push[0] * t, CAM + push[1] * t];
    const fulcrum = bank(side, HEAD + 64, -22);
    const tip = bank(side, HEAD + 54, 0);
    const [ay, az] = rising(side);
    const toPush: Flat = [rocker[0] - fulcrum[0], rocker[1] - fulcrum[1]];
    const toTip: Flat = [tip[0] - fulcrum[0], tip[1] - fulcrum[1]];
    const swing = 1 / (-toPush[1] * push[0] + toPush[0] * push[1]);
    const ratio = Math.abs((-toTip[1] * ay + toTip[0] * az) * swing);
    const valve = (turned: number) => ratio * lifted(side, turned);

    const [ly, lz] = camAt(28);
    part(1.8 + s * 0.01, [320, side * 120, 200], {
      idle: (_, turned) => ({ offset: [0, push[0] * lifted(side, turned), push[1] * lifted(side, turned)] }),
    });
    M.lathe(axis([x, ly, lz], [0, push[0], push[1]]), [[0.5, 0], [13, 0], [13, 38], [0.5, 38]], 14);
    M.tube([[x, ...camAt(62)], [x, ...camAt(distance)]], 5, 8);

    const [vy, vz] = bank(side, DECK + 3, 0);
    part(1.85 + s * 0.01, up(side, 560), { idle: (_, turned) => ({ offset: [0, -ay * valve(turned), -az * valve(turned)] }) });
    M.lathe(axis([x, vy, vz], [0, ay, az]), [[0.5, 0], [26, 0], [26, 3], [9, 16], [6, 30], [6, 132], [17, 132], [17, 139], [0.5, 139]], 18);

    const seat = bank(side, HEAD, 0);
    part(1.9 + s * 0.01, up(side, 560), {
      pivot: seat,
      tilt: -side * (TAU / 8),
      idle: (_, turned) => ({ squash: 1 - valve(turned) / 44 }),
    });
    M.coil(upright(x, seat[1], seat[0]), 17, 44, 4, 2.2);

    part(1.95 + s * 0.01, up(side, 620), { pivot: fulcrum, idle: (_, turned) => ({ angle: swing * lifted(side, turned) }) });
    M.prism(along(x - 8), facing(onBank(side, [[HEAD + 49, -52], [HEAD + 49, 7], [HEAD + 60, 7], [HEAD + 74, -22], [HEAD + 60, -52]])), 16);
    M.lathe(along(x - 12, fulcrum[0], fulcrum[1]), [[0.5, 0], [9, 0], [9, 24], [0.5, 24]], 14);
  });

  // Rocker covers, ribbed along their length, left open at the section
  SIDES.forEach((side, s) => {
    part(2.1 + s * 0.04, up(side, 700));
    const cover = onBank(side, [[HEAD, 82], [HEAD + 48, 76], [COVER, 56], [COVER, -32], [HEAD + 48, -56], [HEAD, -60]]);
    M.prism(along(REAR), facing(cover), CUT - REAR, false);
    M.fan(cover.map(([y, z]): Vec3 => [REAR, y, z]), [-1, 0, 0]);
    rim(cover);
    [-16, 4, 24, 44].forEach((w) => {
      M.prism(along(REAR + 24), facing(onBank(side, [[COVER, w - 3], [COVER + 8, w - 3], [COVER + 8, w + 3], [COVER, w + 3]])), CUT - REAR - 48);
    });
  });

  // The intake down the valley, carburettor on top of it, and the big round air cleaner over everything
  part(2.3, [0, 0, 460]);
  const intake: Flat[] = [[-140, 232], [140, 232], [122, 288], [64, 312], [-64, 312], [-122, 288]];
  M.prism(along(REAR + 10), facing(intake), CUT - REAR - 10);
  M.ink = true;
  plate(intake, CUT + 0.5);
  M.ink = false;
  plate(rectangle(-96, 262, 192, 22), CUT + 1);
  part(2.4, [0, 0, 620]);
  M.box(-72, -62, 312, 124, 124, 34);
  part(2.5, [0, 0, 780]);
  M.lathe(upright(-10, 346), [[0.5, 0], [176, 0], [176, 6], [160, 6]], 56);
  M.prism(upright(-10, 352), ridged(164, 2.5, 96), 50);
  M.lathe(upright(-10, 402), [[160, 0], [178, 0], [178, 6], [120, 16], [0.5, 18]], 56);
  M.prism(upright(-10, 420), ridged(16, 3, 8), 16);

  // Distributor at the back
  part(2.6, [-260, 0, 420]);
  M.lathe(upright(-196, 312), [[0.5, 0], [24, 0], [24, 44], [40, 54], [40, 84], [14, 96], [0.5, 96]], 28);
  // Headers sweeping out of each bank into a collector, the flywheel behind
  SIDES.forEach((side, s) => {
    part(2.8 + s * 0.05, [0, side * 460, 0]);
    const [ny, nz] = outward(side);
    PINS.forEach((pin, p) => {
      const [y, z] = bank(side, DECK + 22, 96);
      const x = row(side, pin);
      M.tube(
        curve([
          [x, y, z],
          [x, y + ny * 56, z + nz * 56],
          [x * 0.7 - 50, side * 338, z - 110],
          [-186 - p * 3, side * (332 + (p - 1.5) * 9), -64 + (p - 1.5) * 9],
        ]),
        17,
        12
      );
    });
    M.lathe(along(-360, side * 334, -66), [[0.5, 0], [28, 0], [28, 120], [40, 150], [40, 176], [0.5, 176]], 24);
  });
  part(3, [-560, 0, 0], { spin: SPIN });
  M.prism(along(-280), ridged(180, 5, 90), 10);
  M.lathe(along(-268), [[46, 0], [168, 0], [168, 14], [140, 14], [140, 6], [46, 6]], 60);
  for (let b = 0; b < 6; b++) {
    const a = ((b + 0.5) / 6) * TAU;
    M.prism(along(-254, 96 * Math.cos(a), 96 * Math.sin(a)), circle(7, 8), 6);
  }

  return {
    mesh: M,
    sections,
    camera: { yaw: Math.PI - 1.2, pitch: 0.36 },
    pace: { spread: 0.8, form: 1.1, start: 2, stagger: 1.6, move: 0.42 },
    light: [0.7, 0.42, 0.58],
    hatch: 4.5,
    grains: 240_000,
    flow: 0.7,
    loop: false,
  };
}
