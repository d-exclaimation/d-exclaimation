//
//  drifter.ts
//  d-exclaimation
//
//  The Drifter game's first fight, on the beat: the Walker has fired Dead Aim from its mark, braced and kicked back, and its round has blown up the floor
//  a stride behind him as he runs across its line. Every piece is one of the game's own drawings (public/drifter, copied
//  from the game as they are) given depth pixel for pixel, so face on each is exactly as it's drawn. They stand the way the game stands them, seen from
//  where its camera sees them, and the only change is colour: what's darkest in a drawing is inked onto its face, and the rest is paper
//

import type { Blueprint, Section } from "./engine";
import { Mesh, add, cross, norm, scale, sub, type Vec3 } from "./mesh";
import { brightness } from "./voxels";

/** Construct units per metre. */
const U = 100;

// The game's own numbers: its page and camera, where the fight stands them, and how the Walker stands and aims (render/book.ts, game/battle.ts,
// game/walker.ts, game/hooded.ts)
const PIXELS = 29.5;
const PITCH = (30 * Math.PI) / 180;
const VIEW = [0, Math.sin(PITCH), Math.cos(PITCH)];
const MARKS = { him: [-3.4, 0, 2.4], it: [3.2, 0, -2.2] };
/** How far across its line he's run from his mark, and how far behind him its round lands. */
const RAN = 3.0;
const BEHIND = 2.7;
const HIGH = 2.4;
const HIPS = { back: -1.5, front: 1.15, high: 4.2, near: 0.35, far: -0.35 };
const FEET = { back: -3.3, front: 3, near: 0.8, far: -0.9 };
const ANKLE = 49;
const SLUNG = [8, 34];
const DOWNMOST = -0.65;
const UPMOST = 0.3;
const SHOULDER = [44, 70];
const ARM_HANGS = -0.35;
const DROOP = -0.45;
/** Firing: how far down it's braced, in metres, and how far its hull and rifle are kicked back, in pixels. */
const BRACES = 0.75;
const KICK = { hull: 5, rifle: 10 };
/** His run, drawn going down and right of the page, which takes him across its line, the frame at full stride. */
const SOUTHEAST = 1;
const STRIDE = 2;

/** Where its round lands it crashes as the game's does (walker.ts `crash`, rubble.ts): the blast, and a dust either side of it rolling out along the floor,
 *  how far out, how fast for a round's weight, and each one's strip: its size, how fast it plays, and the pixel it goes off from. This is the blast at its
 *  fireball, and the dust as far as it's got by then. */
const BLAST = { w: 122, h: 76, fps: 22, from: [61, 70], frame: 2 };
const DUST = { w: 101, h: 64, fps: 14, from: [6, 56], out: 0.6, rolls: 2.5 * 0.9 };

/** What a pixel washes to past paper: ink, or one of the page's own colours, counted from 1 as the page counts them. */
const INK = -1;
const RED = 1;
const ORANGE = 2;
const YELLOW = 3;
const GREEN = 4;
const BLUE = 5;
const MINT = 6;
const GREY = 7;
const SMOKE = 8;

/** Where the light falls from. */
const LIGHT: Vec3 = [-0.45, -0.7, 0.55];

/** How deep each drawing is made, in metres. */
const DEEP = { hull: 1.7, boot: 0.9, block: 1.2, upper: 0.35, lower: 0.45, rifle: 0.32, gatling: 0.55, him: 0.6, blast: 0.9, dust: 0.5 };

type Frame = number[];
type Sheet = { pixels: Uint8ClampedArray; width: number };
type Point = [number, number, number];
type Flat = [number, number];

/** Where a point in the game's room is on its page, in its pixels: across, and up the page. */
const onPage = ([x, y, z]: Point): Flat => [x * PIXELS, (y * VIEW[2] - z * VIEW[1]) * PIXELS];
/** A point in the game's room in the construct's: the game stands things up y with its camera out along +z. */
const room = ([x, y, z]: Point): Vec3 => [x * U, -z * U, y * U];

