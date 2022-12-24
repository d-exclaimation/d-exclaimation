//
//  Manifest.ts
//  d-exclaimation
//
//  Created by d-exclaimation on 13 Dec 2022
//

import { of } from "./Array";
import type { OutLink } from "./Link";

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
      name: "Business card",
      href: "/business/card",
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
      username: "@dexclaimation",
      href: "https://twitter.com/dexclaimation",
      color: { dud: "text-sky-200", normal: "text-sky-500" },
    },
    {
      site: "Facebook",
      username: "@dexclaimation",
      href: "https://facebook.com/dexclaimation",
      color: { dud: "text-blue-200", normal: "text-blue-500" },
    },
    {
      site: "Instagram",
      username: "@dexclaimation",
      href: "https://instagram.com/dexclaimation",
      color: { dud: "text-fuchsia-200", normal: "text-fuchsia-500" },
    },
    {
      site: "Linkedin",
      username: "@d-exclaimation",
      href: "https://linkedin.com/in/d-exclaimation",
      color: { dud: "text-cyan-200", normal: "text-cyan-500" },
    }
  ),
  handles: {
    name: "https://facebook.com/dexclaimation",
    email: "mailto:vincent@d-exclaimation.me",
    site: "https://d-exclaimation.me",
    instagram: "https://instagram.com/dexclaimation",
    linkedin: "https://linkedin.com/in/d-exclaimation",
  },
};

export type Manifest = typeof manifest;
