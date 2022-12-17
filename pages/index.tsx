import {
  useMotionTemplate,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import type { FC } from "react";
import { manifest } from "../common/Manifest";
import Activity from "../components/Activity";
import Hyperlink from "../components/Hyperlink";
import Quote from "../components/Quote";
import Scrambled from "../components/Scrambled";
import { withHead } from "../hoc/withHead";

const Home: FC = () => {
  const { scrollYProgress } = useScroll();

  // Motion for title
  const titleTransformation = useTransform(scrollYProgress, [0, 0.4], [6, 3]);
  const titleSpring = useSpring(titleTransformation, {
    mass: 0.008,
  });
  const titleSize = useMotionTemplate`${titleSpring}vw`;

  return (
    <div className="w-full h-full">
      <div className="fixed inset-0">
        <div className="max-w-[1000px] my-0 mx-auto py-[14px] px-[12px]">
          <div className="flex flex-col items-start">
            {/* Title */}
            <Scrambled
              phrases={["vin", "vincent", "d-exclaimation"]}
              align="items-start"
              justify="justify-center"
              style={{ fontSize: titleSize }}
            />
            {/* Socials */}
            <div className="flex flex-row md:flex-col items-start text-xs md:text-base flex-wrap">
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
        p-4 md:p-16 
        max-w-[90vw] md:max-w-[min(800px,95vw)] 
        top-[12vh] md:top-[20vh] 
        md:left-[8vw] 
        text-sm md:text-lg 
        bg-gray-50"
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
            className="font-bold text-lg md:text-xl mb-2"
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
            className="font-semibold md:text-lg my-2"
            color={{
              dud: "text-slate-400",
              normal: "text-indigo-500",
            }}
          />
          <p className="text-sm md:text-base font-extralight font-sans">
            <Quote>Software engineer improving his craft</Quote>
            <br />
            Short description of myself would be an ethutiastic and career
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
            className="font-semibold md:text-lg my-2"
            color={{
              dud: "text-slate-400",
              normal: "text-violet-500",
            }}
          />
          <p className="text-sm md:text-base font-extralight font-sans">
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
            className="font-bold text-lg md:text-xl mb-2"
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
          className="font-semibold md:text-lg my-2"
          color={{
            dud: "text-slate-400",
            normal: "text-blue-500",
          }}
        />
        <Activity
          subtitle="Software Engineer Intern"
          title={{ name: "Partly", href: "https://partly.com" }}
          time={{
            __type: "specified",
            start: "November 2022",
            end: "February 2023",
          }}
        >
          Worked on{" "}
          <a
            className="text-sky-500 decoration-cyan-500 active:underline hover:underline cursor-pointer"
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
            __type: "specified",
            start: "February 2021",
            end: "November 2021",
          }}
        >
          Worked on building{" "}
          <a
            className="text-sky-500 decoration-cyan-500 hover:underline active:underline cursor-pointer"
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
          className="font-semibold md:text-lg my-2"
          color={{
            dud: "text-slate-400",
            normal: "text-teal-500",
          }}
        />
        <Activity
          subtitle="GraphQL server for Swift"
          title={{ name: "Pioneer", href: "https://pioneer.dexclaimation.com" }}
          time={{
            __type: "ongoing",
            start: "November 2022",
          }}
          color={{
            border: "border-l-teal-200",
            decoration: "decoration-teal-400",
            text: "text-teal-400",
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
            __type: "ongoing",
            start: "February 2021",
          }}
          color={{
            border: "border-l-teal-200",
            decoration: "decoration-teal-400",
            text: "text-teal-400",
          }}
        >
          This website
        </Activity>
        <span className="font-sans font-extralight text-xs md:text-sm">
          and more on{" "}
          <a
            className="text-sky-500 decoration-cyan-500 hover:underline active:underline cursor-pointer"
            href="https://resume.dexclaimation.com"
          >
            my cv
          </a>
        </span>

        <div className="flex justify-end items-center p-2">
          <svg
            className="w-[20vmin] max-w-[12rem]"
            viewBox="0 0 516 342"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              id="signature"
              d="M2.23047 339.04C2.23047 325.476 4.24668 315.389 9.99938 302.733C17.6218 285.963 25.7965 268.218 35.0502 252.235C45.6534 233.92 51.9864 213.844 61.4486 194.919C75.4936 166.829 94.9531 141.171 105.684 111.364C111.018 96.5472 115.325 81.4315 122.886 67.6835C130.037 54.6817 138.191 41.6257 144.132 28.0462C147.203 21.0258 151.84 16.7705 157.054 11.5571C158.932 9.67899 164.902 -2.5846 164.902 5.84932C164.902 21.8108 159.313 37.1069 156.42 52.7799C149.686 89.2556 143.349 125.72 135.57 162.02C129.344 191.075 125.53 218.7 111.392 244.149C105.771 254.265 111.818 236.976 113.532 234.16C125.147 215.079 135.182 193.917 148.334 175.893C161.13 158.357 174.097 141.351 185.593 122.859C191.483 113.383 198.041 103.625 205.173 95.0333C209.169 90.2209 214.167 82.467 219.76 79.4162C223.245 77.5151 228.389 68.7377 230.224 65.0675C230.942 63.6311 230.541 70.0954 230.541 71.4094C230.541 78.5766 223.091 88.162 219.601 94.2405C188.284 148.793 160.015 205.313 116.069 250.887C113.628 253.419 110.444 258.47 107.111 259.211C105.676 259.53 102.007 263.149 103.226 260.559C107.635 251.19 113.965 243.23 121.777 236.301C130.278 228.759 138.148 220.72 147.541 214.262C148.495 213.606 154.529 209.049 151.425 213.787C140.383 230.64 126.338 245.569 114.959 262.303C112.322 266.181 119.105 256.321 120.984 254.613C131.817 244.764 143.368 235.648 153.804 225.361C154.744 224.434 191.052 188.346 191.697 189.529C194.316 194.33 141.583 232.864 135.095 238.203C116.157 253.787 99.6552 272.754 82.7735 290.524C81.7934 291.556 77.438 298.028 81.5051 295.439C97.0357 285.556 111.462 274.028 127.167 264.364C162.258 242.769 198.94 223.586 234.505 202.767C277.139 177.811 319.03 152.058 361.186 126.426C392.597 107.327 424.43 89.1091 458.535 75.2146C467.516 71.5558 477.259 69.3022 485.964 65.0675C491.511 62.369 497.61 61.6825 503.008 58.6462C506.065 56.927 509.499 55.0789 513.076 55.0789"
              stroke="rgba(0, 0, 0, .16)"
              stroke-width="8"
              stroke-linecap="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default withHead(Home, {
  title: "d-exclaimation",
  description: "Quick porfolio",
});
