"use client";

//
//  focus-intersecting-view.tsx
//  d-exclaimation
//
//  Created by d-exclaimation on 09 May 2023
//

import { useWithinView } from "@/(hooks)/useWithinView";
import { type ReactNode } from "react";

type Props = {
  children: ReactNode;
};

function FocusIntersectingView({ children }: Props) {
  const { ref, inView } = useWithinView({
    rootMargin: "-39% 0px -59% 0px",
    threshold: 0,
  });

  return (
    <div className="group peer" ref={ref} data-in-view={inView}>
      {children}
    </div>
  );
}

export default FocusIntersectingView;
