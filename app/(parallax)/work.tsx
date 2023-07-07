"use client";

//
//  work.tsx
//  d-exclaimation
//
//  Created by d-exclaimation on 08 Jul 2023
//

import Link from "@/(components)/link";
import Scrambled from "@/(components)/scrambled";
import { rc } from "@d-exclaimation/next";
import { ParallaxLayer } from "@react-spring/parallax";
import type { StaticImageData } from "next/image";
import Image from "next/image";

const scramble = {
  delay: 10_000,
  speed: 40,
} as const;

type Props = {
  name: string;
  description: string;
  href: string;
  year: string;
  images: {
    md: StaticImageData;
    base: StaticImageData;
  };
  offset: number;
  maxOffset: number;
  onClick: (offset: number) => void;
};

const Work = rc<Props>(
  ({ name, description, href, images, year, offset, maxOffset, onClick }) => {
    return (
      <>
        <ParallaxLayer offset={offset} speed={0.6}>
          <span className="absolute top-[20dvh] md:top-[10dvh] right-[5vw] text-[18vh] md:text-[30vh] leading-none font-semibold text-neutral-200 md:text-neutral-300 dark:text-neutral-800 md:dark:text-neutral-700 z-10">
            {year}
          </span>
        </ParallaxLayer>
        <ParallaxLayer className="z-0" offset={offset} speed={0.4}>
          <div className="absolute top-[calc(10dvh+2.25rem)] md:top-[calc(10dvh+3.5rem)] left-[5vw] z-20 flex items-start justify-center flex-col">
            <p className="max-w-[90vw] md:max-w-xl dark:text-white">
              {description}
            </p>
          </div>
        </ParallaxLayer>
        <ParallaxLayer className="z-0" offset={offset} speed={0.2}>
          <div className="absolute bottom-[5vh] left-0 md:left-[5vw] z-30">
            <Image
              alt={name}
              className="hidden md:block w-[75vw] max-w-[905px] aspect-auto z-30"
              src={images.md}
              sizes="75vw"
              placeholder="blur"
              priority
            />
            <Image
              alt={name}
              className="md:hidden w-[80vw] z-30"
              sizes="80vw"
              src={images.base}
              placeholder="blur"
            />
          </div>
        </ParallaxLayer>
        <ParallaxLayer offset={offset} speed={0.4}>
          <div className="absolute z-50 bottom-8 right-5 p-1 flex flex-col items-center gap-2 rounded-full">
            {offset !== 1 && (
              <button
                className="flex items-center justify-center p-1.5 md:p-2 w-8 h-8 md:w-10 md:h-10 
                transition-all rounded-full bg-neutral-300/50 dark:bg-neutral-700/50
                hover:bg-neutral-300/75 active:bg-neutral-300/75
                dark:hover:bg-neutral-700/75 dark:active:bg-neutral-700/75"
                onClick={() => onClick(offset - 1)}
              >
                <img
                  className="dark:invert"
                  src="/icon/arrow-up.svg"
                  alt="previous"
                />
              </button>
            )}

            {offset !== maxOffset && (
              <button
                className="flex items-center justify-center p-1.5 md:p-2 w-8 h-8 md:w-10 md:h-10 
                transition-all rounded-full bg-neutral-300/50 dark:bg-neutral-700/50
                hover:bg-neutral-300/75 active:bg-neutral-300/75
                dark:hover:bg-neutral-700/75 dark:active:bg-neutral-700/75"
                onClick={() => onClick(offset + 1)}
              >
                <img
                  className="dark:invert"
                  src="/icon/arrow-down.svg"
                  alt="next"
                />
              </button>
            )}
          </div>
          <Link
            className="absolute bottom-8 left-[5vw] z-40 py-2 px-3 flex items-center gap-1 
            bg-neutral-300/50 dark:bg-neutral-700/50 backdrop-blur-lg rounded-full 
            hover:bg-neutral-300/75 active:bg-neutral-300/75 transition-all duration-300
            dark:hover:bg-neutral-700/75 dark:active:bg-neutral-700/75"
            href={href}
            external
          >
            <span className="dark:text-white">View</span>
            <img
              className="w-5 h-5 rotate-45 dark:invert"
              src="/icon/arrow-up.svg"
              alt="open"
            />
          </Link>

          <Link
            className="absolute top-[10dvh] left-[5vw] z-20 flex items-start justify-center flex-col group"
            href={href}
            external
          >
            <Scrambled
              className="font-bold text-3xl md:text-5xl dark:text-white group-hover:underline dark:data-[dud=true]:text-white/50"
              align="items-start"
              justify="justify-start"
              phrases={[name, name]}
              speed={scramble.speed}
              delay={scramble.delay}
            />
          </Link>
        </ParallaxLayer>
      </>
    );
  }
);

export default Work;
