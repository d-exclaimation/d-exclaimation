//
//  useResetScroll.ts
//  d-exclaimation
//
//  Created by d-exclaimation on 28 Jan 2023
//

import { useEffect } from "react";

export function useResetScroll() {
  useEffect(() => {
    window.history.scrollRestoration = "manual";
  }, []);
}
