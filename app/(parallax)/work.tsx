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
import ImageCannon from "../(components)/image-cannon";
import ResponsiveParallaxLayer from "../(components)/responsive-parallax-layer";

import personal_md from "@/(parallax)/(assets)/d-exclaimation-md.webp";
import personal from "@/(parallax)/(assets)/d-exclaimation.webp";
import omdb_md from "@/(parallax)/(assets)/omdb-md.webp";
import omdb from "@/(parallax)/(assets)/omdb.webp";
import partly_md from "@/(parallax)/(assets)/partly-md.webp";
import partly from "@/(parallax)/(assets)/partly.webp";
import pioneer_md from "@/(parallax)/(assets)/pioneer-md.webp";
import pioneer from "@/(parallax)/(assets)/pioneer.webp";
import pixle_md from "@/(parallax)/(assets)/pixle-md.webp";
import pixle from "@/(parallax)/(assets)/pixle.webp";
import relax_md from "@/(parallax)/(assets)/relax-md.webp";
import relax from "@/(parallax)/(assets)/relax.webp";
import seraph_md from "@/(parallax)/(assets)/seraph-md.webp";
import seraph from "@/(parallax)/(assets)/seraph.webp";
import spotlight_md from "@/(parallax)/(assets)/spotlight-md.webp";
import spotlight from "@/(parallax)/(assets)/spotlight.webp";

const works = [
  {
    name: "spotlight",
    description: "Browsing news streamlined, supercharged, and simplified",
    href: "https://spotlight.d-exclaimation.me",
    year: "2023",
    images: {
      md: spotlight_md,
      base: spotlight,
    },
  },
  {
    name: "d-exclaimation.me",
    description: "My life, my work, my passion",
    href: "https://d-exclaimation.me",
    year: "2021",
    images: {
      md: personal_md,
      base: personal,
    },
  },
  {
    name: "pixle",
    description: "Time to start making memories, 1 photo at a time",
    href: "https://experimental.pixle.app",
    year: "2023",
    images: {
      md: pixle_md,
      base: pixle,
    },
  },
  {
    name: "omdb",
    description: "Web movies made simple",
    href: "https://omdb.d-exclaimation.me",
    year: "2023",
    images: {
      md: omdb_md,
      base: omdb,
    },
  },
  {
    name: "partly",
    description: "Worked on Partly's core seller experience, PartsPal",
    href: "https://partly.com",
    year: "2022",
    images: {
      md: partly_md,
      base: partly,
    },
  },
  {
    name: "pioneer",
    description: "GraphQL server for Swift",
    href: "https://pioneer.dexclaimation.com",
    year: "2022",
    images: {
      md: pioneer_md,
      base: pioneer,
    },
  },

  {
    name: "relax",
    description: "AI powered Slack assistant for agile teams",
    href: "https://relax.d-exclaimation.me",
    year: "2023",
    images: {
      md: relax_md,
      base: relax,
    },
  },
  {
    name: "seraph",
    description: "Hassle-free web apps in an instant",
    href: "https://seraph.dexclaimation.com",
    year: "2023",
    images: {
      md: seraph_md,
      base: seraph,
    },
  },
] as const;

const scramble = {
  delay: 10_000,
  speed: 40,
} as const;

type Work = {
  name: string;
  description: string;
  href: string;
  year: string;
  images: {
    md: StaticImageData;
    base: StaticImageData;
  };
};

type Props = {
  kind: (typeof works)[number]["name"];
  offset: number;
  maxOffset: number;
  onClick: (offset: number) => void;
};

const Work = rc<Props>(({ kind, offset, maxOffset, onClick }) => {
  const { name, description, href, year, images } = works.find(
    (work) => work.name === kind
  ) as Work;
  return (
    <>
      <ResponsiveParallaxLayer offset={offset} speed={0.6}>
        <span className="absolute top-[17.5dvh] md:top-[10dvh] lg:top-[6dvh] right-[5vw] text-[16vh] md:text-[30vh] leading-none font-semibold text-neutral-200 md:text-neutral-300 dark:text-neutral-800 md:dark:text-neutral-700 z-10">
          {year}
        </span>
      </ResponsiveParallaxLayer>
      <ParallaxLayer className="z-0" offset={offset} speed={0.4}>
        <div className="absolute top-[calc(10dvh+2.25rem)] md:top-[calc(10dvh+3.5rem)] lg:top-[10dvh] xl:top-[10.5dvh] left-[5vw] z-20 flex items-start justify-center flex-col">
          <p className="max-w-[90vw] md:max-w-xl text-black/50 dark:text-white/50">
            {description}
          </p>
        </div>
      </ParallaxLayer>
      <ResponsiveParallaxLayer className="z-0" offset={offset} speed={0.2}>
        <div className="absolute bottom-[5vh] left-0 md:left-[5vw] z-30">
          <ImageCannon
            alt={name}
            className="hidden md:block w-[65vw] max-w-[1050px] aspect-auto z-30"
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
      </ResponsiveParallaxLayer>
      <ResponsiveParallaxLayer offset={offset} speed={0.4}>
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
          className="absolute top-[10dvh] lg:top-[4dvh] left-[5vw] z-20 flex items-start justify-center flex-col group"
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
      </ResponsiveParallaxLayer>
    </>
  );
});

export default Work;
