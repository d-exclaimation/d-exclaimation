"use client";

//
//  poker.tsx
//  d-exclaimation
//
//  Created by d-exclaimation on 27 Oct 2023
//

import { rc } from "@d-exclaimation/next";
import { animated, to, useInView, useSprings } from "@react-spring/web";
import { useDrag } from "@use-gesture/react";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "../(components)/link";
import ResponsiveParallaxLayer from "../(components)/responsive-parallax-layer";
import Scrambled from "../(components)/scrambled";

const scramble = {
  delay: 10_000,
  speed: 25,
} as const;

const springTo = (i: number) => ({
  x: 0,
  y: i * -4,
  scale: 1,
  rot: -10 + Math.random() * 20,
  delay: i * 100,
  opacity: 1,
});
const springFrom = (_i: number) => ({
  x: 0,
  rot: 0,
  scale: 1.5,
  y: -1000,
  opacity: 0.2,
});

const trans = (r: number, s: number) =>
  `rotateX(10deg) rotateY(${r / 20}deg) rotateZ(${r}deg) scale(${s})`;

type Props = {
  cards: {
    name: string;
    description: string;
    href: string;
    year: string;
    image: string;
  }[];
};

const Poker = rc<Props>(({ cards }) => {
  const [index, setIndex] = useState(-1);
  const [isLoaded, setIsLoaded] = useState(false);
  const [ref, isInView] = useInView({
    rootMargin: "0px 0px 0px 0px",
  });
  const [props, api] = useSprings(cards.length, (i) => ({
    ...springFrom(i),
  }));
  const gone = useRef(new Set<number>());

  const card = useMemo(() => cards[index], [index]);

  const bind = useDrag(
    ({ args: [index], down, movement: [mx, my], velocity }) => {
      const trigger =
        velocity[1] > 4 ||
        Math.sqrt(Math.abs(my) ** 2 + Math.abs(mx) ** 2) > 250;
      const dir = -1;
      if (trigger) {
        gone.current.add(index);
        setIndex(index - 1);
      }
      api.start((i) => {
        if (index !== i) return;
        const isGone = gone.current.has(index);
        const y = isGone ? (200 + window.innerHeight) * dir : down ? my : 0;
        const x = isGone || down ? mx : 0;
        const rot = my / 100 + (isGone ? dir * 10 * velocity[0] : 0);
        const scale = down ? 1.1 : 1;
        const opacity = isGone ? 0.2 : 1;
        return {
          x,
          y,
          rot,
          scale,
          opacity,
          delay: undefined,
          config: { friction: 50, tension: isGone ? 200 : down ? 800 : 500 },
        };
      });
      if (gone.current.size === cards.length) {
        setTimeout(() => {
          gone.current.clear();
          setIndex(cards.length - 1);
          api.start((i) => springTo(i));
        }, 600);
      }
    }
  );

  useEffect(() => {
    if (!isInView) return;
    setIsLoaded(true);
  }, [isInView]);

  useEffect(() => {
    if (typeof window === "undefined" || !isLoaded) {
      return;
    }
    const timeout = setTimeout(() => {
      api.start((i) => springTo(i));
      setIndex(cards.length - 1);
    }, 300);

    return () => clearTimeout(timeout);
  }, [isLoaded]);

  return (
    <ResponsiveParallaxLayer
      className="z-10 w-full h-[100dvh] overflow-hidden flex items-center justify-center gap-4"
      offset={1}
      speed={0.2}
    >
      <div
        ref={ref}
        className="relative w-[400px] md:w-[450px] flex items-center justify-center"
      >
        {props.map(({ x, y, rot, scale }, i) => (
          <animated.div
            className="absolute flex items-center justify-center w-[400px] will-change-transform touch-none"
            key={i}
            style={{ x, y }}
          >
            {/* This is the card itself, we're binding our gesture to it (and inject its index so we know which is which) */}
            <animated.div
              className="p-1.5 bg-white/80 dark:bg-neutral-700/50 backdrop-blur-lg shadow-md will-change-transform rounded-lg"
              {...bind(i)}
              style={{
                transform: to([rot, scale], trans),
              }}
            >
              <img
                className="[user-drag:none] [-webkit-user-drag:none] select-none h-[400px] md:h-[500px] rounded-sm"
                src={cards[i].image}
                alt={cards[i].name}
              />
            </animated.div>
          </animated.div>
        ))}
      </div>

      {card ? (
        <div
          key={card.name}
          className="hidden relative md:flex flex-col w-[400px] animate-appear gap-2"
        >
          <Link href={card.href} external>
            <Scrambled
              className="font-bold text-4xl dark:text-white group-hover:underline dark:data-[dud=true]:text-white/50"
              align="items-start"
              justify="justify-start"
              phrases={[card.name, card.name]}
              speed={scramble.speed}
              delay={scramble.delay}
            />
          </Link>
          <span className="text-black dark:text-white">{card.description}</span>
        </div>
      ) : (
        <div
          key="fake-card"
          className="hidden md:flex flex-col w-[400px] animate-appear invisible gap-2"
        >
          <Scrambled
            className="font-bold text-4xl dark:text-white group-hover:underline dark:data-[dud=true]:text-white/50"
            align="items-start"
            justify="justify-start"
            phrases={["loading"]}
            speed={scramble.speed}
            delay={scramble.delay}
          />
          <span>loading...</span>
        </div>
      )}

      {card && (
        <div
          key={`${card.name}-mobile`}
          className="fixed bottom-12 flex md:hidden flex-col items-center justify-center w-[60vw] animate-appear gap-1.5"
        >
          <Link href={card.href} external>
            <Scrambled
              className="font-bold text-xl dark:text-white group-hover:underline dark:data-[dud=true]:text-white/50"
              align="items-start"
              justify="justify-start"
              phrases={[card.name, card.name]}
              speed={scramble.speed}
              delay={scramble.delay}
            />
          </Link>
          <span className="text-sm text-center [text-wrap:balance] text-black dark:text-white">
            {card.description}
          </span>
        </div>
      )}
    </ResponsiveParallaxLayer>
  );
});

export default Poker;
