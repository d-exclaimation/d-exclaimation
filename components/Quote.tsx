//
//  Quote.tsx
//  dexclaimation
//
//  Created by d-exclaimation on 11 Dec 2022
//

import type { ReactNode } from "react";
import type { XFC } from "../common/XFC";

/**
 * Create quote text
 * @param param0.children The text element to be made into quote
 */
const Quote: XFC<{ children: ReactNode }> = ({ children, className }) => (
  <span className={`font-serif italic ${className ?? ""}`}>"{children}"</span>
);

export default Quote;
