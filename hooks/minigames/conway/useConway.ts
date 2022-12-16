//
//  useConway.ts
//  d-exclaimation
//
//  Created by d-exclaimation on 14 Dec 2022
//

import { match, Union } from "@d-exclaimation/union";
import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { fill, of } from "../../../common/Array";

export namespace Conway {
  export type Grid = ReadonlyArray<ReadonlyArray<boolean>>;

  export type Vec2 = {
    x: number;
    y: number;
  };

  type State = {
    grid: Grid;
  };

  type Action = Union<{
    toggle: Vec2;
    runtime: {};
    assign: State;
    spawn: Union<{
      "glider-gun": Vec2;
      glider: Vec2;
    }>;
  }>;

  const X_NUMS = 100;
  const Y_NUMS = 100;

  const MAX_X = X_NUMS - 1;
  const MIN_X = 0;
  const MAX_Y = Y_NUMS - 1;
  const MIN_Y = 0;

  const INITIAL = fill(Y_NUMS, () => fill(X_NUMS, () => false));
  const KEY = "dexclaimation-conway-game-of-life";

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

  function reducer({ grid }: State, action: Action): State {
    const newGrid = match<Action, Grid>(action, {
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

  export function use() {
    const [{ grid }, dispatch] = useReducer(reducer, { grid: INITIAL });
    const [id, setId] = useState<number | NodeJS.Timeout | null>(null);

    const toggle = useCallback(
      (pos: Vec2) => dispatch({ __type: "toggle", ...pos }),
      [dispatch]
    );

    const onoff = useCallback(() => {
      if (id) {
        clearInterval(id);
        setId(null);
      } else {
        setId(setInterval(() => dispatch({ __type: "runtime" }), 250));
      }
    }, [dispatch, id]);

    const isRunning = useMemo(() => id !== null, [id]);

    useEffect(() => {
      const data = window?.localStorage.getItem(KEY);
      if (!data) return;

      try {
        const parsed = JSON.parse(data);
        const res = [...parsed?.grid].map((row) =>
          [...row].map((col) => !!col)
        );
        dispatch({ __type: "assign", grid: res });
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

export const useConway = Conway.use;
