"use client";

//
//  IntersectingView.tsx
//  d-exclaimation
//
//  Created by d-exclaimation on 09 May 2023
//

import { rc } from "@d-exclaimation/next";
import { type ReactNode } from "react";
import { useWithinView } from "~/hooks/useWithinView";

type Props = {
  rootMargin: `${number}% ${number}px ${number}% ${number}px`;
  children: ReactNode;
};

const IntersectingView = rc<Props>(({ children, rootMargin }) => {
  const { ref, inView } = useWithinView({
    rootMargin,
    threshold: 0,
  });

  return (
    <div className="group peer" ref={ref} data-in-view={inView}>
      {children}
    </div>
  );
});

export default IntersectingView;
