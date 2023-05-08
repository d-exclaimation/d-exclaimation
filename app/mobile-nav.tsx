"use client";

//
//  mobile-nav.tsx
//  d-exclaimation
//
//  Created by d-exclaimation on 09 May 2023
//

import { entries, keys } from "@d-exclaimation/common";
import Link from "next/link";
import { Fragment } from "react";
import { manifest } from "~/common/manifest";
import Scrambled from "~/components/Scrambled";
import { useScrollSelection } from "~/hooks/useScrollSelection";
import { rc } from "~/next/rc";

const scramble = {
  delay: 10_000,
  speed: 40,
};

const titles = keys(manifest.stories);
const elements = entries(manifest.stories).map(
  ([title, { img, ...other }]) => ({
    title,
    img,
    ...other,
  })
);

const MobileNavigation = rc(() => {
  const scrolled = useScrollSelection(titles);
  return (
    <nav
      id="mobile-nav"
      className="flex lg:hidden flex-col px-[clamp(3rem,6vw,8rem)] py-[clamp(1rem,5vw,6rem)] gap-10"
    >
      {elements.map(({ title, img, ...props }) => (
        <Fragment key={`mobile-nav-${title}`}>
          <Link
            className="font-sans text-4xl sm:text-6xl md:text-8xl no-underline relative
            text-center lg:text-start transition-all duration-300 text-black/25 scale-90 
            data-active:text-blue-100 data-active:scale-100 z-10 data-active:z-30"
            data-active={scrolled === title}
            {...props}
          >
            <div
              className="border-y-2 py-2 border-y-transparent data-active:border-y-neutral-400 data-active:bg-neutral-300/20"
              data-active={scrolled === title}
            >
              <Scrambled
                className="block relative opacity-25 data-active:opacity-100"
                delay={scramble.delay}
                speed={scramble.speed}
                color={{
                  dud:
                    scrolled === title
                      ? "data-[dud=true]:text-neutral-400"
                      : "data-[dud=true]:text-black",
                  normal: scrolled === title ? "text-black" : "text-black",
                }}
                align="items-start"
                justify="justify-start"
                phrases={[title, title]}
                active={scrolled === title}
              />
            </div>
          </Link>
          {img && (
            <img
              className="fixed -translate-y-1/2 left-1/2 -translate-x-1/2 blur-[1px]
              z-20 transition-all pointer-events-none max-w-[min(800px,80vw)] duration-300 
              delay-200 data-active:delay-[0s] object-cover aspect-auto max-h-[min(600px,80vh)]
              opacity-0 scale-50 data-active:opacity-100 data-active:scale-100"
              alt={title}
              src={img}
              data-active={scrolled === title}
            />
          )}
        </Fragment>
      ))}
    </nav>
  );
});

export default MobileNavigation;
