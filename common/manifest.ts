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

    omdb: {
      href: "https://omdb.d-exclaimation.me",
      img: "/artpiece/omdb.webp",
      external: true,
    },

    "business card": {
      href: "/card",
      img: "/artpiece/card.webp",
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
      href: "https://resume.dexclaimation.com",
      img: undefined,
      external: true,
    },
  } as const,
};

export type Manifest = typeof manifest;
export type Stories = Manifest["stories"];

export const timeline = {
  "Feb 2021":
    "Contracted by Zentax Consulting to built a new online attendance logging application for their employees that would allow employee to log their hours even if they're not in the office.",
  "Apr 2021":
    "Created my initial version of my personal website, d-exclaimation.me. This is my first web application that I built from scratch and deployed to production.",
  "Sep 2021":
    "Authored Overlayer, a Akka / Scala GraphQL subscription adapter for Sangria. This is my first OSS project that I authored and published to Maven.",
  "Nov 2021":
    "Authored Pioneer, a GraphQL server library for Swift. Notably, it's the first GraphQL server library for Swift that supports subscriptions and one of my larger OSS project I authored.",
  "Aug 2022":
    "Redeigned my personal website, d-exclaimation.me. This is my first major redesign of my personal website.",
  "Nov 2022": [
    "Contributed to Graphiti, a GraphQL schema library for Swift on macOS and Linux. This is my first OSS contribution to a larger project that I didn't authored.",
    "Joined Partly as a Software Engineer Intern. This is my first full-time job as a Software Engineer.",
  ],
  "Feb 2023":
    "Continue at Partly as a Junior Software Engineer part-time while I am finishing my degree.",
  "Apr 2023":
    "Authored Seraph, a minimal UI library built on top of plain Web APIs that is inspired by React, Astro, and Solid.",
} as const;
