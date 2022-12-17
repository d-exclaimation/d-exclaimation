//
//  Manifest.ts
//  d-exclaimation
//
//  Created by d-exclaimation on 13 Dec 2022
//

import { of } from "./Array";
import { OutLink } from "./Link";

/**
 * Route within the application
 */
type Route = {
  name: string;
  href: string;
};

/**
 * Web application source of truth for metadata i.e. (routes, links, etc)
 */
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
  links: of<OutLink>(
    {
      site: "Github",
      username: "@d-exclaimation",
      href: "https://github.com/d-exclaimation",
      color: { dud: "text-slate-200", normal: "text-slate-500" },
    },
    {
      site: "Twitter",
      username: "@d_exclaimation",
      href: "https://twitter.com/d_exclaimation",
      color: { dud: "text-sky-200", normal: "text-sky-500" },
    },
    {
      site: "Facebook",
      username: "@vvincentlc",
      href: "https://facebook.com/vvincentlc",
      color: { dud: "text-blue-200", normal: "text-blue-500" },
    },
    {
      site: "Instagram",
      username: "@d_exclaimation",
      href: "https://instagram.com/d_exclaimation",
      color: { dud: "text-fuchsia-200", normal: "text-fuchsia-500" },
    },
    {
      site: "Linkedin",
      username: "@d-exclaimation",
      href: "https://linkedin.com/in/d-exclaimation",
      color: { dud: "text-cyan-200", normal: "text-cyan-500" },
    }
  ),
};
