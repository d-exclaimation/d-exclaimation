//
//  manifest.ts
//  d-exclaimation
//
//  Created by d-exclaimation on 17 May 2023
//

/**
 * Web application source of truth for metadata i.e. (routes, links, etc)
 */
export const manifest = {
  handles: {
    name: "https://facebook.com/dexclaimation",
    email: "mailto:vincent@d-exclaimation.me",
    site: "https://d-exclaimation.me",
    linkedin: "https://linkedin.com/in/d-exclaimation",
  },

  stories: {
    "d-exclaimation": {
      href: "/",
      img: undefined,
      external: false,
    },

    about: {
      href: "/about",
      img: undefined,
      external: false,
    },

    partly: {
      href: "https://partly.com",
      img: "/artpiece/partly.webp",
      external: true,
    },

    spotlight: {
      href: "https://spotlight.d-exclaimation.me",
      img: "/artpiece/spotlight.webp",
      external: true,
    },

    omdb: {
      href: "https://omdb.d-exclaimation.me",
      img: "/artpiece/omdb.webp",
      external: true,
    },

    pioneer: {
      href: "https://pioneer.dexclaimation.com",
      img: "/artpiece/pioneer.webp",
      external: true,
    },

    seraph: {
      href: "https://seraph.dexclaimation.com",
      img: "/artpiece/seraph.webp",
      external: true,
    },

    saturday: {
      href: "https://csse-s302g7.canterbury.ac.nz/prod/",
      img: "/artpiece/saturday.webp",
      external: true,
    },

    "business card": {
      href: "/card",
      img: "/artpiece/business-card.webp",
      external: false,
    },

    snake: {
      href: "/games/snake",
      img: undefined,
      external: false,
    },

    memory: {
      href: "/games/match",
      img: undefined,
      external: false,
    },

    github: {
      href: "https://github.com/d-exclaimation",
      img: "/artpiece/github.webp",
      external: true,
    },

    linkedin: {
      href: "https://linkedin.com/in/d-exclaimation",
      img: undefined,
      external: true,
    },

    resume: {
      href: "https://d-exclaimation.notion.site",
      img: undefined,
      external: true,
    },
  } as const,
};

export type Manifest = typeof manifest;
export type Stories = Manifest["stories"];
