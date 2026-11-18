//
//  drifter.ts
//  d-exclaimation
//
//  The Drifter game, five ways, each going to sand as the next comes out of it: three frames of the two of them fighting the Heart Hoarder as the game
//  draws them, her Cut, its spin into him, and his Star Blast fired from the cannon he's built over his head; and between the fights, the cutscenes:
//  the city seen whole from the colony's height with her looking out over it, and her close up looking at him after the Walker's down. Every piece
//  is one of the game's own drawings (public/drifter, copied from the game as they are) given depth pixel for pixel, so face on each is exactly as
//  it's drawn, and his cannon is the game's own model of it (model/cannon.ts, read off the game opened as it fires), built part by part as he
//  builds it. The fights stand as the game stands them, seen from where its camera sees them, and the only change is colour: what's darkest in a
//  drawing is inked onto its face, the rest is drawn in pencil as dark as the drawing is there, and the only colour kept is the game's red, with
//  his grey
//

import type { Blueprint, Section } from "./engine";
import { Mesh, add, axis, cross, norm, scale, sub, type Vec3 } from "./mesh";
import { brightness } from "./voxels";

/** Construct units per metre. */
const U = 100;

// The game's own page and camera (render/book.ts)
const PIXELS = 29.5;
const PITCH = (30 * Math.PI) / 180;
const VIEW: Point = [0, Math.sin(PITCH), Math.cos(PITCH)];

/** How a drawing's colours wash: as him, her, or the Hoarder, or as a plate. */
type Look = "him" | "her" | "it" | "plate";
type Point = [number, number, number];
type Flat = [number, number];

/** A drawing the game laid: the sheet, the rectangle on it, whether it's turned over, where it stands in the room, its box on the page round that
 *  point, how deep it's made, and how it washes. */
type Card = { sheet: string; frame: number[]; flip: boolean; at: Point; box: number[]; deep: number; look: Look };
/** A frame of the fight, read off the game's book as it laid each drawing: how big its page was, in its pixels, where the room's middle was on it
 *  then, what it laid, and his cannon if it's up: its model, where its heart is, and what it's firing on. */
type Frame = { size: Flat; middle: Flat; cards: Card[]; cannon?: { model: string; heart: Point; on: Point } };

/** Her Cut (her press, then cut, the game's `?scene=pick&them=hoarder&duo`): its arc right through the Hoarder, him out in front. */
const CUT: Frame = {
  size: [424, 339],
  middle: [141, 222],
  cards: [
    { sheet: "drifter/atlas.png", frame: [1338, 266, 33, 62], flip: false, at: [3.884, 0, 5.816], box: [-17, 16, -1, 61], deep: 0.6, look: "him" },
    { sheet: "eleanor/anim.png", frame: [220, 1557, 110, 129], flip: false, at: [1.773, 0, -1.254], box: [-45, 65, -33, 96], deep: 0.6, look: "her" },
    { sheet: "hoarder/frames.png", frame: [549, 1, 136, 119], flip: false, at: [3.2, 0, -2.2], box: [-68, 68, -1, 118], deep: 1, look: "it" },
  ],
};
/** It spins into him (its "Move Attack"), its sweep round it, as he goes into his roll out of it, her on its far side with her sword out. */
const STRIKE: Frame = {
  size: [424, 339],
  middle: [272, 193],
  cards: [
    { sheet: "drifter/atlas.png", frame: [992, 266, 56, 62], flip: false, at: [-3.466, 0, -0.58], box: [-34, 22, -2, 60], deep: 0.6, look: "him" },
    { sheet: "eleanor/anim.png", frame: [0, 3322, 88, 67], flip: true, at: [1.762, 0, -1.246], box: [-49, 39, -1, 66], deep: 0.6, look: "her" },
    { sheet: "hoarder/frames.png", frame: [1248, 320, 157, 116], flip: true, at: [-1.199, 0, 1.675], box: [-82, 75, 6, 122], deep: 1, look: "it" },
  ],
};
/** His Star Blast, its three circles all met: the cannon he built over his head thrown open, its light gone from it right into the Hoarder's
 *  heart, her back behind him. The fight stands its cannon right over him, its heart a way up the page from his feet (its `CANNON.over`), turned
 *  to fire on the Hoarder's eyes, as the game turns its model (game.ts, aimCannon). */
