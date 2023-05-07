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

    pioneer: {
      href: "https://pioneer.dexclaimation.com",
      img: "/artpiece/pioneer.webp",
    },

    seraph: {
      href: "https://seraph.dexclaimation.com",
      img: "/artpiece/seraph.webp",
    },

    omdb: {
      href: "https://o-mdb.vercel.app",
      img: "/artpiece/omdb.webp",
    },

    "business card": {
      href: "/card",
      img: "/artpiece/card.webp",
    },

    github: {
      href: "https://github.com/d-exclaimation",
      img: "/artpiece/github.webp",
    },
  } as const,
};

export type Manifest = typeof manifest;
export type Stories = Manifest["stories"];
