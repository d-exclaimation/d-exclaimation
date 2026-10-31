//
//  arcade.ts
//  d-exclaimation
//
//  An upright arcade cabinet you can play: as the camera pushes in it comes apart, leaving its buttons and the game as a real thing on a table behind them
//

import type { Blueprint, Section } from "./engine";
import { MemoryGame, ROWS } from "./memory";
import { Mesh, TAU, add, axis, cross, dot, norm, scale, sub, type Vec3 } from "./mesh";
import { LONGEST, SIZE, SnakeGame, type Direction } from "./snake";

type Flat = [number, number];

const WIDE = 210;
/** The cabinet's side as seen from the left, in [y, z]: everything below the control deck, then everything above. */
const LOWER: Flat[] = [[130, 0], [-150, 0], [-150, 440], [-210, 480], [-210, 520], [-100, 560], [130, 560]];
const UPPER: Flat[] = [[130, 560], [-100, 560], [-60, 880], [-150, 930], [-150, 1040], [130, 1040]];
const SCREEN: [Flat, Flat] = [[-92, 620], [-68, 830]];
const CELL = 30;
/** The way round the screen the snake goes, in cells. */
const LOOP: Flat[] = [
  ...Array.from({ length: 7 }, (_, x): Flat => [x, 0]),
  ...Array.from({ length: 4 }, (_, y): Flat => [7, y]),
  ...Array.from({ length: 7 }, (_, x): Flat => [7 - x, 4]),
  ...Array.from({ length: 4 }, (_, y): Flat => [0, 4 - y]),
];
const SNAKE = 6;
const FACING: Record<Direction, number> = { right: 0, up: Math.PI / 2, left: Math.PI, down: -Math.PI / 2 };
/** The table the games are played on, behind the controls, in the cabinet's own units. */
const TABLE = 520;
const TABLE_Y = 250;
const TILE = 30;
const CARD = 116;
/** The site's mark on every card's back. */
const MARK = ["..#..#", "..#..#", "..#..#", "###..#", "#.#..#", "#.#...", "###..#"];
const RED = 1;
const ORANGE = 2;
const YELLOW = 3;
const GREEN = 4;
const BLUE = 5;
const MINT = 6;

const ring = (points: number, radius: (a: number) => number): Flat[] =>
  Array.from({ length: points }, (_, i) => {
    const a = (i / points) * TAU + Math.PI / 2;
    return [Math.cos(a) * radius(a), Math.sin(a) * radius(a)];
  });