async function sheet(path: string): Promise<Sheet> {
  const image = await createImageBitmap(await (await fetch(path)).blob());
  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  const context = canvas.getContext("2d")!;
  context.drawImage(image, 0, 0);
  return { pixels: context.getImageData(0, 0, image.width, image.height).data, width: image.width };
}

export async function drifter(): Promise<Blueprint> {
  const [hooded, walker, blast, dust, frames, parts] = await Promise.all([
    sheet("/drifter/hooded/atlas.png"),
    sheet("/drifter/walker/parts.png"),
    sheet("/drifter/fx/blast.png"),
    sheet("/drifter/fx/dust.png"),
    fetch("/drifter/hooded/frames.json").then((r) => r.json()),
    fetch("/drifter/walker/parts.json").then((r) => r.json() as Promise<{ pieces: Record<string, { frames: Frame[]; steps?: number; length?: number }> }>),
  ]);
  const M = new Mesh();
  const sections: Section[] = [];
  const toward: Vec3 = [0, -VIEW[2], VIEW[1]];
  const right: Vec3 = [U / PIXELS, 0, 0];
  const up = room([0, VIEW[2] / PIXELS, -VIEW[1] / PIXELS]);
  // How far a face leans off the light for each step of tone, turned away from it but still toward the camera, so the page hatches it that much and
  // no step is far enough from the next to draw a crease between them
  const sun = norm(LIGHT);
  const facing = sun[0] * toward[0] + sun[1] * toward[1] + sun[2] * toward[2];
  const away = norm(scale(sub(sun, scale(toward, facing)), -1));
  const LEANS = [0, 0.55, 0.81, 1.06].map((turn): Vec3 => norm(add(scale(toward, Math.cos(turn)), scale(away, Math.sin(turn)))));

  /** A drawing given depth, pixel for pixel: its pixels as a solid through `near`, with its pixel (`px`, `py`) on page pixel `at`, turned over if `flip`,
   *  every step of its outline a step of the solid, and its dark pixels inked on its face where they are. The rest is drawn in pencil, hatched as dark as
   *  the drawing is there, over what colour it keeps in the page's own: his navy body grey, and a crash's fire orange, its smoke and dust the teal grey
   *  they are and its lightning mint, the fire and the lightning left clean. */
  const solid = (from: Sheet, [x, y, w, h]: Frame, [px, py]: Frame, flip: boolean, near: Point, at: Flat, deep: number, look?: "him" | "crash" | "sketch") => {
    const [nx, ny] = onPage(near);
    const origin = room(near);
    const pixel = (i: number, j: number) => ((y + j) * from.width + x + i) * 4;
    const solidAt = (i: number, j: number) => i >= 0 && j >= 0 && i < w && j < h && from.pixels[pixel(i, j) + 3] > 127;
    /** What a pixel washes to: ink if it's near black, then by what the drawing is, otherwise the nearest of the page's colours if it's a strong one, or paper. */
    const wash = (i: number, j: number) => {
      const p = pixel(i, j);
      const [r, g, b] = [from.pixels[p], from.pixels[p + 1], from.pixels[p + 2]];
      const light = brightness((r << 16) | (g << 8) | b);
      if (light < 0.12) return INK;
      if (look === "sketch") return 0;
      if (look === "him") return light < 0.4 && b >= r ? GREY : 0;
      const most = Math.max(r, g, b);
      const spread = most - Math.min(r, g, b);
      const hue = spread ? (((most === r ? (g - b) / spread : most === g ? 2 + (b - r) / spread : 4 + (r - g) / spread) * 60) + 360) % 360 : 0;
      if (look === "crash") return hue < 45 && spread / most > 0.45 ? ORANGE : light < 0.6 ? SMOKE : spread / most > 0.15 ? MINT : 0;
      if (spread / (most || 1) < 0.45 || light < 0.3) return 0;
      return hue < 15 || hue >= 330 ? RED : hue < 45 ? ORANGE : hue < 70 ? YELLOW : hue < 150 ? GREEN : hue < 200 ? MINT : hue < 260 ? BLUE : 0;
    };
    // A corner of the drawing's pixel grid, on the page and out toward the camera by `depth`
    const put = (i: number, j: number, depth: number): Vec3 => {
      const across = (flip ? px - i : i - px) + at[0] - nx;
      const high = py - j + at[1] - ny;
      return [origin[0] + right[0] * across + toward[0] * depth, origin[1] + up[1] * high + toward[1] * depth, origin[2] + up[2] * high + toward[2] * depth];
    };
    const half = (deep * U) / 2;
    const sideways = norm(right);
    const upward = norm(up);
    /** How dark a pixel is drawn in hatching, if this is drawn that way, as one of the steps of `LEANS`. */
    const tone = (i: number, j: number) => {
      if (!look || (look === "crash" && (wash(i, j) === ORANGE || wash(i, j) === MINT))) return 0;
      const p = pixel(i, j);
      const light = brightness((from.pixels[p] << 16) | (from.pixels[p + 1] << 8) | from.pixels[p + 2]);
      return light >= 0.6 ? 0 : light >= 0.45 ? 1 : light >= 0.3 ? 2 : 3;
    };
    /** A flat face from pixel corner (i0, j0) to (i1, j1), at a depth, facing the camera or away, its front leant off the light as far as its tone says. */
    const face = (i0: number, i1: number, j: number, depth: number, front: boolean, shade = 0) => {
      const [a, b] = flip ? [i1, i0] : [i0, i1];
      const corners = [put(a, j + 1, depth), put(b, j + 1, depth), put(b, j, depth), put(a, j, depth)];
      if (front) M.quad(corners[0], corners[1], corners[2], corners[3], LEANS[shade]);
      else M.quad(corners[3], corners[2], corners[1], corners[0], scale(toward, -1));
    };
    /** A wall along one pixel edge, from the back to the front, facing out from the pixel. */
    const wall = (p: Vec3, q: Vec3, out: Vec3) => {
      const [a, b] = norm(cross(sub(q, p), toward)).every((v, k) => Math.abs(v - out[k]) < 1e-6) ? [p, q] : [q, p];
      M.quad(add(a, scale(toward, -half)), add(b, scale(toward, -half)), add(b, scale(toward, half)), add(a, scale(toward, half)), out);
    };
    for (let j = 0; j < h; j++) {
      // Its faces, a run of pixels at a time, then its ink and its fire over the front
      for (const shade of [0, INK, RED, ORANGE, YELLOW, GREEN, BLUE, MINT, GREY, SMOKE]) {
        M.ink = shade === INK;
        M.paint = shade > 0 ? shade : 0;
        let start = -1;
        for (let i = 0; i <= w; i++) {
          // A run breaks where its tone does, so each stretch leans its own way
          const on = i < w && solidAt(i, j) && (shade === 0 || wash(i, j) === shade) && (start < 0 || tone(i, j) === tone(start, j));
          if (start >= 0 && !on) {
            face(start, i, j, shade === 0 ? half : half + 2.5, true, shade === INK ? 0 : tone(start, j));
            if (shade === 0) face(start, i, j, -half, false);
            start = -1;
          }
          if (i < w && solidAt(i, j) && (shade === 0 || wash(i, j) === shade) && start < 0) start = i;
        }
      }
      M.ink = false;
      M.paint = 0;
      // Its sides, wherever a pixel has nothing next to it
      for (let i = 0; i < w; i++) {
        if (!solidAt(i, j)) continue;
        const side = flip ? -1 : 1;
        if (!solidAt(i + 1, j)) wall(put(i + 1, j, 0), put(i + 1, j + 1, 0), scale(sideways, side));
        if (!solidAt(i - 1, j)) wall(put(i, j, 0), put(i, j + 1, 0), scale(sideways, -side));
        if (!solidAt(i, j - 1)) wall(put(i, j, 0), put(i + 1, j, 0), upward);
        if (!solidAt(i, j + 1)) wall(put(i, j + 1, 0), put(i + 1, j + 1, 0), scale(upward, -1));
      }
    }
  };
  const part = (rank: number, offset: Vec3, rest: Partial<Section> = {}) => {
    M.section = sections.length;
    sections.push({ offset, rank, ...rest });
  };

  /** A frame of one of the Walker's pieces, turned to an angle on the page if it turns, as the game's `lay` picks it, with its far end. */
  const lay = (piece: string, angle: number | null, over: boolean) => {
    const { frames: list, steps } = parts.pieces[piece];
    let frame = list[0];
    let flip = over;
    if (angle !== null && steps) {
      const round = Math.atan2(Math.sin(angle), Math.cos(angle));
      const ahead = Math.cos(round) >= 0;
      const a = ahead ? round : Math.atan2(Math.sin(round), -Math.cos(round));
      frame = list[Math.min(list.length - 1, Math.max(0, Math.round(((a + Math.PI / 2) / Math.PI) * steps)))];
      flip = !ahead;
    }
    return { frame, flip, end: [(frame[6] - frame[4]) * (flip ? -1 : 1), frame[5] - frame[7]] as Flat };
  };
  const show = (piece: ReturnType<typeof lay>, near: Point, at: Flat, deep: number) => solid(walker, piece.frame.slice(0, 4), piece.frame.slice(4, 6), piece.flip, near, at, deep, "sketch");

  // ---- The Walker on its mark, facing him, braced down and kicked back by its shot
  const it = MARKS.it as Point;
  const stood = MARKS.him as Point;
  const face = stood[0] < it[0] ? -1 : 1;
  const over = face < 0;
  const high = HIGH - BRACES;
  const base = onPage(it);
  const bottom: Flat = [base[0] - KICK.hull * face, base[1] + high * PIXELS * VIEW[2]];
  const lift = (y: number): Point => [it[0], y, it[2]];
  const heaves = (seconds: number) => ({ offset: [0, 0, 4 * Math.sin(seconds * 0.9)] as Vec3 });

  // Its legs, from its feet up, each strut turned to reach from its hip to its ankle the way the game bends them
  const legs: ["back" | "front", boolean][] = [["back", false], ["front", false], ["back", true], ["front", true]];
  legs.forEach(([side, near], n) => {
    const hipAt: Point = [it[0] + HIPS[side] * face, high - HIGH + HIPS.high, it[2] + (near ? HIPS.near : HIPS.far)];
    const page = onPage(hipAt);
    const hip: Flat = [page[0] - KICK.hull * face, page[1]];
    const block = side === "front" && near;
    const footAt: Point = [it[0] + FEET[side] * face, 0, it[2] + (near ? FEET.near : FEET.far)];
    const foot = onPage(footAt);
    const ankle: Flat = [foot[0], foot[1] + ANKLE];
    const upper = parts.pieces.upper.length ?? 32;
    const lower = parts.pieces.lower.length ?? 28;
    const [dx, dy] = [ankle[0] - hip[0], ankle[1] - hip[1]];
    const d = Math.min(upper + lower - 0.5, Math.max(Math.abs(upper - lower) + 1, Math.hypot(dx, dy)));
    const out = dx === 0 ? face : Math.sign(dx);
    const bend = Math.acos(Math.min(1, Math.max(-1, (upper * upper + d * d - lower * lower) / (2 * upper * d))));
    const thigh = lay("upper", Math.atan2(dy, dx) + out * bend, false);
    const knee: Flat = [hip[0] + thigh.end[0], hip[1] + thigh.end[1]];
    const shin = lay("lower", Math.atan2(ankle[1] - knee[1], ankle[0] - knee[0]), false);
    part(n * 0.1, [0, 0, -140]);
    show(lay(block ? "block" : "boot", null, over), footAt, foot, block ? DEEP.block : DEEP.boot);
    part(0.45 + n * 0.1, [out * 140, 0, 20]);
    show(shin, hipAt, knee, DEEP.lower);
    part(0.9 + n * 0.1, [out * 180, 0, 140]);
    show(thigh, hipAt, hip, DEEP.upper);
  });

  // Its hull, over its legs
  part(1.5, [0, 0, 300], { idle: heaves });
  show(lay("hull", null, over), lift(high), bottom, DEEP.hull);

  // Where he's run to, across its line from his mark, and where its round lands, a stride behind him
  const across = norm([stood[2] - it[2], 0, -(stood[0] - it[0])]);
  const ran: Point = [stood[0] + across[0] * RAN, 0, stood[2] + across[2] * RAN];
  const landed: Point = [ran[0] - across[0] * BEHIND, 0, ran[2] - across[2] * BEHIND];

  // Its rifle, slung under its near side, held on where it fired and kicked back by the round
  const him = onPage(landed);
  const hung: Flat = [bottom[0] + SLUNG[0] * face, bottom[1] + SLUNG[1]];
  const aim = Math.min(UPMOST, Math.max(DOWNMOST, Math.atan2(him[1] - hung[1], Math.max(20, (him[0] - hung[0]) * face))));
  const angle = over ? Math.PI - aim : aim;
  const slung: Flat = [hung[0] - Math.cos(angle) * KICK.rifle, hung[1] - Math.sin(angle) * KICK.rifle];
  const rifle = lay("rifle", angle, false);
  const rifleAt: Point = [it[0], high + SLUNG[1] / (PIXELS * VIEW[2]), it[2] + DEEP.hull / 2 + DEEP.rifle / 2];
  part(2.1, [face * 260, 0, 60], { idle: heaves });
  show(rifle, rifleAt, slung, DEEP.rifle);

  // Its gatling, hanging off its front on its broken arm
  const shoulderAt: Point = [it[0], high + SHOULDER[1] / (PIXELS * VIEW[2]), it[2] + 0.55];
  const shoulder: Flat = [bottom[0] + SHOULDER[0] * face, bottom[1] + SHOULDER[1]];
  const arm = lay("lower", over ? Math.PI - ARM_HANGS : ARM_HANGS, false);
  part(2.5, [face * 220, 0, 120], { idle: heaves });
  show(arm, shoulderAt, shoulder, DEEP.lower);
  const joint: Flat = [shoulder[0] + arm.end[0], shoulder[1] + arm.end[1]];
  part(2.7, [face * 260, 0, 80], { idle: heaves });
  show(lay("gatling", over ? Math.PI - DROOP : DROOP, false), shoulderAt, joint, DEEP.gatling);

  // Where its round's landed at his heels, it crashes as the game's does, going off as the construct is whole
  const age = BLAST.frame / BLAST.fps;
  part(3.6, [0, 0, 0], { late: true });
  solid(blast, [BLAST.frame * BLAST.w, 0, BLAST.w, BLAST.h], BLAST.from, false, landed, onPage(landed), DEEP.blast, "crash");
  for (const way of [-1, 1]) {
    const rolled: Point = [landed[0] + way * (DUST.out + DUST.rolls * age), 0, landed[2]];
    const frame = Math.floor(age * DUST.fps);
    part(3.65, [0, 0, 0], { late: true });
    solid(dust, [frame * DUST.w, 0, DUST.w, DUST.h], DUST.from, way < 0, rolled, onPage(rolled), DEEP.dust, "crash");
  }

  // ---- Him, running across its line, a stride ahead of where it's landed
  const strip = frames.body.animations.run.strips[SOUTHEAST];
  part(3.2, [0, 0, 200]);
  solid(hooded, [strip.x + STRIDE * strip.w, strip.y, strip.w, strip.h], strip.feet, false, ran, onPage(ran), DEEP.him, "him");

  return {
    mesh: M,
    sections,
    camera: { yaw: 0.22, pitch: PITCH },
    pace: { spread: 0.7, form: 1.1, start: 2, stagger: 0.5, move: 0.5 },
    light: LIGHT,
    hatch: 4.5,
    grains: 200_000,
    flow: 0.7,
    loop: false,
  };
}
