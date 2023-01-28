//
//  useMobileCinderbloc.ts
//  d-exclaimation
//
//  Created by d-exclaimation on 27 Jan 2023
//

import { useScroll, useTransform } from "framer-motion";
import { useEffect, useState } from "react";

const OFFZONE = 1;

export function useScrollSelection<T extends string[]>(keys: T) {
  const { scrollYProgress } = useScroll();
  const progress = useTransform(
    scrollYProgress,
    [0, 1],
    [0, keys.length + OFFZONE]
  );
  const [scrolled, setScrolled] = useState<T[number]>(keys[0]);

  useEffect(() => {
    const unsubsribe = progress.onChange((p) => {
      const index = Math.round(p);
      if (index >= keys.length) {
        return;
      }
      setScrolled(keys[index]);
    });
    return () => unsubsribe();
  }, [setScrolled]);

  return scrolled;
}
