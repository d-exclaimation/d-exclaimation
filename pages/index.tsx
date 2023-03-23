//
//  cinderbloc.tsx
//  d-exclaimation
//
//  Created by d-exclaimation on 25 Jan 2023
//

import { entries, keys } from "@d-exclaimation/common";
import Link from "next/link";
import { FC } from "react";
import { preloadImage } from "../common/Image";
import { manifest } from "../common/Manifest";
import LoadedIn from "../components/LoadedIn";
import Scrambled from "../components/Scrambled";
import { withHead } from "../hoc/withHead";
import { useScrollSelection } from "../hooks/minigames/cinderbloc/useScrollSelection";
import { useSelectScrolling } from "../hooks/minigames/cinderbloc/useSelectScrolling";

const TEXT = {
  delay: 10_000,
  speed: 40,
};

const StoryTitles = keys(manifest.stories);
const StoryElements = entries(manifest.stories).map(
  ([title, { img, ...other }]) => {
    return {
      title,
      img,
      ...other,
    };
  }
);

const Home: FC = () => {
  // Mobile scrolling (uses the scroll position of the window)
  const scrolled = useScrollSelection(StoryTitles);

  // Desktop select scrolling (uses the cursor position to scroll)
  const [{ selected }, { onHover, onMouseMove, onClear }] =
    useSelectScrolling(StoryTitles);

  return (
    <LoadedIn
      frames={[
        { to: 30, ms: 0 },
        { to: 100, ms: 500 },
      ]}
      endAfter={1000}
      onBackground={() => {
        StoryElements.forEach(({ img }) => img && preloadImage(img));
      }}
    >
      <div className="lg:h-screen lg:overflow-hidden">
        <div className="opacity-0 h-[40vh] lg:h-[25vh]" />

        {/* Mobile View */}
        <nav
          id="mobile-nav"
          className="flex lg:hidden flex-col px-[clamp(3rem,6vw,8rem)] py-[clamp(1rem,5vw,6rem)] gap-10"
        >
          {StoryElements.map(({ title, img, ...props }, i) => (
            <Link
              className={`
              font-sans text-4xl sm:text-6xl md:text-8xl no-underline relative
              text-center lg:text-start transition-all duration-300
              ${scrolled === title ? "text-blue-100" : "text-black/25 scale-90"}
              `}
              key={i}
              {...props}
            >
              <div
                className={`border-y-2 z-[2] py-2 ${
                  scrolled === title ? "border-y-black" : "border-y-transparent"
                }`}
              >
                <Scrambled
                  className={`block relative z-[2] ${
                    scrolled === title ? "opacity-100" : "opacity-25"
                  }`}
                  delay={TEXT.delay}
                  speed={TEXT.speed}
                  color={{
                    dud: scrolled === title ? "text-neutral-400" : "text-black",
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
                />
              </div>
              {img && (
                <img
                  className={`
                  absolute -translate-y-1/2 left-1/2 -translate-x-1/2
                  [transition:_transform_250ms,_opacity_250ms] pointer-events-none w-[95vw] max-w-[100vw]
                  ${
                    scrolled === title
                      ? "opacity-60 scale-100"
                      : "opacity-0 scale-50"
                  }`}
                  alt={title}
                  src={img}
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
          {StoryElements.map(({ title, img, ...props }, i) => (
            <Link
              className={`
              font-sans text-[clamp(3rem,6vw,8rem)] font-light no-underline relative
              text-center lg:text-start transition-all duration-300
              ${selected === title ? "text-blue-100" : "text-black/25 scale-95"}
              `}
              key={i}
              onMouseMove={onHover(title)}
              {...props}
            >
              <div
                className={`border-y-2 z-[2] transition-all ${
                  selected === title
                    ? img
                      ? "border-y-neutral-400 bg-black/25"
                      : "border-y-neutral-400 bg-neutral-400/10"
                    : "border-y-transparent"
                }
                `}
              >
                <Scrambled
                  className={`block relative z-[2] ${
                    selected === title ? "opacity-100" : "opacity-30"
                  }`}
                  delay={TEXT.delay}
                  speed={TEXT.speed}
                  color={{
                    dud: selected === title ? "text-neutral-400" : "text-black",
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
                />
              </div>
              {img && (
                <img
                  className={`
                  absolute -translate-y-1/2 -translate-x-1/2 z-0 top-2/3 left-2/3
                  [transition:_transform_250ms,_opacity_250ms] pointer-events-none w-[min(80vw,900px)]
                  ${
                    selected === title
                      ? "opacity-60 scale-100"
                      : "opacity-0 scale-50"
                  }
                  `}
                  alt={title}
                  src={img}
                />
              )}
            </Link>
          ))}
        </nav>
        <div className="h-[60vh] lg:h-0" />
      </div>
    </LoadedIn>
  );
};

export default withHead(Home, {
  title: "d-exclaimation",
  description: "d-exclaimation",
});
