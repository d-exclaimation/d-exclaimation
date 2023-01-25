//
//  cinderbloc.tsx
//  d-exclaimation
//
//  Created by d-exclaimation on 25 Jan 2023
//

import { FC, useRef, useState } from "react";

const stories = [
  {
    title: "software",
    href: "",
    img: "/artpiece/tech1.jpeg",
  },
  {
    title: "university",
    href: "",
    img: "/artpiece/tech2.jpeg",
  },
  {
    title: "partly",
    href: "",
    img: "/artpiece/tech3.jpeg",
  },
  {
    title: "pioneer",
    href: "",
    img: "/artpiece/tech4.jpeg",
  },
  {
    title: "github",
    href: "",
    img: "/artpiece/tech5.jpeg",
  },
  {
    title: "linkedin",
    href: "",
    img: "/artpiece/tech6.jpeg",
  },
  {
    title: "something1",
    href: "",
    img: "/artpiece/tech7.jpeg",
  },
  {
    title: "something",
    href: "",
    img: "/artpiece/tech8.jpeg",
  },
] as const;

type Story = typeof stories[number];

const CinderBloc: FC = () => {
  const ref = useRef<NodeJS.Timeout | number | undefined>(undefined);
  const [hoverred, setHover] = useState<Story["title"] | undefined>(undefined);
  const [mouse, setMouse] = useState<{ left: number; top: number } | undefined>(
    undefined
  );

  return (
    <div>
      <nav
        ref={(nav) => {
          if (!nav) return;

          window.onscroll = () => {
            const pc = Math.round(
              (window.scrollY * 100) /
                (document.documentElement.scrollHeight - window.innerHeight)
            );

            const each = Math.floor(100 / stories.length);
            setHover(stories.at(Math.floor(pc / each))?.title);
          };

          window.onmousemove = (e) => {
            const percent = e.clientY / window.innerHeight;
            const y = percent * nav.offsetHeight * -1;
            nav.animate(
              { transform: `translateY(${y}px)` },
              {
                fill: "forwards",
                duration: 4000,
              }
            );
          };
        }}
        className="flex flex-col p-[clamp(1rem,5vw,6rem)] mt-[20vh]"
      >
        {stories.map(({ title, img, ...props }, i) => (
          <a
            className={`
            font-sans text-[clamp(4rem,8vw,10rem)] font-light no-underline relative
            text-center md:text-start
            ${hoverred === title ? "text-blue-100" : "text-black/25"}
            `}
            key={i}
            onMouseMove={(e) => {
              clearTimeout(ref.current);
              const rect = e.currentTarget.getBoundingClientRect();
              setMouse({
                left: e.clientX - rect.left,
                top: e.clientY - rect.top,
              });
              setHover(title);
            }}
            onMouseLeave={() => setTimeout(() => setHover(undefined), 10)}
            {...props}
          >
            <span
              className="
              block border-y-[1px] border-y-transparent border-solid relative z-[2]
            hover:border-y-white 
              "
            >
              {title}
            </span>
            <img
              className={`
              absolute -translate-y-1/2 
              [transition:_transform_250ms,_opacity_250ms] pointer-events-none w-[min(90vw,800px)]
              ${
                hoverred === title
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-50"
              }
              `}
              style={mouse ? mouse : undefined}
              src={img}
            />
          </a>
        ))}
      </nav>
    </div>
  );
};

export default CinderBloc;
