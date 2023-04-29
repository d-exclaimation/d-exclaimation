//
//  useSelectScrolling.ts
//  d-exclaimation
//
//  Created by d-exclaimation on 27 Jan 2023
//

import { tup } from "@d-exclaimation/common";
import {
  MouseEvent as _MouseEvent,
  useCallback,
  useRef,
  useState,
} from "react";

type NavMouseEvent = _MouseEvent<HTMLElement, MouseEvent>;
type AnchorMouseEvent = _MouseEvent<HTMLElement, MouseEvent>;

export function useSelectScrolling<T extends string[]>(keys: T) {
  const ref = useRef<NodeJS.Timeout | number | undefined>(undefined);
  const [selected, setSelected] = useState<T[number] | undefined>(keys.at(0));

  const onMouseMove = useCallback((e: NavMouseEvent) => {
    const percent = e.clientY / window.innerHeight;
    const y = percent * e.currentTarget.offsetHeight * -1;
    const keyframes = { transform: `translateY(${y}px)` };
    e.currentTarget.animate(keyframes, {
      fill: "forwards",
      duration: 5000,
    });
  }, []);

  const onHover = useCallback(
    (key: T[number]) => (e: AnchorMouseEvent) => {
      const rect = e.currentTarget.getBoundingClientRect();
      setSelected(key);

      ref.current = setTimeout(
        () => window.scrollTo({ top: e.clientY, behavior: "smooth" }),
        200
      );
    },
    [setSelected]
  );

  const onClear = useCallback(() => setSelected(keys.at(0)), [setSelected]);

  return tup({ selected }, { onMouseMove, onHover, onClear });
}
