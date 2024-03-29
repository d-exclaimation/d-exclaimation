//
//  desktop-nav.tsx
//  d-exclaimation
//
//  Created by d-exclaimation on 08 May 2023
//

import { manifest } from "@/(common)/manifest";
import Link from "@/(components)/link";
import Scrambled from "@/(components)/scrambled";
import { entries } from "@d-exclaimation/common";
import { rc } from "@d-exclaimation/next";

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

const DesktopNavigation = rc(() => {
  return (
    <nav
      id="desktop-nav"
      className="hidden lg:flex flex-col gap-2 p-[clamp(1rem,5vw,6rem)]"
    >
      {elements.map(({ title, img, ...props }) => (
        <div className="my-1" key={`desktop-nav-${title}`}>
          <Link
            className="font-sans text-6xl font-light no-underline
            text-center lg:text-start transition-all duration-300 text-black/25
            hover:text-blue-100 hover:z-30 group peer relative
            dark:text-white/25 dark:hover:text-blue-900"
            {...props}
          >
            <div
              className="transition-all group-hover:bg-neutral-300/10
              scale-95 group-hover:scale-100 z-30 py-3 before:content-['']
              before:absolute before:left-0 before:top-0 before:h-full
              before:w-0 before:border-y-2 before:border-y-neutral-900
              before:transition-all group-hover:before:w-full
              before:duration-200 group-hover:before:duration-500
              dark:group-hover:bg-neutral-700/10
              dark:before:border-y-neutral-100"
            >
              <Scrambled
                className="block relative opacity-30 my-1
                group-hover:data-[dud=true]:text-neutral-400
                group-hover:opacity-100 group-hover:z-30
                dark:text-white dark:data-[dud=true]:text-white
                dark:group-hover:data-[dud=true]:text-neutral-600"
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
              className="fixed -translate-y-1/2 -translate-x-1/2 top-1/2 left-[60%]
              z-20 transition-all pointer-events-none max-w-[min(800px,80vw)] duration-300 
              delay-200 peer-hover:delay-[0s] object-cover aspect-auto max-h-[min(800px,80vh)]
              opacity-0 scale-50 peer-hover:opacity-100 peer-hover:scale-100"
              alt={title}
              src={img}
            />
          )}
        </div>
      ))}
    </nav>
  );
});

export default DesktopNavigation;
