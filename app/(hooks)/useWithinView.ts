//
//  useWithinView.ts
//  d-exclaimation
//
//  Created by d-exclaimation on 09 May 2023
//

import { useEffect, useRef, useState } from "react";

export function useWithinView(opts: IntersectionObserverInit) {
  const ref = useRef<any | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting);
    }, opts);

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [ref]);

  return { ref, inView };
}
