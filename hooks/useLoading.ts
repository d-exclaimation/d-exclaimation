//
//  useLoading.ts
//  d-exclaimation
//
//  Created by d-exclaimation on 29 Jan 2023
//

import { useEffect, useState } from "react";

type Args = {
  frames: Frame[];
  endAfter: number;
  onBackground?: () => void;
};

type Frame = {
  to: number;
  ms: number;
};

export function useLoading({ frames, endAfter, onBackground }: Args) {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timeouts = [
      ...frames.map(({ to, ms }) => setTimeout(() => setProgress(to), ms)),
      setTimeout(() => setLoading(false), endAfter),
    ];

    onBackground?.();

    return () => timeouts.forEach((timeout) => clearTimeout(timeout));
  }, []);

  return { loading, progress };
}
