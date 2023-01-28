//
//  cinderbloc.tsx
//  d-exclaimation
//
//  Created by d-exclaimation on 25 Jan 2023
//

import * as Progress from "@radix-ui/react-progress";
import Link from "next/link";
import { FC, useEffect, useState } from "react";
import { manifest, Stories } from "../common/Manifest";
import Scrambled from "../components/Scrambled";
import { withHead } from "../hoc/withHead";
import { useScrollSelection } from "../hooks/minigames/cinderbloc/useScrollSelection";
import { useSelectScrolling } from "../hooks/minigames/cinderbloc/useSelectScrolling";
import { useResetScroll } from "../hooks/useResetScroll";

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
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  // Mobile scrolling
  const scrolled = useScrollSelection(StoryTitles);

  // Desktop select scrolling
  const [{ mouse, selected }, { onHover, onMouseMove, onClear }] =
    useSelectScrolling(StoryTitles);

  useResetScroll();

  useEffect(() => {
    // Loading animation
    setProgress(30);
    const timeouts = [
      setTimeout(() => setProgress(100), 500),
      setTimeout(() => setLoading(false), 1000),
    ];

    // Preload images
    StoryElements.forEach(({ img }) => {
      if (!img) return;
      const preloader = new Image();
      preloader.src = img;
    });

    return () => timeouts.forEach((timeout) => clearTimeout(timeout));
  }, []);

  return (
    <>
      {/* Loading  */}
      {loading && (
        <div className="flex items-center justify-center transition-transform w-screen h-screen">
          <Progress.Root className="overflow-hidden rounded-full max-w-xl w-[75vw] h-6 [transform:translateZ(0)] bg-neutral-300">
            <Progress.Indicator
              className="bg-neutral-800 w-full h-full transition-transform duration-500"
              style={{ transform: `translateX(-${100 - progress}%)` }}
            />
          </Progress.Root>
        </div>
      )}

      {/* Page */}
      <div
        className={`transition-opacity duration-700 ${
          loading ? "scale-0 opacity-0" : "scale-100 opacity-100"
        }`}
      >
        <div className="opacity-0 h-[25vh]" />

        {/* Mobile View */}
        <nav
          id="mobile-nav"
          className="flex md:hidden flex-col p-[clamp(1rem,5vw,6rem)] gap-10"
        >
          {StoryElements.map(({ title, img, ...props }, i) => (
            <Link
              className={`
              font-sans text-4xl no-underline relative
              text-center md:text-start
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
                  justify="justify-center"
                  phrases={[title, title]}
                />
              </div>
              {img && (
                <img
                  className={`
                  absolute -translate-y-1/2 
                  [transition:_transform_250ms,_opacity_250ms] pointer-events-none w-[min(90vw,800px)]
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
          className="hidden md:flex flex-col gap-2 p-[clamp(1rem,5vw,6rem)]"
          onMouseMove={onMouseMove}
          onMouseLeave={onClear}
        >
          {StoryElements.map(({ title, img, ...props }, i) => (
            <a
              className={`
            font-sans text-[clamp(3rem,6vw,8rem)] font-light no-underline relative
            text-center md:text-start
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
                  [transition:_transform_250ms,_opacity_250ms] pointer-events-none w-[min(90vw,800px)]
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
            </a>
          ))}
        </nav>
        <div className="h-[40vh] md:h-0" />
      </div>
    </>
  );
};

export default withHead(Home, {
  title: "d-exclaimation",
  description: "d-exclaimation",
});
