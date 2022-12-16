//
//  Manifest.ts
//  d-exclaimation
//
//  Created by d-exclaimation on 13 Dec 2022
//

import { of } from "./Array";

type Route = {
  name: string;
  href: string;
};

export const manifest = {
  routes: of<Route>(
    {
      name: "Home",
      href: "/",
    },
    {
      name: "Conway's Game of Life",
      href: "/minigames/conway",
    },
    {
      name: "Projects",
      href: "https://github.com/d-exclaimation",
    },
    {
      name: "Resume",
      href: "https://resume.dexclaimation.com",
    }
  ),
};
