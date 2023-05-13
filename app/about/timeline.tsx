//
//  timeline.tsx
//  d-exclaimation
//
//  Created by d-exclaimation on 08 May 2023
//

import { rc } from "@d-exclaimation/next";
import { type ReactNode } from "react";

type Props = {
  date: {
    month: string;
    year: string;
  };
  children: ReactNode;
};

const Timeline = rc<Props>(({ date, children }) => {
  return (
    <div className="w-full flex flex-row gap-4 items-start">
      <div className="flex-shrink-0 flex flex-row items-center text-sm font-light py-2">
        <div className="mr-2 text-black/40 text-center">o</div>
        {date.month} {date.year}{" "}
        <div className="ml-2 bg-black/40 w-2 h-[1px]" />
      </div>
      <p>{children}</p>
    </div>
  );
});

export default Timeline;
