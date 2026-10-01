"use client";

//
//  page.client.tsx
//  d-exclaimation
//
//  Created by d-exclaimation on 08 Jul 2023
//

import About from "@/(parallax)/about";
import CallToAction from "@/(parallax)/call-to-action";
import { Parallax, type IParallax } from "@react-spring/parallax";
import { useCallback, useEffect, useRef } from "react";
import Hand, { type Project } from "./(parallax)/hand";

/** The first project is centred and dealt on top; the rest fan out from it, alternating right then left. */
const projects: Project[] = [
  {
    name: "partly",
    description:
      "Product Engineer, responsible for Partly Repair and Partly Capture, currently working on Partly RepairAI mobile",
    href: "https://partly.com",
    year: "now",
    capture: "clean",
    finish: "silver",
    shots: [
      { src: "/artpiece/projects/partly/home.webp", alt: "Partly" },
      { src: "/artpiece/projects/partly/repair-2.webp", alt: "Partly Repair" },
      { src: "/artpiece/projects/partly/capture.webp", alt: "Partly Capture", position: "50% 40%" },
      { src: "/artpiece/projects/partly/repair-ai.webp", alt: "Partly Repair AI" },
    ],
  },
  {
    name: "partspal",
    description: "Worked on Partly's core seller experience, PartsPal",
    href: "https://partly.com",
    year: "2022",
    capture: "iphone",
    shots: [{ src: "/artpiece/projects/partspal.webp", alt: "Partly careers page in 2022" }],
  },
  {
    name: "mirage-ai",
    description: "Embracing the future, crafting today with the most advanced content creation AI in the world",
    href: "https://mirageai.xyz",
    year: "2023",
    capture: "iphone",
    shots: [{ src: "/artpiece/projects/mirageai.webp", alt: "mirage-ai screenshot" }],
  },
  {
    name: "pioneer",
    description: "GraphQL server for Swift",
    href: "https://pioneer.talker.dev",
    year: "2022",
    capture: "iphone",
    shots: [{ src: "/artpiece/projects/pioneer.webp", alt: "pioneer screenshot" }],
  },
  {
    name: "spotlight",
    description: "Browsing news streamlined, supercharged, and simplified",
    href: "https://spotlight.d-exclaimation.me",
    year: "2023",
    capture: "iphone",
    shots: [{ src: "/artpiece/projects/spotlight.webp", alt: "spotlight screenshot" }],
  },
  {
    name: "pixle",
    description: "Time to start making memories, 1 photo at a time",
    href: "https://experimental.pixle.app",
    year: "2023",
    capture: "iphone",
    shots: [{ src: "/artpiece/projects/pixle.webp", alt: "pixle screenshot" }],
  },
  {
    name: "d-exclaimation.me",
    description: "My life, my work, my passion",
    href: "https://d-exclaimation.me",
    year: "2021",
    capture: "iphone",
    shots: [{ src: "/artpiece/projects/website.webp", alt: "d-exclaimation.me screenshot" }],
  },
  {
    name: "omdb",
    description: "Web movies made simple",
    href: "https://omdb.d-exclaimation.me",
    year: "2023",
    capture: "iphone",
    shots: [{ src: "/artpiece/projects/omdb.webp", alt: "omdb screenshot" }],
  },
  {
    name: "seraph",
    description: "Hassle-free web apps in an instant",
    href: "https://seraph.talker.dev",
    year: "2023",
    capture: "iphone",
    shots: [{ src: "/artpiece/projects/seraph.webp", alt: "seraph screenshot" }],
  },
  {
    name: "relax",
    description: "AI powered Slack assistant for agile teams",
    href: "https://relax.d-exclaimation.me",
    year: "2023",
    capture: "iphone",
    shots: [{ src: "/artpiece/projects/relax.webp", alt: "relax screenshot" }],
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

function Projects() {
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
        <Hand projects={projects} onFocusEnter={() => panel.current?.scrollTo(1)} />
        <CallToAction offset={2} options={cta} />
      </Parallax>
    </>
  );
}

export default Projects;