const BLAST: Frame = {
  size: [424, 339],
  middle: [229, 191],
  cards: [
    { sheet: "drifter/atlas.png", frame: [1468, 266, 32, 62], flip: false, at: [-3.4, 0, 2.4], box: [-20, 12, -1, 61], deep: 0.6, look: "him" },
    { sheet: "eleanor/anim.png", frame: [130, 213, 65, 71], flip: false, at: [-6.3, 0, 4.1], box: [-33, 32, -5, 66], deep: 0.6, look: "her" },
    { sheet: "hoarder/frames.png", frame: [895, 1212, 124, 109], flip: true, at: [3.2, 0, -2.2], box: [-62, 62, 0, 109], deep: 1, look: "it" },
  ],
  cannon: { model: "fight/cannon.bin", heart: [-3.4, 98 / (PIXELS * VIEW[2]), 2.4], on: [3.2, 2.623, -2.2] },
};
/** The cannon's model: where its blast leaves it, along its length, how wide its light is as it goes, in metres, and the inside of its barrel, its
 *  only part drawn in ink (`model/cannon.ts`). */
const CANNON = { muzzle: 1.47, beam: 0.2, inked: 16 };

/** The city seen whole, from the colony's height (the cutscene `vista`): its plate, and her on it with her back to us (`eleanor-idle`, its last row),
 *  her feet where the shot has them. */
const VISTA = {
  plate: { sheet: "cutscene/vista.png", frame: [0, 0, 600, 340] },
  her: { sheet: "cutscene/eleanor-idle.png", frame: [0, 284, 65, 71], feet: [33, 66], on: [300, 318] },
};
/** Her close up as the cutscenes draw her looking at him (the first frame of `eleanor-look`, the game's tools/source/icon). */
const CLOSE = { sheet: "eleanor/look.png", frame: [0, 0, 169, 202], feet: [84, 202] };
/** How big each of them is made, across and up in the game's pixels, so whichever is up fills the stage the same. */
const FILLS: Flat = [400, 290];

/** In the order they come round: the fights with the cutscenes between them. */
const ORDER = ["cut", "vista", "strike", "blast", "close"] as const;
/** How long each holds once it's whole, how long one takes to go to sand and the next to come out of it, and how far behind the one before each of
 *  its pieces comes, in seconds. */
const SWAP = { hold: 6.5, turn: 1.6, after: 0.1 };

/** What a pixel washes to past paper: ink, the game's red, or his grey, counted from 1 as the page counts its colours. */
const INK = -1;
const RED = 1;
const GREY = 7;

/** Where the light falls from. */
const LIGHT: Vec3 = [-0.45, -0.7, 0.55];

type Sheet = { pixels: Uint8ClampedArray; width: number };

/** Where a point in the game's room is on its page, in its pixels: across, and up the page. */
const onPage = ([x, y, z]: Point): Flat => [x * PIXELS, (y * VIEW[2] - z * VIEW[1]) * PIXELS];
/** A point in the game's room in the construct's: the game stands things up y with its camera out along +z. */
const room = ([x, y, z]: Point): Vec3 => [x * U, -z * U, y * U];
const less = (a: Point, b: Point): Point => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
/** A point straight out toward the game's camera from the middle of the room, so on the page it's still the middle. */
const forward = (metres: number): Point => [VIEW[0] * metres, VIEW[1] * metres, VIEW[2] * metres];
const along = (from: Point, to: Point): Point => {
  const d = less(to, from);
  const l = Math.hypot(...d) || 1;
  return [d[0] / l, d[1] / l, d[2] / l];
};
const crossed = (a: Point, b: Point): Point => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