export function arcade(): Blueprint {
  const M = new Mesh();
  const sections: Section[] = [];
  const part = (offset: Vec3, rank: number, rest: Partial<Section> = {}) => {
    M.section = sections.length;
    M.ink = false;
    M.paint = 0;
    sections.push({ offset, rank, ...rest });
  };

  // Which game is on, and the two of them, always running underneath
  let mode = -1;
  const snake = new SnakeGame();
  const memory = new MemoryGame();
  let lean = 0;
  let leanedAt = 0;
  let now = 0;
  const tick = (seconds: number) => {
    now = seconds;
    snake.advance(seconds);
    memory.advance(seconds);
  };

  /** A flat outline in [y, z], given thickness across x. */
  const plate = (edge: Flat[], x0: number, x1: number) => {
    const at = (x: number) => edge.map(([y, z]): Vec3 => [x, y, z]);
    M.fan(at(x0), [-1, 0, 0]);
    M.fan(at(x1), [1, 0, 0]);
    const middle = edge.reduce<Flat>((sum, [y, z]) => [sum[0] + y / edge.length, sum[1] + z / edge.length], [0, 0]);
    edge.forEach(([y, z], i) => {
      const [v, w] = edge[(i + 1) % edge.length];
      const n = norm([0, w - z, y - v]);
      M.quad([x0, y, z], [x0, v, w], [x1, v, w], [x1, y, z], dot(n, [0, y - middle[0], z - middle[1]]) < 0 ? scale(n, -1) : n);
    });
  };
  /** One panel across the width of the cabinet, facing the viewer. */
  const panel = ([y0, z0]: Flat, [y1, z1]: Flat, half = WIDE) => {
    const n = norm(cross([1, 0, 0], [0, y1 - y0, z1 - z0]));
    M.quad([-half, y0, z0], [half, y0, z0], [half, y1, z1], [-half, y1, z1], n[1] > 0 ? scale(n, -1) : n);
  };

  // The two black sides come in, then the box between them
  [-1, 1].forEach((side, n) => {
    part([side * 420, 0, 0], n * 0.2);
    M.ink = true;
    const [x0, x1] = side < 0 ? [-WIDE - 24, -WIDE] : [WIDE, WIDE + 24];
    plate(LOWER, x0, x1);
    plate(UPPER, x0, x1);
  });
  part([0, 460, 0], 0.5);
  M.box(-WIDE, -50, 0, WIDE * 2, 180, 1040);

  // The front, from the coin door up
  part([0, -380, 0], 0.9);
  panel([-150, 0], [-150, 440]);
  M.ink = true;
  M.box(-110, -153, 90, 220, 3, 240);
  M.ink = false;
  [-46, 46].forEach((x) => M.box(x - 22, -155, 230, 44, 2, 62));
  M.ink = true;
  [-46, 46].forEach((x) => M.box(x - 3, -156, 242, 6, 1, 38));

  // The control panel, a solid thing of its own once the cabinet has gone from around it
  const deckPart = sections.length;
  part([0, -420, 120], 1.3);
  panel([-150, 440], [-210, 480]);
  panel([-210, 480], [-210, 520]);
  panel([-210, 520], [-100, 560]);
  panel([-100, 560], [-100, 440]);
  panel([-150, 440], [-100, 440]);
  M.ink = true;
  [-WIDE - 14, WIDE].forEach((x) => plate([[-150, 440], [-210, 480], [-210, 520], [-100, 560], [-100, 440]], x, x + 14));

  // The screen in its black surround
  const up = norm([0, SCREEN[1][0] - SCREEN[0][0], SCREEN[1][1] - SCREEN[0][1]]);
  const outward = norm(cross(up, [1, 0, 0]));
  const face = outward[1] > 0 ? scale(outward, -1) : outward;
  part([0, -520, 200], 1.7);
  M.ink = true;
  panel([-100, 560], [-60, 880]);
  part([0, -600, 240], 2);
  M.block(add([0, SCREEN[0][0], SCREEN[0][1]], add(scale(up, 105), scale(face, 8))), [150, 0, 0], scale(up, 105), scale(face, 4));

  // The marquee across the top
  part([0, 0, 420], 2.3);
  M.ink = true;
  panel([-60, 880], [-150, 930]);
  panel([-150, 1040], [130, 1040]);
  part([0, -420, 300], 2.5);
  panel([-150, 930], [-150, 1040]);
  M.ink = true;
  const invader = ["..#.....#..", "...#...#...", "..#######..", ".##.###.##.", "###########", "#.#######.#", "#.#.....#.#", "...##.##..."];
  invader.forEach((row, r) =>
    [...row].forEach((c, k) => {
      if (c === "#") M.box((k - 5.5) * 8, -153, 1020 - r * 8, 8, 2, 8);
    })
  );

  // The controls: four arrow buttons in a row and one big one to start and reset
  const deck = norm(cross([1, 0, 0], [0, 110, 40]));
  const top = deck[2] < 0 ? scale(deck, -1) : deck;
  const along = norm([0, 110, 40]);
  const on = (x: number): Vec3 => add([x, -210, 520], [0, 55, 20]);
  const controlsFrom = sections.length;
  const keys: { at: Vec3; reach: number; act: () => void; downAt: number }[] = [];
  const button = (x: number, reach: number, paint: number, turn: number | null, act: () => void) => {
    const key = { at: on(x), reach, act, downAt: -1 };
    keys.push(key);
    part([0, -260, 300], 2.8 + keys.length * 0.1, {
      idle: () => ({ offset: now - key.downAt < 0.14 ? scale(top, -8) : [0, 0, 0] }),
    });
    M.ink = true;
    M.lathe(axis(key.at, top), [[0, 0], [reach + 6, 0], [reach + 6, 5], [0, 5]], 32);
    M.ink = false;
    M.paint = paint;
    M.lathe(axis(add(key.at, scale(top, 5)), top), [[0, 0], [reach, 0], [reach, 12], [0, 14]], 32);
    if (turn === null) return;
    M.ink = true;
    M.paint = 0;
    const point = (px: number, py: number) => {
      const [c, q] = [Math.cos(turn), Math.sin(turn)];
      return add(add(key.at, scale(top, 20)), add(scale([1, 0, 0], px * c - py * q), scale(along, px * q + py * c)));
    };
    M.fan([point(0, 13), point(-11, -8), point(11, -8)], top);
  };
  button(-172, 27, YELLOW, Math.PI / 2, () => snake.turn("left"));
  button(-112, 27, YELLOW, 0, () => snake.turn("up"));
  button(-52, 27, YELLOW, Math.PI, () => snake.turn("down"));
  button(8, 27, YELLOW, -Math.PI / 2, () => snake.turn("right"));
  button(120, 44, RED, null, () => snake.start());

  // Everything falls to sand as the camera pushes in, but for the controls when the game uses them
  sections.forEach((section, n) => {
    const controls = n === deckPart || n >= controlsFrom;
    const idle = section.idle;
    section.idle = (seconds, turned) => ({
      ...idle?.(seconds, turned),
      form: controls && mode !== 1 ? 1.02 : (1 - Math.min(1, lean * 1.5)) * 1.02,
    });
  });

  /** A point on the glass, from its middle, in screen units right and up. */
  const glass = (x: number, y: number) =>
    add(add([0, SCREEN[0][0], SCREEN[0][1]], scale(face, 13)), add([x, 0, 0], scale(up, 105 + y)));
  const pixel = (at: Vec3, half: number) => M.block(at, [half, 0, 0], scale(up, half), scale(face, 2));
  const onScreen = (wanted: number) => (mode === wanted ? 1.02 : 0);

  // Left alone, it plays itself
  for (let k = 0; k < SNAKE; k++) {
    const rest = LOOP[SNAKE - k];
    const cell = ([x, y]: Flat) => glass((x - 3.5) * CELL, (y - 2) * CELL);
    part([0, -240, 120], 3.5 + k * 0.05, {
      late: true,
      idle: (seconds) => {
        tick(seconds);
        const beat = Math.floor(seconds / 0.24);
        return { offset: sub(cell(LOOP[(SNAKE - k + beat) % LOOP.length]), cell(rest)), form: onScreen(-1) };
      },
    });
    M.ink = true;
    pixel(cell(rest), 12);
  }
  part([0, -240, 120], 3.9, { late: true, idle: () => ({ form: onScreen(-1) }) });
  M.paint = RED;
  pixel(glass(CELL * 0.5, 0), 12);

  // What the screen comes down into: a table the games are played on, and the walls snake has to stay inside
  const shown = (wanted: number) => (mode === wanted ? lean * 1.02 : 0);
  const half = (SIZE * TILE) / 2;
  const left = -half;
  const back = TABLE_Y - half;
  part([0, 0, 0], 4, { late: true, idle: () => ({ form: mode >= 0 ? lean * 1.02 : 0 }) });
  M.box(left, back, TABLE - 16, half * 2, half * 2, 16);
  part([0, 0, 0], 4.05, { late: true, idle: () => ({ form: shown(0) }) });
  M.ink = true;
  [
    [left - 20, back - 20, 20, half * 2 + 40],
    [-left, back - 20, 20, half * 2 + 40],
    [left, back - 20, half * 2, 20],
    [left, back + half * 2, half * 2, 20],
  ].forEach(([x, y, w, d]) => M.box(x, y, TABLE - 16, w, d, 30));

  // Snake: solid blocks on the table, and a ball of food that bobs
  const square = (x: number, y: number): Vec3 => [(x - (SIZE - 1) / 2) * TILE, TABLE_Y + ((SIZE - 1) / 2 - y) * TILE, TABLE];
  const corner = square(0, 0);
  part([0, 0, 0], 4.1, {
    late: true,
    idle: (seconds) => ({ offset: add(sub(square(snake.food.x, snake.food.y), corner), [0, 0, Math.sin(seconds * 3) * 4]), form: shown(0) }),
  });
  M.paint = RED;
  M.lathe(
    axis(add(corner, [0, 0, 3]), [0, 0, 1]),
    Array.from({ length: 13 }, (_, i): Flat => {
      const a = (i / 12) * Math.PI;
      return [Math.sin(a) * 12, 12 - Math.cos(a) * 12];
    }),
    20
  );
  for (let index = 0; index < LONGEST; index++) {
    part([0, 0, 0], 4.2, {
      late: true,
      upright: index === 0,
      pivot: index === 0 ? [corner[0], corner[1]] : undefined,
      idle: () => {
        if (mode !== 0 || index >= snake.cells.length) return { form: 0 };
        const [x, y] = snake.at(index);
        const turn = index === 0 ? { angle: FACING[snake.direction] } : {};
        return { ...turn, offset: sub(square(x, y), corner), form: lean * (1 - snake.gone(index)) * 1.02 };
      },
    });
    M.ink = true;
    M.box(corner[0] - 13, corner[1] - 13, TABLE, 26, 26, index === 0 ? 28 : 24);
    if (index === 0) {
      M.ink = false;
      [-6, 6].forEach((y) => M.box(corner[0] + 5, corner[1] + y - 3, TABLE + 28, 6, 6, 1));
    }
  }

  // Memory: thick cards that lift and turn over when clicked
  const seat = (slot: number): Vec3 => [
    ((slot % ROWS) - (ROWS - 1) / 2) * (CARD + 26),
    TABLE_Y + ((ROWS - 1) / 2 - Math.floor(slot / ROWS)) * (CARD + 26),
    TABLE + 7,
  ];
  const SYMBOLS: Flat[][] = [
    ring(36, () => 40),
    ring(3, () => 50),
    ring(4, () => 48),
    ring(10, (a) => (Math.round((a - Math.PI / 2) / (TAU / 10)) % 2 ? 22 : 52)),
    ring(6, () => 46),
    ring(8, (a) => (Math.round((a - Math.PI / 2) / (TAU / 8)) % 2 ? 24 : 50)),
    ring(40, (a) => 36 + 14 * Math.cos(a * 3)),
    ring(4, (a) => (Math.abs(Math.cos(a * 2)) > 0.5 ? 50 : 22)),
  ];
  const INKS = [RED, ORANGE, YELLOW, GREEN, BLUE, MINT, 0, RED];
  for (let card = 0; card < ROWS * ROWS; card++) {
    const [x, y, z] = seat(card);
    const value = card >> 1;
    part([0, 0, 0], 5, {
      late: true,
      pivot: [y, z],
      idle: () => {
        if (mode !== 1) return { form: 0 };
        const t = memory.turned[card];
        const over = t * t * (3 - 2 * t);
        return { form: lean * 1.02, angle: over * Math.PI, offset: add(sub(seat(memory.slots[card]), [x, y, z]), [0, 0, Math.sin(over * Math.PI) * 90]) };
      },
    });
    M.ink = true;
    M.box(x - CARD / 2, y - CARD / 2, z - 7, CARD, CARD, 14);
    M.ink = false;
    MARK.forEach((row, r) =>
      [...row].forEach((dot, k) => {
        if (dot === "#") M.box(x + (k - 3) * 11, y + (3 - r) * 11 - 5.5, z + 7, 11, 11, 1);
      })
    );
    M.block([x, y, z - 8], [CARD / 2 - 6, 0, 0], [0, CARD / 2 - 6, 0], [0, 0, 1]);
    M.paint = INKS[value];
    M.ink = !INKS[value];
    M.fan(SYMBOLS[value].map(([px, py]): Vec3 => [x + px, y - py, z - 10]), [0, 0, -1]);
  }
  /** Which square of memory's table a point on the canvas lands in, if any. */
  const squareAt = (x: number, y: number, project: (point: Vec3) => [number, number]) =>
    Array.from({ length: ROWS * ROWS }, (_, slot) => slot).find((slot) => {
      const [cx, cy, cz] = seat(slot);
      const h = CARD / 2;
      const edges = ([[-h, -h], [h, -h], [h, h], [-h, h]] as Flat[]).map(([dx, dy]) => project([cx + dx, cy + dy, cz]));
      const sides = edges.map(([ax, ay], i) => {
        const [bx, by] = edges[(i + 1) % edges.length];
        return (bx - ax) * (y - ay) - (by - ay) * (x - ax);
      });
      return sides.every((side) => side <= 0) || sides.every((side) => side >= 0);
    });

  return {
    mesh: M,
    sections,
    camera: { yaw: 0.62, pitch: 0.3 },
    pace: { spread: 0.7, form: 1.1, start: 2, stagger: 0.42, move: 0.5 },
    light: [0.6, -0.5, 0.62],
    hatch: 4.5,
    grains: 130_000,
    flow: 0.7,
    loop: false,
    closeUp: {
      // Snake's shot takes in the controls, and memory's is just the table
      get focus(): Vec3 {
        return mode === 1 ? [0, TABLE_Y, TABLE] : [0, 150, 500];
      },
      get height() {
        return mode === 1 ? 500 : 630;
      },
      width: 650,
      yaw: 0.2,
      pitch: 0.78,
      amount: (t) => {
        lean += ((mode >= 0 ? 1 : 0) - lean) * Math.min(1, Math.max(0, t - leanedAt) * 4);
        leanedAt = t;
        return lean * lean * (3 - 2 * lean);
      },
    },
    pick: (index) => {
      mode = index;
      if (index === 0) snake.reset();
      if (index === 1) memory.deal();
    },
    press: (x, y, project) => {
      if (mode === 1) {
        const slot = squareAt(x, y, project);
        if (slot !== undefined) memory.flip(slot);
      }
      if (mode !== 0) return false;
      const key = keys.find(({ at, reach }) => {
        const [px, py] = project(at);
        const [ex, ey] = project(add(at, [reach + 8, 0, 0]));
        return Math.hypot(x - px, y - py) < Math.hypot(ex - px, ey - py);
      });
      if (!key) return false;
      key.downAt = now;
      key.act();
      return true;
    },
  };
}
