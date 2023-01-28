//
//  useResetScroll.ts
//  d-exclaimation
//
//  Created by d-exclaimation on 28 Jan 2023
//

import Router from "next/router";
import { useCallback, useEffect } from "react";

export function useResetScroll() {
  const resetWindowScrollPosition = useCallback(() => {
    console.log("reset called");
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    console.log("Start");
    resetWindowScrollPosition();

    setTimeout(() => console.log("Timeout"), 0);
    Promise.resolve().then(() => console.log("Promise"), 0);
    Router.events.on("routeChangeComplete", resetWindowScrollPosition);

    return () => {
      console.log("Ended");
      Router.events.off("routeChangeComplete", resetWindowScrollPosition);
    };
  }, []);
}
