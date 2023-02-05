import {
  useMotionTemplate,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import Link from "next/link";
import type { FC } from "react";
import { manifest } from "../common/Manifest";
import Activity from "../components/Activity";
import Hyperlink from "../components/Hyperlink";
import Quote from "../components/Quote";
import Scrambled from "../components/Scrambled";
import Signature from "../components/Signature";
import { withHead } from "../hoc/withHead";

const About: FC = () => {
  const { scrollYProgress } = useScroll();

  // Motion for title
  const titleTransformation = useTransform(scrollYProgress, [0, 0.4], [6, 3]);
  const titleSpring = useSpring(titleTransformation, {
    mass: 0.008,
  });
  const titleSize = useMotionTemplate`${titleSpring}vw`;

  return (
    <div className="w-full h-max">
      <div className="fixed inset-0 bg-gradient-to-t from-neutral-700 to-white">
        <div className="max-w-[1000px] my-0 mx-auto py-[14px] px-[12px]">
          <div className="flex flex-col items-start">
            {/* Title */}
            <Link href="/">
              <Scrambled
                phrases={["vin", "vincent", "d-exclaimation"]}
                align="items-start"
                justify="justify-center"
                style={{ fontSize: titleSize }}
              />
            </Link>
            {/* Socials */}
            <div className="flex flex-row sm:flex-col items-start text-xs sm:text-base flex-wrap">
              {manifest.links.map((social) => (
                <div key={social.href}>
                  <Hyperlink {...social} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div
        className="
        relative 
        my-0 mx-auto z-10 
        p-4 sm:p-16 
        max-w-[90vw] sm:max-w-[min(800px,95vw)] 
        top-[12vh] sm:top-[20vh] 
        sm:left-[8vw] 
        text-sm sm:text-lg 
        bg-gradient-to-t from-neutral-200 to-white
        rounded-lg"
      >
        {/* Brief and description */}
        <div>
          <Scrambled
            phrases={[
              "Software engineer",
              "Computer science student",
              "Professional memer",
              "Pineaple on pizza enjoyer",
            ]}
            speed={24}
            delay={5_000}
            align="items-start"
            justify="justify-start"
            className="font-bold text-lg sm:text-xl mb-2"
          />
          {/* Brief */}
          <Scrambled
            phrases={[
              "Brief",
              "Software",
              "Engineering",
              "Career",
              "Meaning",
              "Goal",
              "Brief",
            ]}
            speed={2}
            delay={1_000}
            align="items-start"
            justify="justify-start"
            className="font-semibold sm:text-lg my-2"
            color={{
              dud: "text-slate-400",
              normal: "text-indigo-800",
            }}
          />
          <p className="text-sm sm:text-base font-extralight font-sans">
            <Quote>Software engineer improving his craft</Quote>
            <br />
            Short description of myself would be an enthusiastic and career
            driven person who enjoy the art of software development and want to
            use that to build something meaningful.
          </p>
          {/* Catching up */}
          <Scrambled
            phrases={[
              "Progress",
              "Progress",
              "Catching up",
              "Studies",
              "Life",
              "Progress",
              "Progress",
            ]}
            speed={2}
            delay={1_000}
            align="items-start"
            justify="justify-start"
            className="font-semibold sm:text-lg my-2"
            color={{
              dud: "text-slate-400",
              normal: "text-violet-800",
            }}
          />
          <p className="text-sm sm:text-base font-extralight font-sans">
            <Quote>Computer science student breaking into tech</Quote>
            <br />A huge portion of my life at the moment is about my studies
            and my future career. I am currently a university student studying
            computer science. One that will be graduating by the end of 2023 and
            fully dedicate my life toward my career.
          </p>
        </div>
        {/* Work experiences */}
        <div className="mt-5 mb-2">
          <Scrambled
            phrases={[
              "Professional experience",
              "Work history",
              "Projects",
              "Things I put on my resume",
            ]}
            speed={24}
            delay={5_000}
            align="items-start"
            justify="justify-start"
            className="font-bold text-lg sm:text-xl mb-2"
            color={{
              dud: "text-slate-400",
              normal: "text-blue-800",
            }}
          />
        </div>
        {/* Work */}
        <Scrambled
          phrases={[
            "Experiences",
            "Work",
            "Walk of life",
            "Roles",
            "Experiences",
          ]}
          speed={2}
          delay={1_000}
          align="items-start"
          justify="justify-start"
          className="font-semibold sm:text-lg my-2"
          color={{
            dud: "text-slate-400",
            normal: "text-blue-700",
          }}
        />
        <Activity
          subtitle="Junior Software Engineer (Part-time)"
          title={{ name: "Partly", href: "https://partly.com" }}
          time={{
            __t: "ongoing",
            start: "February 2023",
          }}
          color={{
            border: "border-l-blue-400",
            decoration: "decoration-blue-700",
            text: "text-blue-700",
          }}
        >
          Continuining my work on{" "}
          <a
            className="text-sky-800 decoration-cyan-800 active:underline hover:underline cursor-pointer"
            href="https://partspal.partly.com"
          >
            Partspal
          </a>{" "}
          and marketplace integations microservices.
        </Activity>
        <Activity
          subtitle="Software Engineer Intern"
          title={{ name: "Partly", href: "https://partly.com" }}
          time={{
            __t: "specified",
            start: "November 2022",
            end: "February 2023",
          }}
          color={{
            border: "border-l-blue-400",
            decoration: "decoration-blue-700",
            text: "text-blue-700",
          }}
        >
          Worked on{" "}
          <a
            className="text-sky-800 decoration-cyan-800 active:underline hover:underline cursor-pointer"
            href="https://partspal.partly.com"
          >
            Partspal
          </a>{" "}
          and marketplace integations microservices using Typescript, Node.js,
          React, and PostgreSQL
        </Activity>
        <Activity
          subtitle="Software Engineer Contract"
          title={{ name: "Zentax", href: "https://zentax.id" }}
          time={{
            __t: "specified",
            start: "February 2021",
            end: "November 2021",
          }}
          color={{
            border: "border-l-blue-400",
            decoration: "decoration-blue-700",
            text: "text-blue-700",
          }}
        >
          Worked on building{" "}
          <a
            className="text-sky-800 decoration-cyan-800 hover:underline active:underline cursor-pointer"
            href="https://att.zentax.id"
          >
            their online attendance recording system
          </a>{" "}
          using Typescript, Node.js, React, GraphQL, and PostgreSQL
        </Activity>
        {/* Projects */}
        <Scrambled
          phrases={["Projects", "Open source", "Creation", "Projects"]}
          speed={2}
          delay={1_000}
          align="items-start"
          justify="justify-start"
          className="font-semibold sm:text-lg my-2"
          color={{
            dud: "text-slate-400",
            normal: "text-emerald-800",
          }}
        />
        <Activity
          subtitle="GraphQL server for Swift"
          title={{ name: "Pioneer", href: "https://pioneer.dexclaimation.com" }}
          time={{
            __t: "ongoing",
            start: "November 2022",
          }}
          color={{
            border: "border-l-emerald-400",
            decoration: "decoration-emerald-700",
            text: "text-emerald-700",
          }}
        >
          An open source, spec-compliant GraphQL server for Swift on the server
        </Activity>
        <Activity
          subtitle="All about me in a page"
          title={{
            name: "dexclaimation.com",
            href: "https://dexclaimation.com",
          }}
          time={{
            __t: "ongoing",
            start: "February 2021",
          }}
          color={{
            border: "border-l-emerald-400",
            decoration: "decoration-emerald-700",
            text: "text-emerald-700",
          }}
        >
          This website
        </Activity>
        <span className="font-sans font-extralight text-xs sm:text-sm">
          and more on{" "}
          <a
            className="text-sky-500 decoration-cyan-500 hover:underline active:underline cursor-pointer"
            href="https://resume.dexclaimation.com"
          >
            my cv
          </a>
        </span>

        <Signature className="flex justify-end items-center px-2" />
      </div>
    </div>
  );
};

export default withHead(About, {
  title: "d-exclaimation",
  description: "About me",
});
