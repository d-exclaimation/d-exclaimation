"use client";

//
//  scrambled.tsx
//  dexclaimation
//
//  Created by d-exclaimation on 11 Dec 2022
//

import { DUDS, useScramble } from "@/(hooks)/useScramble";
import { type Palette } from "@d-exclaimation/common/tailwind";

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
  from?: string;
  label?: string;
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
 * @param param0.from The text to scramble from, defaults to the first phrase
 * @param param0.label Accessible text; hides the scrambling characters from screen readers
 */
function Scrambled({
  phrases,
  delay,
  speed,
  align,
  justify,
  className,
  wrap,
  color,
  active,
  from,
  label,
}: Props) {
  const text = useScramble(phrases, speed, delay, from);

  return (
    <span
      className={`group flex flex-row ${justify} ${align} 
      ${wrap ? "flex-wrap" : ""}`}
    >
      {label && <span className="sr-only">{label}</span>}
      {text.map((char, i) => (
        <span
          className={`font-mono data-[space=true]:opacity-0! 
          ${color?.normal ?? "text-gray-800"}
          ${color?.dud ?? "data-[dud=true]:text-gray-300"}
          ${className}`}
          key={`${i}-${char}`}
          data-dud={DUDS.indexOf(char) !== -1}
          data-space={char === " "}
          data-active={active}
          aria-hidden={label ? true : undefined}
        >
          {char === " " ? "_" : char}
        </span>
      ))}
    </span>
  );
}

export default Scrambled;
