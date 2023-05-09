//
//  mobile-nav.tsx
//  d-exclaimation
//
//  Created by d-exclaimation on 09 May 2023
//

import { entries } from "@d-exclaimation/common";
import Link from "next/link";
import { manifest } from "~/common/manifest";
import IntersectingView from "~/components/IntersectingView";
import Scrambled from "~/components/Scrambled";
import { rc } from "~/next/rc";

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
      className="flex lg:hidden flex-col px-[clamp(3rem,6vw,8rem)] py-[clamp(1rem,5vw,6rem)] gap-10"
    >
      {elements.map(({ title, img, ...props }) => (
        <IntersectingView key={`mobile-nav-${title}`}>
          <Link
            className="font-sans text-4xl sm:text-6xl md:text-8xl no-underline relative
            text-center lg:text-start transition-all duration-300 text-black/25 scale-90
            group-data-in-view:text-blue-100 group-data-in-view:scale-100 z-10 group-data-in-view:z-30"
            {...props}
          >
            <div className="border-y-2 py-2 border-y-transparent group-data-in-view:border-y-neutral-400 group-data-in-view:bg-neutral-300/20">
              <Scrambled
                className="block relative opacity-25 group-data-in-view:opacity-100 transition-all
                group-data-in-view:data-[dud=true]:text-neutral-400"
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
              z-20 transition-all pointer-events-none max-w-[min(800px,80vw)] duration-300 
              delay-200 group-data-in-view:delay-[0s] object-cover aspect-auto max-h-[min(600px,80vh)]
              opacity-0 scale-50 group-data-in-view:opacity-100 group-data-in-view:scale-100"
              alt={title}
              src={img}
            />
          )}
        </IntersectingView>
      ))}
    </nav>
  );
});

export default MobileNavigation;