const smooth = (t: number) => {
  const k = Math.min(1, Math.max(0, t));
  return k * k * (3 - 2 * k);
};
/** How much of one of them is there, given the seconds since the first was whole: each holds, goes to sand, and the next comes out of it. */
const shown = (moment: number, seconds: number) => {
  const { hold, turn } = SWAP;
  const each = hold + 2 * turn;
  const all = ORDER.length * each;
  const t = ((((seconds - moment * each + turn) % all) + all) % all) - turn;
  return t < 0 ? smooth((t + turn) / turn) : t < hold ? 1 : t < hold + turn ? 1 - smooth((t - hold) / turn) : 0;
};

async function sheet(path: string): Promise<Sheet> {
  const image = await createImageBitmap(await (await fetch(`/drifter/${path}`)).blob());
  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  const context = canvas.getContext("2d")!;
  context.drawImage(image, 0, 0);
  return { pixels: context.getImageData(0, 0, image.width, image.height).data, width: image.width };
}

export async function drifter(): Promise<Blueprint> {
  const fights = [CUT, STRIKE, BLAST];
  const paths = [...fights.flatMap((f) => f.cards.map((c) => c.sheet)), VISTA.plate.sheet, VISTA.her.sheet, CLOSE.sheet];
  const [sheets, model] = await Promise.all([
    Promise.all([...new Set(paths)].map(async (path) => [path, await sheet(path)] as const)).then((all) => new Map(all)),
    fetch(`/drifter/${BLAST.cannon!.model}`).then((r) => r.arrayBuffer()),
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
  const sideways = norm(right);
  const upward = norm(up);

  /** A drawing given depth, pixel for pixel: its pixels as a solid through `near`, with its pixel (`px`, `py`) on page pixel `at`, turned over if `flip`,
   *  every step of its outline a step of the solid, and its dark pixels inked on its face where they are. The rest is drawn in pencil, hatched as dark
   *  as the drawing is there, and the only colour it keeps is the game's red, and his navy body as grey. */
  const solid = (from: Sheet, [x, y, w, h]: number[], [px, py]: number[], flip: boolean, near: Point, at: Flat, deep: number, look: Look) => {
    // A plate's painted all in the middle tones, so its steps of dark are its own: its darkest few in a hundred inked, the rest in quarters
    const [inked, ...steps] = look === "plate" ? [0.235, 0.45, 0.36, 0.29] : [0.12, 0.6, 0.45, 0.3];
    const [nx, ny] = onPage(near);
    const origin = room(near);
    const pixel = (i: number, j: number) => ((y + j) * from.width + x + i) * 4;
    const solidAt = (i: number, j: number) => i >= 0 && j >= 0 && i < w && j < h && from.pixels[pixel(i, j) + 3] > 127;
    /** What a pixel washes to: ink if it's near black, his grey if it's his body, the game's red if it's that, or paper. */
    const wash = (i: number, j: number) => {
      const p = pixel(i, j);
      const [r, g, b] = [from.pixels[p], from.pixels[p + 1], from.pixels[p + 2]];
      const light = brightness((r << 16) | (g << 8) | b);
      if (light < inked) return INK;
      if (look === "him") return light < 0.4 && b >= r ? GREY : 0;
      const most = Math.max(r, g, b);
      const spread = most - Math.min(r, g, b);
      const hue = spread ? (((most === r ? (g - b) / spread : most === g ? 2 + (b - r) / spread : 4 + (r - g) / spread) * 60) + 360) % 360 : 0;
      const red = (hue < 15 || hue >= 330) && spread / (most || 1) >= 0.45;
      // The Hoarder's red is deep, its swords and its heart, and what it is
      return red && (look === "it" || light >= 0.3) ? RED : 0;
    };
    // A corner of the drawing's pixel grid, on the page and out toward the camera by `depth`
    const put = (i: number, j: number, depth: number): Vec3 => {
      const across = (flip ? px - i : i - px) + at[0] - nx;
      const high = py - j + at[1] - ny;
      return [origin[0] + right[0] * across + toward[0] * depth, origin[1] + up[1] * high + toward[1] * depth, origin[2] + up[2] * high + toward[2] * depth];
    };
    const half = (deep * U) / 2;
    /** How dark a pixel is drawn in hatching, as one of the steps of `LEANS`. */
    const tone = (i: number, j: number) => {
      const p = pixel(i, j);
      const light = brightness((from.pixels[p] << 16) | (from.pixels[p + 1] << 8) | from.pixels[p + 2]);
      return light >= steps[0] ? 0 : light >= steps[1] ? 1 : light >= steps[2] ? 2 : 3;
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
      // Its faces, a run of pixels at a time, then its ink and its colours over the front
      for (const shade of [0, INK, RED, GREY]) {
        M.ink = shade === INK;
        M.paint = shade > 0 ? shade : 0;
        let start = -1;
        for (let i = 0; i <= w; i++) {
          // A run breaks where its tone does, so each stretch leans its own way
          const on = i < w && solidAt(i, j) && (shade === 0 || wash(i, j) === shade) && (start < 0 || tone(i, j) === tone(start, j));
          if (start >= 0 && !on) {
            face(start, i, j, shade === 0 ? half : half + 2.5, true, shade === INK ? 0 : tone(start, j));
            // (a plate's back is never seen)
            if (shade === 0 && look !== "plate") face(start, i, j, -half, false);
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

  /** One part of the construct: the first one up builds in order and hangs above where it goes till then; the rest wait out of sight for their turn,
   *  each piece a little behind the one before it. */
  const part = (moment: number, n: number) => {
    M.section = sections.length;
    const first = moment === 0;
    const after = n * SWAP.after;
    sections.push({
      offset: first ? [0, 0, 220 + n * 30] : [0, 0, 0],
      rank: first ? n : 100 + sections.length,
      late: !first,
      idle: (seconds) => ({ form: first && seconds < SWAP.hold ? 1 : shown(moment, seconds - after) }),
    });
  };

  /** His cannon as the game's model has it, opened as it fires, a part at a time from its heart out, turned so its length points at what it fires
   *  on; then its light, a shaft from its mouth into that. The model comes as each corner of each triangle, then a byte a triangle: its part, and
   *  whether it's inked. */
  const cannon = ({ heart, on }: NonNullable<Frame["cannon"]>, middle: Point, moment: number, n: number) => {
    const corners = (model.byteLength / 37) * 3;
    const points = new Float32Array(model, 0, corners * 3);
    const marks = new Uint8Array(model, corners * 12);
    const x = along(heart, on);
    const z = along([0, 0, 0], crossed(x, [0, 1, 0]));
    const y = crossed(z, x);
    const placed = (k: number): Vec3 => {
      const [a, b, c] = [points[k * 3], points[k * 3 + 1], points[k * 3 + 2]];
      return room(less([heart[0] + x[0] * a + y[0] * b + z[0] * c, heart[1] + x[1] * a + y[1] * b + z[1] * c, heart[2] + x[2] * a + y[2] * b + z[2] * c], middle));
    };
    const parts = Math.max(...marks.map((m) => m % CANNON.inked)) + 1;
    for (let p = 0; p < parts; p++) {
      part(moment, n++);
      marks.forEach((m, t) => {
        if (m % CANNON.inked !== p) return;
        const [a, b, c] = [placed(t * 3), placed(t * 3 + 1), placed(t * 3 + 2)];
        M.ink = m >= CANNON.inked;
        M.quad(a, b, c, c, norm(cross(sub(b, a), sub(c, a))));
      });
      M.ink = false;
    }
    part(moment, n);
    const mouth: Point = [heart[0] + x[0] * CANNON.muzzle, heart[1] + x[1] * CANNON.muzzle, heart[2] + x[2] * CANNON.muzzle];
    const from = room(less(mouth, middle));
    const to = room(less(on, middle));
    const length = Math.hypot(...sub(to, from));
    M.lathe(axis(from, sub(to, from)), [[0, 0], [CANNON.beam * U, 0], [CANNON.beam * U, length], [0, length]], 24);
  };

  /** A frame of the fight, stood as the game stood it with the middle of its page in the middle of the construct: what it laid, and his cannon if
   *  it's up. */
  const fight = (frame: Frame, moment: number) => {
    const { size, middle: [mx, my], cards } = frame;
    const middle: Point = [(size[0] / 2 - mx) / PIXELS, 0, (size[1] / 2 - my) / (PIXELS * VIEW[1])];
    let n = 0;
    for (const { sheet: path, frame: rect, flip, at, box, deep, look } of cards) {
      part(moment, n++);
      const near = less(at, middle);
      solid(sheets.get(path)!, rect, [flip ? box[1] : -box[0], box[3]], flip, near, onPage(near), deep, look);
    }
    if (frame.cannon) cannon(frame.cannon, middle, moment, n);
  };

  /** Everything made since `begin` brought into the middle of the construct and made as big as `FILLS`, the same all round, so it's the same drawing
   *  only bigger or smaller. */
  const fill = (begin: number) => {
    const P = M.positions;
    const along = (axis: Vec3) => {
      let [low, high] = [Infinity, -Infinity];
      for (let i = begin; i < P.length; i += 3) {
        const d = P[i] * axis[0] + P[i + 1] * axis[1] + P[i + 2] * axis[2];
        [low, high] = [Math.min(low, d), Math.max(high, d)];
      }
      return [low, high];
    };
    const [across, high, deep] = [sideways, upward, toward].map(along);
    const k = Math.min((FILLS[0] * U) / PIXELS / (across[1] - across[0]), (FILLS[1] * U) / PIXELS / (high[1] - high[0]));
    const middle = add(add(scale(sideways, (across[0] + across[1]) / 2), scale(upward, (high[0] + high[1]) / 2)), scale(toward, (deep[0] + deep[1]) / 2));
    for (let i = begin; i < P.length; i += 3) for (let c = 0; c < 3; c++) P[i + c] = (P[i + c] - middle[c]) * k;
  };

  ORDER.forEach((name, moment) => {
    const begin = M.positions.length;
    if (name === "cut") fight(CUT, moment);
    if (name === "strike") fight(STRIKE, moment);
    if (name === "blast") fight(BLAST, moment);
    if (name === "vista") {
      // The plate in the middle, and her out in front of it where she's drawn on it
      const { plate, her } = VISTA;
      const [, , w, h] = plate.frame;
      part(moment, 0);
      solid(sheets.get(plate.sheet)!, plate.frame, [w / 2, h / 2], false, [0, 0, 0], [0, 0], 0.3, "plate");
      part(moment, 1);
      solid(sheets.get(her.sheet)!, her.frame, her.feet, false, forward(1), [her.on[0] - w / 2, h / 2 - her.on[1]], 0.6, "her");
    }
    if (name === "close") {
      part(moment, 0);
      solid(sheets.get(CLOSE.sheet)!, CLOSE.frame, CLOSE.feet, false, [0, 0, 0], [0, 0], 0.8, "her");
    }
    fill(begin);
  });

  return {
    mesh: M,
    sections,
    camera: { yaw: 0.22, pitch: PITCH },
    pace: { spread: 0.7, form: 1.1, start: 2, stagger: 0.5, move: 0.5 },
    light: LIGHT,
    hatch: 4.5,
    grains: 480_000,
    flow: 0.7,
    loop: false,
  };
}
