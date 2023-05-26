//
//  mobile-nav.tsx
//  d-exclaimation
//
//  Created by d-exclaimation on 09 May 2023
//

import { entries } from "@d-exclaimation/common";
import { rc } from "@d-exclaimation/next";
import { manifest } from "~/common/manifest";
import FocusIntersectingView from "~/components/FocusIntersectingView";
import Scrambled from "~/components/Scrambled";
import Link from "./link";

const scramble = {
  delay: 10_000,
  speed: 40,
};

const elements = entries(manifest.stories).map(
  ([title, { img, ...other }]) => ({
    title,
    img,
    ...other,
  })
);

const MobileNavigation = rc(() => {
  return (
    <nav
      id="mobile-nav"
      className="flex lg:hidden flex-col px-5 py-[clamp(1rem,5vw,6rem)] gap-4"
    >
      {elements.map(({ title, img, ...props }) => (
        <FocusIntersectingView key={`mobile-nav-${title}`}>
          <Link
            className="font-sans text-4xl sm:text-6xl md:text-8xl no-underline relative z-10
            text-center lg:text-start transition-all duration-300 text-black/25 scale-90
            group-data-in-view:text-blue-100 group-data-in-view:scale-100 group-data-in-view:z-30"
            {...props}
          >
            <div
              className="transition-all group-data-in-view:bg-neutral-300/20
              scale-95 group-data-in-view:scale-100 px-2
              border-y-0 border-y-neutral-900 z-10
              group-data-in-view:border-y-2 py-3 
              group-data-in-view:z-30 relative"
            >
              <Scrambled
                className="block relative opacity-25 group-data-in-view:opacity-100 transition-all
                group-data-in-view:data-[dud=true]:text-neutral-400 group-data-in-view:z-30"
                delay={scramble.delay}
                speed={scramble.speed}
                color={{
                  dud: "data-[dud=true]:text-black",
                  normal: "text-black",
                }}
                align="items-start"
                justify="justify-start"
                phrases={[title, title]}
              />
            </div>
          </Link>
        </FocusIntersectingView>
      ))}
    </nav>
  );
});

export default MobileNavigation;
