//
//  Quote.tsx
//  dexclaimation
//
//  Created by d-exclaimation on 11 Dec 2022
//

import type { ReactNode } from "react";
import type { XFC } from "../types/XFC";

const Quote: XFC<{ children: ReactNode }> = ({ children, className }) => (
  <span className={`font-serif italic ${className ?? ""}`}>"{children}"</span>
);

export default Quote;
