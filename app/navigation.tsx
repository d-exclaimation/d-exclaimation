"use client";

//
//  navigation.tsx
//  d-exclaimation
//
//  Created by d-exclaimation on 29 Apr 2023
//

import { entries, keys } from "@d-exclaimation/common";
import Link from "next/link";
import { manifest } from "~/common/Manifest";
import Scrambled from "~/components/Scrambled";
import { useScrollSelection } from "~/hooks/useScrollSelection";
import { useSelectScrolling } from "~/hooks/useSelectScrolling";
import { rc } from "~/next/rc";

const TEXT = {
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

const Navigation = rc(() => {
  // Mobile scrolling (uses the scroll position of the window)
  const scrolled = useScrollSelection(titles);

  // Desktop select scrolling (uses the cursor position to scroll)
  const [{ selected }, { onHover, onMouseMove, onClear }] =
    useSelectScrolling(titles);

  return (
    <div className="animate-fade-in w-screen bg-transparent">
      <div className="lg:h-screen lg:overflow-hidden">
        <div className="opacity-0 h-[40vh] lg:h-[25vh]" />

        {/* Mobile View */}
        <nav
          id="mobile-nav"
          className="flex lg:hidden flex-col px-[clamp(3rem,6vw,8rem)] py-[clamp(1rem,5vw,6rem)] gap-10"
        >
          {elements.map(({ title, img, ...props }) => (
            <Link
              className="font-sans text-4xl sm:text-6xl md:text-8xl no-underline relative
              text-center lg:text-start transition-all duration-300 text-black/25 scale-90 
              data-active:text-blue-100 data-active:scale-100"
              key={`mobile-nav-${title}`}
              data-active={scrolled === title}
              {...props}
            >
              <div
                className="border-y-2 z-[2] py-2 border-y-transparent 
                data-active:border-y-neutral-400 data-active:bg-neutral-400/10"
                data-active={scrolled === title}
              >
                <Scrambled
                  className="block relative z-[2] opacity-25 data-active:opacity-100"
                  delay={TEXT.delay}
                  speed={TEXT.speed}
                  color={{
                    dud:
                      scrolled === title
                        ? "data-[dud=true]:text-neutral-400"
                        : "data-[dud=true]:text-black",
                    normal:
                      scrolled === title
                        ? img
                          ? "text-white"
                          : "text-black"
                        : "text-black",
                  }}
                  align="items-start"
                  justify="justify-start"
                  phrases={[title, title]}
                  active={scrolled === title}
                />
              </div>
              {img && (
                <img
                  className="absolute -translate-y-1/2 left-1/2 -translate-x-1/2 brightness-50 saturate-150
                  [transition:_transform_250ms,_opacity_250ms] pointer-events-none w-[95vw] max-w-[100vw]
                  opacity-0 scale-50 data-active:opacity-60 data-active:scale-100"
                  alt={title}
                  src={img}
                  data-active={scrolled === title}
                />
              )}
            </Link>
          ))}
        </nav>

        {/* Desktop View */}
        <nav
          id="desktop-nav"
          className="hidden lg:flex flex-col gap-2 p-[clamp(1rem,5vw,6rem)]"
          onMouseMove={onMouseMove}
          onMouseLeave={onClear}
        >
          {elements.map(({ title, img, ...props }, i) => (
            <Link
              className="font-sans text-[clamp(3rem,6vw,8rem)] font-light no-underline relative
              text-center lg:text-start transition-all duration-300 text-black/25 scale-95
              data-active:text-blue-100 data-active:scale-100"
              key={i}
              data-active={selected === title}
              onMouseMove={onHover(title)}
              {...props}
            >
              <div
                className="border-y-2 z-[2] py-2 border-y-transparent 
                data-active:border-y-neutral-400 data-active:bg-neutral-400/10
                data-active:data-[img=true]:bg-neutral-400/50"
                data-active={selected === title}
                data-img={!!img}
              >
                <Scrambled
                  className="block relative z-[2] opacity-30
                  data-active:opacity-100"
                  delay={TEXT.delay}
                  speed={TEXT.speed}
                  color={{
                    dud:
                      selected === title
                        ? "data-[dud=true]:text-neutral-400"
                        : "data-[dud=true]:text-black",
                    normal:
                      selected === title
                        ? img
                          ? "text-white"
                          : "text-black"
                        : "text-black",
                  }}
                  align="items-start"
                  justify="justify-start"
                  phrases={[title, title]}
                  active={selected === title}
                />
              </div>
              {img && (
                <img
                  className="absolute -translate-y-1/2 -translate-x-1/2 z-0 top-2/3 left-2/3 brightness-50 saturate-150
                  [transition:_transform_250ms,_opacity_250ms] pointer-events-none w-[min(80vw,900px)]
                  opacity-0 scale-50 data-active:opacity-60 data-active:scale-100"
                  alt={title}
                  src={img}
                  data-active={selected === title}
                />
              )}
            </Link>
          ))}
        </nav>
        <div className="opacity-0 h-[60vh] lg:h-[25vh]" />
      </div>
    </div>
  );
});

export default Navigation;
