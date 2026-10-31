//
//  memory.ts
//  d-exclaimation
//
//  The rules of memory, for the arcade cabinet's screen to show
//

export const ROWS = 4;
export const PAIRS = 8;
/** Seconds a wrong pair stays up. */
const LOOK = 0.75;

export class MemoryGame {
  /** Where each card sits. Two cards in a row share a symbol, and shuffling only moves them around. */
  slots: number[] = [];
  /** Up for good, or up for now. */
  up: boolean[] = [];
  /** How far over each card has turned, from 0 to 1. */
  turned: number[] = [];
  won = false;
  private active: number[] = [];
  private found = 0;
  private clock = 0;
  private lookingUntil = 0;
  private wonAt = 0;

  constructor() {
    this.deal();
  }

  deal() {
    this.slots = Array.from({ length: ROWS * ROWS }, (_, i) => i);
    for (let i = this.slots.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.slots[i], this.slots[j]] = [this.slots[j], this.slots[i]];
    }
    this.up = this.slots.map(() => false);
    this.turned = this.slots.map(() => 0);
    this.active = [];
    this.found = 0;
    this.won = false;
  }

  /** Turns over whatever is in a square. */
  flip(slot: number) {
    const card = this.slots.indexOf(slot);
    if (this.up[card] || this.active.length >= 2) return;
    this.up[card] = true;
    this.active.push(card);
    if (this.active.length === 2) this.lookingUntil = this.clock + LOOK;
  }

  /** Moves the game on to a moment. Every card asks, so only the first in a frame does anything. */
  advance(seconds: number) {
    const dt = Math.max(0, seconds - this.clock);
    if (!dt) return;
    this.clock = seconds;
    this.turned.forEach((was, i) => (this.turned[i] = was + ((this.up[i] ? 1 : 0) - was) * Math.min(1, dt * 9)));
    if (this.won && seconds - this.wonAt > 1.6) this.deal();
    if (this.active.length < 2 || seconds < this.lookingUntil) return;
    const [a, b] = this.active;
    if (a >> 1 === b >> 1) this.found++;
    else this.up[a] = this.up[b] = false;
    this.active = [];
    if (this.found === PAIRS) {
      this.won = true;
      this.wonAt = seconds;
    }
  }
}
