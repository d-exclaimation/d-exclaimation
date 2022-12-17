//
//  Link.ts
//  dexclaimation
//
//  Created by d-exclaimation on 11 Dec 2022
//

import type { Color } from "./Styling";

/**
 * Off-site link
 */
export type OutLink = {
  site: string;
  username: string;
  href: string;
  color: {
    dud: Color.Text;
    normal: Color.Text;
  };
};
