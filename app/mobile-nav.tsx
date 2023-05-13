//
//  mobile-nav.tsx
//  d-exclaimation
//
//  Created by d-exclaimation on 09 May 2023
//

import { entries } from "@d-exclaimation/common";
import { rc } from "@d-exclaimation/next";
import Link from "next/link";
import { manifest } from "~/common/manifest";
import FocusIntersectingView from "~/components/FocusIntersectingView";
import Scrambled from "~/components/Scrambled";

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
      className="flex lg:hidden flex-col px-5 py-[clamp(1rem,5vw,6rem)] gap-8"
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
              scale-95 group-data-in-view:scale-100 before:content-['']
              before:absolute before:left-0 before:top-0 before:h-full
              before:w-0 before:border-y-2 before:border-y-neutral-400
              before:transition-all group-data-in-view:before:w-full
              before:duration-200 group-data-in-view:before:duration-500
              group-data-in-view:z-30 relative z-10 py-3 px-2"
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
          {img && (
            <img
              className="fixed -translate-y-1/2 left-1/2 top-[40%] -translate-x-1/2 blur-[1px]
              z-20 transition-all pointer-events-none max-w-[min(800px,90vw)] duration-300 
              delay-200 group-data-in-view:delay-[0s] object-cover aspect-auto max-h-[min(600px,80vh)]
              opacity-0 scale-50 group-data-in-view:opacity-100 group-data-in-view:scale-100"
              alt={title}
              src={img}
            />
          )}
        </FocusIntersectingView>
      ))}
    </nav>
  );
});

export default MobileNavigation;
