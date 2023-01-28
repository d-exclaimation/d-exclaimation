//
//  Navigation.tsx
//  d-exclaimation
//
//  Created by d-exclaimation on 12 Dec 2022
//

import { useCallback, useEffect, useState } from "react";
import type { XFC } from "../../common/XFC";
import NavigationPalette from "./NavigationPalette";

/**
 * Navigation button and the command palette
 */
const Navigation: XFC<{}> = () => {
  const [expanded, setExpanded] = useState(false);

  /**
   * Callback for any key pressed for calling the command palette using `Ctrl/Command + K`
   */
  const onKeyDown = useCallback(
    (e: globalThis.KeyboardEvent) => {
      if (e.key !== "k" || !(e.metaKey || e.ctrlKey)) return;
      setExpanded((prev) => !prev);
    },
    [setExpanded]
  );

  /* Appending the key down callback to the window */
  useEffect(() => {
    window?.addEventListener("keydown", onKeyDown);
    return () => window?.removeEventListener("keydown", onKeyDown);
  }, [onKeyDown]);

  return (
    <>
      <button
        className={`
        fixed z-40 
        right-3 top-3 p-2 
        bg-white rounded-md select-none 
        shadow-md md:shadow-none
        transform shadow-gray-400 
        active:bg-gray-100
        active:scale-95 active:shadow-md
        md:hover:scale-95 md:hover:shadow-lg
        transition duration-400
        ${expanded ? "hidden" : "block"}
        `}
        id="button-nav"
        title="Navigation"
        onClick={() => setExpanded((prev) => !prev)}
      >
        <img src="/icon/mix.svg" className="w-5 md:w-6 h-5 z-50 md:h-6" />
      </button>
      <NavigationPalette isOpen={expanded} close={() => setExpanded(false)} />
    </>
  );
};

export default Navigation;
