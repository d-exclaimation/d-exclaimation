//
//  Link.ts
//  dexclaimation
//
//  Created by d-exclaimation on 11 Dec 2022
//

import type { Color } from "./Styling";

export type Link = {
  site: string;
  username: string;
  href: string;
  color: {
    dud: Color.Text;
    normal: Color.Text;
  };
};

export const links = (...literals: Link[]) => literals;
