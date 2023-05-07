//
//  useSelectScrolling.ts
//  d-exclaimation
//
//  Created by d-exclaimation on 27 Jan 2023
//

import { tup } from "@d-exclaimation/common";
import { MouseEvent as _MouseEvent, useCallback, useState } from "react";

type AnchorMouseEvent = _MouseEvent<HTMLElement, MouseEvent>;

export function useSelectScrolling<T extends string[]>(keys: T) {
  const [selected, setSelected] = useState<T[number] | undefined>(keys.at(0));

  const onHover = useCallback(
    (key: T[number]) => (e: AnchorMouseEvent) => {
      setSelected(key);
    },
    [setSelected]
  );

  return tup(selected, onHover);
}
