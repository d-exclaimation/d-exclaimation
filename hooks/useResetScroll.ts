//
//  useResetScroll.ts
//  d-exclaimation
//
//  Created by d-exclaimation on 28 Jan 2023
//

import Router from "next/router";
import { useCallback, useEffect } from "react";

export function useResetScroll() {
  const resetWindowScrollPosition = useCallback(
    () => window.scrollTo(0, 0),
    []
  );

  useEffect(() => {
    Router.events.on("routeChangeComplete", resetWindowScrollPosition);

    return () => {
      Router.events.off("routeChangeComplete", resetWindowScrollPosition);
    };
  }, []);
}
