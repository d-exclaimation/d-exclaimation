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
      name: "About",
      href: "/about",
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
      name: "Professinal handle",
      href: "/business/handle",
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
      color: { dud: "text-sky-300", normal: "text-sky-500" },
    },
    {
      site: "Facebook",
      username: "@dexclaimation",
      href: "https://facebook.com/dexclaimation",
      color: { dud: "text-blue-300", normal: "text-blue-500" },
    },
    {
      site: "Instagram",
      username: "@dexclaimation",
      href: "https://instagram.com/dexclaimation",
      color: { dud: "text-fuchsia-300", normal: "text-fuchsia-500" },
    },
    {
      site: "Linkedin",
      username: "@d-exclaimation",
      href: "https://linkedin.com/in/d-exclaimation",
      color: { dud: "text-cyan-300", normal: "text-cyan-600" },
    }
  ),
  handles: {
    name: "https://facebook.com/dexclaimation",
    email: "mailto:vincent@d-exclaimation.me",
    site: "https://d-exclaimation.me",
    instagram: "https://instagram.com/dexclaimation",
    linkedin: "https://linkedin.com/in/d-exclaimation",
  },

  stories: {
    "d-exclaimation": {
      href: "/#",
      img: undefined,
    },

    about: {
      href: "/about",
      img: undefined,
    },

    partly: {
      href: "https://partly.com",
      img: "/artpiece/partly.webp",
    },

    university: {
      href: "https://www.canterbury.ac.nz/",
      img: "/artpiece/uc.webp",
    },

    pioneer: {
      href: "https://pioneer.dexclaimation.com",
      img: "/artpiece/pioneer.webp",
    },

    christchurch: {
      href: "https://www.christchurchnz.com",
      img: "/artpiece/christchurch.webp",
    },

    github: {
      href: "https://github.com/d-exclaimation",
      img: "/artpiece/github.webp",
    },

    linkedin: {
      href: "https://linkedin.com/in/d-exclaimation",
      img: "/artpiece/linkedin.webp",
    },
  } as const,
};

export type Manifest = typeof manifest;
export type Stories = Manifest["stories"];
