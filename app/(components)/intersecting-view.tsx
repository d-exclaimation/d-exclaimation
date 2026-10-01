"use client";

//
//  intersecting-view.tsx
//  d-exclaimation
//
//  Created by d-exclaimation on 09 May 2023
//

import { useWithinView } from "@/(hooks)/useWithinView";
import { type ReactNode } from "react";

type Props = {
  rootMargin: `${number}% ${number}px ${number}% ${number}px`;
  children: ReactNode;
};

function IntersectingView({ children, rootMargin }: Props) {
  const { ref, inView } = useWithinView({
    rootMargin,
    threshold: 0,
  });

  return (
    <div className="group peer" ref={ref} data-in-view={inView}>
      {children}
    </div>
  );
}

export default IntersectingView;
