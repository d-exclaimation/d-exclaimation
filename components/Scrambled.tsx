"use client";

//
//  Scrambled.tsx
//  dexclaimation
//
//  Created by d-exclaimation on 11 Dec 2022
//

import { type Palette } from "@d-exclaimation/common/tailwind";
import { DUDS, useScramble } from "../hooks/useScramble";
import { rc } from "../next/rc";

type Props = {
  className?: string;
  phrases: string[];
  speed?: number;
  delay?: number;
  align: "items-center" | "items-start" | "items-end";
  justify: "justify-center" | "justify-start" | "justify-end";
  wrap?: boolean;
  color?: {
    normal: Palette["text"];
    dud: `data-[dud=true]:${Palette["text"]}`;
  };
  active?: boolean;
};

/**
 * Create a scrambled animated text from phrases given
 * @param param0.phrases Phrases to transition from one to another
 * @param param0.delay The delay between transition in ms
 * @param param0.speed The delay during each scrambling transition in ms
 * @param param0.align The alignment of the text
 * @param param0.justify The jusitfy of the text
 * @param param0.style The motion styling for the text
 * @param param0.wrap Should the text wrap around or not
 * @param param0.color The color styling for the text and its state
 */
const Scrambled = rc<Props>(
  ({
    phrases,
    delay,
    speed,
    align,
    justify,
    className,
    wrap,
    color,
    active,
  }) => {
    const text = useScramble(phrases, speed, delay);

    return (
      <span
        className={`group flex flex-row ${justify} ${align} 
        ${wrap ? "flex-wrap" : ""}`}
      >
        {text.map((char, i) => (
          <span
            className={`font-mono data-[space=true]:!opacity-0 
            ${color?.normal ?? "text-gray-800"}
            ${color?.dud ?? "data-[dud=true]:text-gray-300"}
            ${className}`}
            key={`${i}-${char}`}
            data-dud={DUDS.indexOf(char) !== -1}
            data-space={char === " "}
            data-active={active}
          >
            {char === " " ? "_" : char}
          </span>
        ))}
      </span>
    );
  }
);

export default Scrambled;
