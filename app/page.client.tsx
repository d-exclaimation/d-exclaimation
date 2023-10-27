"use client";

//
//  page.client.tsx
//  d-exclaimation
//
//  Created by d-exclaimation on 08 Jul 2023
//

import About from "@/(parallax)/about";
import CallToAction from "@/(parallax)/call-to-action";
import { rc } from "@d-exclaimation/next";
import { Parallax, type IParallax } from "@react-spring/parallax";
import { useCallback, useEffect, useRef } from "react";
import Poker from "./(parallax)/poker";

const projects = [
  {
    name: "seraph",
    description: "Hassle-free web apps in an instant",
    href: "https://seraph.dexclaimation.com",
    year: "2023",
    image: "/artpiece/projects/seraph.webp",
  },
  {
    name: "relax",
    description: "AI powered Slack assistant for agile teams",
    href: "https://relax.d-exclaimation.me",
    year: "2023",
    image: "/artpiece/projects/relax.webp",
  },
  {
    name: "pioneer",
    description: "GraphQL server for Swift",
    href: "https://pioneer.dexclaimation.com",
    year: "2022",
    image: "/artpiece/projects/pioneer.webp",
  },
  {
    name: "partly",
    description: "Worked on Partly's core seller experience, PartsPal",
    href: "https://partly.com",
    year: "2022",
    image: "/artpiece/projects/partly.webp",
  },
  {
    name: "omdb",
    description: "Web movies made simple",
    href: "https://omdb.d-exclaimation.me",
    year: "2023",
    image: "/artpiece/projects/omdb.webp",
  },
  {
    name: "pixle",
    description: "Time to start making memories, 1 photo at a time",
    href: "https://experimental.pixle.app",
    year: "2023",
    image: "/artpiece/projects/pixle.webp",
  },
  {
    name: "d-exclaimation.me",
    description: "My life, my work, my passion",
    href: "https://d-exclaimation.me",
    year: "2021",
    image: "/artpiece/projects/website.webp",
  },
  {
    name: "spotlight",
    description: "Browsing news streamlined, supercharged, and simplified",
    href: "https://spotlight.d-exclaimation.me",
    year: "2023",
    image: "/artpiece/projects/spotlight.webp",
  },
];

const cta = [
  {
    action: "See more of my work at",
    title: "Github",
    href: "https://github.com/d-exclaimation",
    icon: "/icon/github.svg",
    external: true,
  },
  {
    action: "Check my professional profile at",
    title: "LinkedIn",
    href: "https://www.linkedin.com/in/d-exclaimation",
    icon: "/icon/linkedin.svg",
    external: true,
  },
  {
    action: "Take a break and play",
    title: "Snake",
    href: "/games/snake",
    icon: "/icon/snake.svg",
  },
  {
    action: "Test your memory with",
    title: "Match",
    href: "/games/match",
    icon: "/icon/brain.svg",
  },
  {
    action: "Have some fun with",
    title: "Escape the 404",
    href: "https://spotlight.d-exclaimation.me/404",
    icon: "/icon/dino.svg",
    external: true,
  },
];

const Projects = rc(() => {
  const panel = useRef<IParallax | null>(null);

  const nextLayer = useCallback(() => {
    panel?.current?.scrollTo(panel.current.offset + 1);
  }, []);

  const prevLayer = useCallback(() => {
    panel?.current?.scrollTo(panel.current.offset - 1);
  }, []);

  useEffect(() => {
    function onKeydown(e: KeyboardEvent) {
      if (!panel.current) return;
      if (e.key === "ArrowDown") {
        nextLayer();
      }
      if (e.key === "ArrowUp") {
        prevLayer();
      }
    }
    window.addEventListener("keydown", onKeydown);
    return () => window.removeEventListener("keydown", onKeydown);
  }, [nextLayer, prevLayer]);
  return (
    <>
      <Parallax pages={3} ref={panel}>
        <About onNext={() => panel?.current?.scrollTo(1)} />
        <Poker cards={projects} />
        <CallToAction offset={2} options={cta} />
      </Parallax>
    </>
  );
});

export default Projects;
