//
//  Link.ts
//  dexclaimation
//
//  Created by d-exclaimation on 11 Dec 2022
//

export type Link = {
  site: string;
  username: string;
  href: string;
  color: {
    dud: string;
    normal: string;
  };
};

export const links = (...literals: Link[]) => literals;
