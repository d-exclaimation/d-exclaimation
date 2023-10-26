"use client";

//
//  page.client.tsx
//  d-exclaimation
//
//  Created by d-exclaimation on 08 Jul 2023
//

import personal_md from "@/(parallax)/(assets)/d-exclaimation-md.webp";
import personal from "@/(parallax)/(assets)/d-exclaimation.webp";
import omdb_md from "@/(parallax)/(assets)/omdb-md.webp";
import omdb from "@/(parallax)/(assets)/omdb.webp";
import partly_md from "@/(parallax)/(assets)/partly-md.webp";
import partly from "@/(parallax)/(assets)/partly.webp";
import pioneer_md from "@/(parallax)/(assets)/pioneer-md.webp";
import pioneer from "@/(parallax)/(assets)/pioneer.webp";
import pixle_md from "@/(parallax)/(assets)/pixle-md.webp";
import pixle from "@/(parallax)/(assets)/pixle.webp";
import relax_md from "@/(parallax)/(assets)/relax-md.webp";
import relax from "@/(parallax)/(assets)/relax.webp";
import seraph_md from "@/(parallax)/(assets)/seraph-md.webp";
import seraph from "@/(parallax)/(assets)/seraph.webp";
import spotlight_md from "@/(parallax)/(assets)/spotlight-md.webp";
import spotlight from "@/(parallax)/(assets)/spotlight.webp";

import About from "@/(parallax)/about";
import CallToAction from "@/(parallax)/call-to-action";
import { rc } from "@d-exclaimation/next";
import { Parallax, type IParallax } from "@react-spring/parallax";
import { useCallback, useEffect, useRef } from "react";
import Poker from "./(parallax)/poker";

const layers = {
  works: [
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
      name: "pixle",
      description: "Time to start making memories, 1 photo at a time",
      href: "https://experimental.pixle.app",
      year: "2023",
      images: {
        md: pixle_md,
        base: pixle,
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
    {
      name: "partly",
      description: "Worked on Partly's core seller experience, PartsPal",
      href: "https://partly.com",
      year: "2022",
      images: {
        md: partly_md,
        base: partly,
      },
    },
    {
      name: "pioneer",
      description: "GraphQL server for Swift",
      href: "https://pioneer.dexclaimation.com",
      year: "2022",
      images: {
        md: pioneer_md,
        base: pioneer,
      },
    },

    {
      name: "relax",
      description: "AI powered Slack assistant for agile teams",
      href: "https://relax.d-exclaimation.me",
      year: "2023",
      images: {
        md: relax_md,
        base: relax,
      },
    },
    {
      name: "seraph",
      description: "Hassle-free web apps in an instant",
      href: "https://seraph.dexclaimation.com",
      year: "2023",
      images: {
        md: seraph_md,
        base: seraph,
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
  ],
};

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
        <Poker />
        <CallToAction offset={2} options={layers.cta} />
      </Parallax>
    </>
  );
});

export default Projects;
