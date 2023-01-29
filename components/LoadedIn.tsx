//
//  LoadedIn.tsx
//  d-exclaimation
//
//  Created by d-exclaimation on 29 Jan 2023
//

import * as Progress from "@radix-ui/react-progress";
import type { ReactNode } from "react";
import type { XFC } from "../common/XFC";
import { useLoading } from "../hooks/useLoading";

type Props = Parameters<typeof useLoading>[0] & {
  children: ReactNode;
};

const LoadedIn: XFC<Props> = ({ className, children, ...args }) => {
  const { loading, progress } = useLoading(args);

  if (loading)
    return (
      <div
        className={`flex items-center justify-center transition-transform w-screen h-screen ${className}`}
      >
        <Progress.Root className="overflow-hidden rounded-full max-w-xl w-[75vw] h-6 [transform:translateZ(0)] bg-neutral-400">
          <Progress.Indicator
            className="bg-neutral-900 w-full h-full transition-transform duration-500"
            style={{ transform: `translateX(-${100 - progress}%)` }}
          />
        </Progress.Root>
      </div>
    );

  return <div className="animate-fade-in">{children}</div>;
};

export default LoadedIn;
