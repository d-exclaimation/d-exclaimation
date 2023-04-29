//

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

    study: {
      href: "/about",
      img: "/artpiece/uc.webp",
    },

    pioneer: {
      href: "https://pioneer.dexclaimation.com",
      img: "/artpiece/pioneer.webp",
    },

    seraph: {
      href: "https://seraph.dexclaimation.com",
      img: "/artpiece/seraph.webp",
    },

    github: {
      href: "https://github.com/d-exclaimation",
      img: "/artpiece/github.webp",
    },
  } as const,
};

export type Manifest = typeof manifest;
export type Stories = Manifest["stories"];
