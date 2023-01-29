//
//  cinderbloc.tsx
//  d-exclaimation
//
//  Created by d-exclaimation on 25 Jan 2023
//

import Link from "next/link";
import { FC } from "react";
import { preloadImage } from "../common/Image";
import { manifest, Stories } from "../common/Manifest";
import LoadedIn from "../components/LoadedIn";
import Scrambled from "../components/Scrambled";
import { withHead } from "../hoc/withHead";
import { useScrollSelection } from "../hooks/minigames/cinderbloc/useScrollSelection";
import { useSelectScrolling } from "../hooks/minigames/cinderbloc/useSelectScrolling";

const StoryTitles = Object.keys(manifest.stories) as Array<keyof Stories>;
const StoryElements = Object.entries(manifest.stories).map(
  ([title, { img, ...other }]) => {
    return {
      title: title as keyof Stories,
      img,
      ...other,
    };
  }
);

const Home: FC = () => {
  // Mobile scrolling
  const scrolled = useScrollSelection(StoryTitles);

  // Desktop select scrolling
  const [{ mouse, selected }, { onHover, onMouseMove, onClear }] =
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
        <div className="opacity-0 h-[25vh]" />

        {/* Mobile View */}
        <nav
          id="mobile-nav"
          className="flex lg:hidden flex-col px-[clamp(3rem,6vw,8rem)] py-[clamp(1rem,5vw,6rem)] gap-10"
        >
          {StoryElements.map(({ title, img, ...props }, i) => (
            <Link
              className={`
              font-sans text-4xl sm:text-6xl md:text-8xl no-underline relative
              text-center lg:text-start
              ${scrolled === title ? "text-blue-100" : "text-black/25"}
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
                  delay={2000}
                  speed={20}
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
                      ? "opacity-100 scale-100"
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
              text-center lg:text-start
              ${selected === title ? "text-blue-100" : "text-black/25"}
              `}
              key={i}
              onMouseMove={onHover(title)}
              {...props}
            >
              <div
                className={`border-y-2 z-[2] ${
                  selected === title ? "border-y-black" : "border-y-transparent"
                }`}
              >
                <Scrambled
                  className={`block relative z-[2] ${
                    selected === title ? "opacity-100" : "opacity-25"
                  }`}
                  delay={2000}
                  speed={20}
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
                  absolute -translate-y-1/2 -translate-x-1/2 z-0
                  [transition:_transform_250ms,_opacity_250ms] pointer-events-none w-[min(90vw,900px)]
                  ${
                    selected === title
                      ? "opacity-100 scale-100"
                      : "opacity-0 scale-50"
                  }
                  `}
                  alt={title}
                  style={mouse}
                  src={img}
                />
              )}
            </Link>
          ))}
        </nav>
        <div className="h-[40vh] lg:h-0" />
      </div>
    </LoadedIn>
  );
};

export default withHead(Home, {
  title: "d-exclaimation",
  description: "d-exclaimation",
});
