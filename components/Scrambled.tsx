//
//  Scrambled.tsx
//  dexclaimation
//
//  Created by d-exclaimation on 11 Dec 2022
//

import { motion, MotionStyle } from "framer-motion";
import type { Color } from "../common/Styling";
import type { XFC } from "../common/XFC";
import { DUDS, useScramble } from "../hooks/useScramble";

type Props = {
  phrases: string[];
  speed?: number;
  delay?: number;
  align: "items-center" | "items-start" | "items-end";
  justify: "justify-center" | "justify-start" | "justify-end";
  style?: MotionStyle;
  wrap?: boolean;
  color?: {
    dud: Color.Text;
    normal: Color.Text;
  };
};

const Scrambled: XFC<Props> = ({
  phrases,
  delay,
  speed,
  align,
  justify,
  className,
  style,
  wrap,
  color,
}) => {
  const text = useScramble(phrases, speed, delay);
  return (
    <span
      className={`flex flex-row ${justify} ${align} ${wrap ? "flex-wrap" : ""}`}
    >
      {text.map((char, i) => (
        <motion.span
          className={`font-mono ${char === " " ? "opacity-0" : "opacity-100"} ${
            DUDS.indexOf(char) === -1
              ? color?.normal ?? "text-gray-800"
              : color?.dud ?? "text-gray-300"
          } ${className}`}
          key={`${i}-${char}`}
          style={style}
        >
          {char === " " ? "_" : char}
        </motion.span>
      ))}
    </span>
  );
};

export default Scrambled;
