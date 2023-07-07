"use client";

//
//  page.client.tsx
//  d-exclaimation
//
//  Created by d-exclaimation on 08 Jul 2023
//

import { rc } from "@d-exclaimation/next";
import { Parallax, type IParallax } from "@react-spring/parallax";
import { useCallback, useEffect, useRef } from "react";
import personal_md from "./(assets)/d-exclaimation-md.webp";
import personal from "./(assets)/d-exclaimation.webp";
import omdb_md from "./(assets)/omdb-md.webp";
import omdb from "./(assets)/omdb.webp";
import partly_md from "./(assets)/partly-md.webp";
import partly from "./(assets)/partly.webp";
import spotlight_md from "./(assets)/spotlight-md.webp";
import spotlight from "./(assets)/spotlight.webp";
import About from "./about";
import CallToAction from "./call-to-action";
import Work from "./work";

const layers = {
  experiences: [
    {
      name: "partly (job)",
      description: "Worked on Partly's core seller experience, PartsPal",
      href: "https://partly.com",
      year: "2022",
      images: {
        md: partly_md,
        base: partly,
      },
    },
  ],

  projects: [
    {
      name: "spotlight",
      description: "Browsing news streamlined, supercharged, and simplified",
      href: "https://spotlight.d-exclaimation.me",
      year: "2023",
      images: {
        md: spotlight_md,
        base: spotlight,
      },
    },
    {
      name: "d-exclaimation.me",
      description: "My life, my work, my passion",
      href: "https://d-exclaimation.me",
      year: "2021",
      images: {
        md: personal_md,
        base: personal,
      },
    },
    {
      name: "omdb",
      description: "Web movies made simple",
      href: "https://omdb.d-exclaimation.me",
      year: "2023",
      images: {
        md: omdb_md,
        base: omdb,
      },
    },
  ],

  cta: [
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
      href: "/games/maach",
      icon: "/icon/brain.svg",
    },
    {
      action: "Have some fun with",
      title: "Escape the 404",
      href: "https://spotlight.d-exclaimation.me/404",
      icon: "/icon/dino.svg",
      external: true,
    },
  ],
};

const pages = layers.projects.length + layers.experiences.length + 2;

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
      <Parallax pages={pages} ref={panel}>
        <About onNext={() => panel?.current?.scrollTo(1)} />
        {layers.projects.map((project, i) => (
          <Work
            key={project.name}
            {...project}
            offset={i + 1}
            maxOffset={pages - 1}
            onClick={(offset) => panel?.current?.scrollTo(offset)}
          />
        ))}
        {layers.experiences.map((experience, i) => (
          <Work
            key={experience.name}
            {...experience}
            offset={i + 1 + layers.projects.length}
            maxOffset={pages - 1}
            onClick={(offset) => panel?.current?.scrollTo(offset)}
          />
        ))}
        <CallToAction offset={pages - 1} options={layers.cta} />
      </Parallax>
    </>
  );
});

export default Projects;
