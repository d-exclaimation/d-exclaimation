//
//  useConway.ts
//  d-exclaimation
//
//  Created by d-exclaimation on 14 Dec 2022
//

import { match, Union } from "@d-exclaimation/common/union";
import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { fill, of } from "../../../common/Array";

/**
 * Namespace for anything to do with Conway's game of life
 */
export namespace Conway {
  /**
   * The grid of the game of life
   */
  export type Grid = ReadonlyArray<ReadonlyArray<boolean>>;

  /**
   * Vector 2D (x and y)
   */
  export type Vec2 = {
    x: number;
    y: number;
  };

  /**
   * State of the game of life
   */
  type State = {
    grid: Grid;
  };

  /**
   * Actions for the game of life reducer
   */
  type Action = Union<{
    toggle: Vec2;
    runtime: {};
    assign: State;
    spawn: Union<{
      "glider-gun": Vec2;
      glider: Vec2;
    }>;
  }>;

  /** Number of X (columns) */
  const X_NUMS = 100;
  /** Number of Y (rows) */
  const Y_NUMS = 100;

  /** Max X (columns) */
  const MAX_X = X_NUMS - 1;
  /** Min X (columns) */
  const MIN_X = 0;
  /** Max Y (rows) */
  const MAX_Y = Y_NUMS - 1;
  /** Min Y (rows) */
  const MIN_Y = 0;

  /**
   * Initial state of the game of life
   */
  const INITIAL = fill(Y_NUMS, () => fill(X_NUMS, () => false));

  /** Local storage key */
  const KEY = "dexclaimation-conway-game-of-life";

  /**
   * Get all possible neighbours given a vector
   * @param param0 Vector position
   */
  function neighbours({ x, y }: Vec2): Array<Vec2> {
    return of<Vec2>(
      { x: -1, y: -1 },
      { x: 0, y: -1 },
      { x: 1, y: -1 },
      { x: -1, y: 0 },
      { x: 1, y: 0 },
      { x: -1, y: 1 },
      { x: 0, y: 1 },
      { x: 1, y: 1 }
    )
      .map(({ x: dx, y: dy }) => ({ x: x + dx, y: y + dy }))
      .filter(
        ({ x: nx, y: ny }) =>
          nx >= MIN_X && nx <= MAX_X && ny >= MIN_Y && ny <= MAX_Y
      );
  }

  /**
   * Reducer for the game of life
   * @param param0 The current state
   * @param action The action being performed
   * @returns The next state
   */
  function reducer({ grid }: State, action: Action): State {
    const newGrid = match(action, {
      toggle: ({ x, y }) =>
        grid.map((row, i) =>
          i === y ? row.map((col, j) => (x === j ? !col : col)) : row
        ),
      runtime: () =>
        grid.map((row, y) =>
          row.map((col, x) => {
            const n = neighbours({ x, y }).filter((v) => grid[v.y][v.x]).length;
            return n == 3 || (col && n == 2);
          })
        ),
      assign: (state) => state.grid,
    });
    window?.localStorage.setItem(KEY, JSON.stringify({ grid: newGrid }));
    return { grid: newGrid };
  }

  /**
   * Hook for Conway's game of life
   * @returns State pf the game of life, functions to toggle the grid element, and start / pause the game
   */
  export function use() {
    const [{ grid }, dispatch] = useReducer(reducer, { grid: INITIAL });
    const [id, setId] = useState<number | NodeJS.Timeout | null>(null);

    /**
     * Toggle an element in the grid given its vector position
     */
    const toggle = useCallback(
      (pos: Vec2) => dispatch({ __t: "toggle", ...pos }),
      [dispatch]
    );

    /**
     * Toggle the play / pause state of the game
     */
    const onoff = useCallback(() => {
      if (id) {
        clearInterval(id);
        setId(null);
      } else {
        setId(setInterval(() => dispatch({ __t: "runtime" }), 250));
      }
    }, [dispatch, id]);

    /**
     * State to check whether the game is running
     */
    const isRunning = useMemo(() => id !== null, [id]);

    /** Modify the state with the cached data from local storage */
    useEffect(() => {
      const data = window?.localStorage.getItem(KEY);
      if (!data) return;

      try {
        const parsed = JSON.parse(data);
        const res = [...parsed?.grid].map((row) =>
          [...row].map((col) => !!col)
        );
        dispatch({ __t: "assign", grid: res });
      } catch {
        return;
      }

      return () => {
        if (id) clearInterval(id);
      };
    }, []);

    return {
      grid,
      onoff,
      toggle,
      isRunning,
    };
  }
}

/**
 * Hook for Conway's game of life
 * @returns State pf the game of life, functions to toggle the grid element, and start / pause the game
 */
export const useConway = Conway.use;
