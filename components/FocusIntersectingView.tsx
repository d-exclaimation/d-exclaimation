"use client";

//
//  FocusIntersectingView.tsx
//  d-exclaimation
//
//  Created by d-exclaimation on 09 May 2023
//

import { rc } from "@d-exclaimation/next";
import { type ReactNode } from "react";
import { useWithinView } from "~/hooks/useWithinView";

type Props = {
  children: ReactNode;
};

const FocusIntersectingView = rc<Props>(({ children }) => {
  const { ref, inView } = useWithinView({
    rootMargin: "-39% 0px -59% 0px",
    threshold: 0,
  });

  return (
    <div className="group peer" ref={ref} data-in-view={inView}>
      {children}
    </div>
  );
});

export default FocusIntersectingView;
