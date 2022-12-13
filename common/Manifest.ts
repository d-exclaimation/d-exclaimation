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
      name: "Some random page",
      href: "/sandbox",
    },
    {
      name: "This is not a route",
      href: "/lol",
    },
    {
      name: "This is not a route",
      href: "/lol2",
    },
    {
      name: "This is not a route",
      href: "/lol3",
    },
    {
      name: "This is not a route",
      href: "/lol4",
    },
    {
      name: "This is not a route",
      href: "/lol5",
    },
    {
      name: "This is not a route",
      href: "/lol6",
    },
    {
      name: "This is not a route",
      href: "/lol7",
    },
    {
      name: "This is not a route",
      href: "/lol8",
    },
    {
      name: "This is not a route",
      href: "/lol9",
    }
  ),
};
