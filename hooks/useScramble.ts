//
//  useScramble.ts
//  dexclaimation
//
//  Created by d-exclaimation on 11 Dec 2022
//

import { useEffect, useRef, useState } from "react";

/**
 * Non-readable text characters
 */
export const DUDS = "!<>-_\\/[]{}—=+*^?#________";

/**
 * Text character transition queue message
 */
export type TextQueue = {
  from: string;
  to: string;
  start: number;
  end: number;
  char?: string;
};

/**
 * Generate a pseudo-random dud character
 * @returns A random dud character
 */
function randomChar(): string {
  return DUDS[Math.floor(Math.random() * DUDS.length)];
}

/**
 * Hook to cleanly scramble one phrase to another soley using states
 * @param phrases The phrases to transition from one to another
 * @param speed The delay of each character transition
 * @param delay The delay of phrases
 * @returns An array of individual character states
 */
export function useScramble(
  phrases: string[],
  speed = 25,
  delay = 1000
): string[] {
  const updateTimeout = useRef<number | NodeJS.Timeout | null>(null);
  const recursiveTimeout = useRef<number | NodeJS.Timeout | null>(null);
  const index = useRef(0);

  /**  To use React change detections */
  const [currText, setText] = useState(phrases[0].split(""));

  /** Make an update to the currText */
  const update = (
    queue: TextQueue[],
    frame: number,
    resolver: (value: string[]) => void
  ): void => {
    let completed = 0;
    const text = queue.map(({ from, to, start, end, char }, i) => {
      if (frame >= end) {
        completed++;
        return to;
      }
      if (frame >= start) {
        let newChar = char;
        if (!newChar || Math.random() < 0.28) {
          newChar = randomChar();
          queue[i].char = newChar;
        }
        return newChar;
      }

      return from;
    });
    setText(text);

    if (completed === queue.length) {
      resolver(text);
    } else {
      updateTimeout.current = setTimeout(() => {
        update(queue, frame + 1, resolver);
      }, speed);
    }
  };

  /** setText but I named it updateText since I used setText */
  const updateText = (
    currText: string[],
    newText: string
  ): Promise<string[]> => {
    const length = Math.max(currText.length, newText.length);

    const queue = new Array<string>(length).fill("").map((_, i) => {
      const from = currText[i] || "";
      const to = newText[i] || "";
      const start = Math.floor(Math.random() * 40);
      const end = start + Math.floor(Math.random() * 40);
      return {
        from,
        to,
        start,
        end,
      };
    });

    if (updateTimeout.current) {
      clearTimeout(updateTimeout.current);
    }

    const promise = new Promise<string[]>((resolve) => {
      update(queue, 0, resolve);
    });

    return promise;
  };

  /** next function to updateText and recurse */
  const next = (currText: string[]) => {
    updateText(currText, phrases[index.current]).then((value) => {
      recursiveTimeout.current = setTimeout(() => next(value), delay);
    });
    index.current = (index.current + 1) % phrases.length;
  };

  const clearAllTimeout = () => {
    if (recursiveTimeout.current) clearTimeout(recursiveTimeout.current);
    if (updateTimeout.current) clearTimeout(updateTimeout.current);
  };

  useEffect(() => {
    next(currText);
    return clearAllTimeout;
  }, []);

  return currText;
}
