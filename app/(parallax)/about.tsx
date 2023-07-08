"use client";

//
//  about.tsx
//  d-exclaimation
//
//  Created by d-exclaimation on 08 Jul 2023
//

import Scrambled from "@/(components)/scrambled";
import { rc } from "@d-exclaimation/next";
import { ParallaxLayer } from "@react-spring/parallax";
import { useEffect, useState } from "react";

const scramble = {
  delay: 10_000,
  speed: 40,
} as const;

type Props = {
  onNext: () => void;
};

const About = rc<Props>(({ onNext }) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setLoaded(true), 1000);
    return () => clearTimeout(timeout);
  }, [setLoaded]);

  return (
    <ParallaxLayer
      className="z-10 w-full h-full py-12 flex flex-col items-center justify-center gap-4"
      offset={0}
      speed={0.2}
    >
      <section className="w-[90vw] max-w-2xl flex flex-col items-center animate-fade-in">
        <div
          className="relative w-24 h-24 lg:w-32 lg:h-32 flex-shrink-0 flex items-center justify-center group mb-5"
          data-active={loaded}
          onMouseEnter={() => setLoaded(true)}
          onTouchStart={() => setLoaded(true)}
        >
          <span
            className="w-24 h-24 lg:w-32 lg:h-32 absolute rounded-full transition-all duration-1000 bg-orange-400/75 
            dark:bg-orange-400/30 group-data-active:blur-md md:group-data-active:blur-lg group-data-active:-translate-x-2"
          />
          <span
            className="w-24 h-24 lg:w-32 lg:h-32 absolute rounded-full transition-all duration-1000 bg-lime-400/75 
            dark:bg-lime-400/30 group-data-active:blur-md md:group-data-active:blur-lg group-data-active:translate-x-2"
          />
          <img
            className="relative w-24 h-24 lg:w-32 lg:h-32 object-cover aspect-square transition-all duration-700 rounded-full group-data-active:grayscale-0 grayscale"
            src="https://avatars.githubusercontent.com/u/70748917?v=4"
          />
        </div>
        <Scrambled
          align="items-start"
          justify="justify-start"
          phrases={["d-exclaimation", "vincent"]}
          className="text-3xl font-bold dark:text-white dark:data-[dud=true]:text-white/50 mt-2"
          speed={scramble.speed}
          delay={scramble.delay}
        />
        <div className="w-full flex items-center justify-center text-center [text-wrap:balance] gap-4 my-4 dark:text-white">
          <p>
            I'm not much of a talker, so let's make this short and sweet, I'm a
            software engineer trying to build things that are meaningful and
            impactful.
          </p>
        </div>
        <button
          className="mt-8 flex flex-col items-center animate-up-down select-none focus:outline-none"
          onClick={onNext}
        >
          <span className="text-xs text-black/40 dark:text-white/40 mb-1">
            <span className="text-black/50 dark:text-white/50">Scroll</span> to
            view my work
          </span>
          <div
            className="bg-neutral-300/50 backdrop-blur-lg rounded-full p-2 flex items-center justify-center
            hover:bg-neutral-300/75 active:bg-neutral-300/75 transition-all duration-300
            dark:bg-neutral-700/50 dark:hover:bg-neutral-700/75 dark:active:bg-neutral-700/75"
          >
            <img src="/icon/arrow-down.svg" className="w-5 h-5 dark:invert" />
          </div>
        </button>
      </section>
    </ParallaxLayer>
  );
});

export default About;
