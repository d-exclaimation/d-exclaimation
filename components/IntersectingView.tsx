"use client";

//
//  IntersectingView.tsx
//  d-exclaimation
//
//  Created by d-exclaimation on 09 May 2023
//

import { type ReactNode } from "react";
import { useWithinView } from "~/hooks/useWithinView";
import { rc } from "~/next/rc";

type Props = {
  children: ReactNode;
};

const IntersectingView = rc<Props>(({ children }) => {
  const { ref, inView } = useWithinView({
    rootMargin: "-38% 0px -58% 0px",
    threshold: 0,
  });

  return (
    <div className="group peer" ref={ref} data-in-view={inView}>
      {children}
    </div>
  );
});

export default IntersectingView;
