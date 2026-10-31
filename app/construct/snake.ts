//
//  snake.ts
//  d-exclaimation
//
//  The rules of snake, for the arcade cabinet's screen to show
//

export type Direction = "up" | "down" | "left" | "right";
type Cell = { x: number; y: number };

export const SIZE = 20;
/** Seconds between steps. */
const TICK = 0.15;
/** The most of it there can be, since every block is a part of the construct. */
export const LONGEST = 46;

const STEP: Record<Direction, Cell> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const same = (a: Cell, b: Cell) => a.x === b.x && a.y === b.y;

function foodFor(snake: Cell[]): Cell {
  const free = Array.from({ length: SIZE * SIZE }, (_, i): Cell => ({ x: i % SIZE, y: Math.floor(i / SIZE) })).filter(
    (cell) => !snake.some((part) => same(part, cell))
  );
  return free[Math.floor(Math.random() * free.length)];
}

export class SnakeGame {
  /** The snake from its head back, and where each part was a step ago. */
  cells: Cell[] = [{ x: 6, y: 10 }];
  from: Cell[] = this.cells;
  direction: Direction = "right";
  food: Cell = foodFor(this.cells);
  status: "ready" | "going" | "over" = "ready";
  overAt = 0;
  private turns: Direction[] = [];
  private steppedAt = 0;
  private clock = 0;

  reset() {
    this.cells = [{ x: 6, y: 10 }];
    this.from = this.cells;
    this.direction = "right";
    this.turns = [];
    this.food = foodFor(this.cells);
    this.status = "ready";
  }

  /** Starts it off if it's waiting, and otherwise puts it back to the start. */
  start() {
    if (this.status !== "ready") return this.reset();
    this.status = "going";
    this.steppedAt = this.clock;
  }

  turn(direction: Direction) {
    if (this.status !== "going") return;
    const last = this.turns.at(-1) ?? this.direction;
    const backwards = STEP[last].x === -STEP[direction].x && STEP[last].y === -STEP[direction].y;
    if (direction !== last && !backwards && this.turns.length < 2) this.turns.push(direction);
  }

  /** Moves the game on to a moment. Every block asks, so only the first in a frame does anything. */
  advance(seconds: number) {
    if (seconds === this.clock) return;
    this.clock = seconds;
    while (this.status === "going" && seconds - this.steppedAt >= TICK) {
      this.steppedAt += TICK;
      this.step();
    }
  }

  private step() {
    this.direction = this.turns.shift() ?? this.direction;
    const head = this.cells[0];
    const next = { x: head.x + STEP[this.direction].x, y: head.y + STEP[this.direction].y };
    const wall = next.x < 0 || next.y < 0 || next.x >= SIZE || next.y >= SIZE;
    if (wall || this.cells.some((part) => same(part, next))) return this.end();
    const fed = same(next, this.food);
    this.from = fed ? [next, ...this.cells] : this.cells;
    this.cells = fed ? [next, ...this.cells] : [next, ...this.cells.slice(0, -1)];
    if (fed && this.cells.length >= LONGEST) this.end();
    else if (fed) this.food = foodFor(this.cells);
  }

  private end() {
    this.status = "over";
    this.overAt = this.clock;
    this.from = this.cells;
  }

  /** Where a block is on the grid, between its last step and the next. */
  at(index: number): [number, number] {
    const k = this.status === "going" ? Math.min(1, (this.clock - this.steppedAt) / TICK) : 1;
    const a = this.from[index] ?? this.cells[index];
    const b = this.cells[index];
    return [a.x + (b.x - a.x) * k, a.y + (b.y - a.y) * k];
  }

  /** How far gone a block is once the game has ended, from 0 to 1. */
  gone(index: number) {
    return this.status === "over" ? Math.min(1, Math.max(0, (this.clock - this.overAt - index * 0.02) / 0.7)) : 0;
  }
}
