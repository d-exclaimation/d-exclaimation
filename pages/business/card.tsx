//
//  card.tsx
//  d-exclaimation
//
//  Created by d-exclaimation on 23 Dec 2022
//

import { motion } from "framer-motion";
import Link from "next/link";
import { FC, useState } from "react";

const Hrefs = {
  linkedin: "https://www.linkedin.com/in/d-exclaimation/",
  instagram: "https://www.instagram.com/dexclaimation/",
  site: "https://d-exclaimation.me",
  email: "mailto:vincent@d-exclaimation.me",
} as const;

const Card: FC = () => {
  const [selected, setSelected] = useState<keyof typeof Hrefs | null>(null);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <Link
        href={selected ? Hrefs[selected] : "./card"}
        id="email"
        className="select-none font-mono font-medium text-lg md:text-3xl"
        onMouseLeave={() => setSelected(null)}
      >
        <span
          id="name"
          className={selected === "email" ? "text-blue-500 underline" : ""}
          onMouseEnter={() => setSelected("email")}
        >
          vincent
        </span>
        <span
          id="linkedin"
          className={
            selected === "instagram"
              ? "text-fuchsia-500 underline"
              : selected === "email"
              ? "text-blue-500 underline"
              : ""
          }
          onMouseEnter={() => setSelected("instagram")}
        >
          @
        </span>
        <span
          className={
            selected === "instagram"
              ? "text-fuchsia-500 underline"
              : selected === "site"
              ? "text-indigo-500 underline"
              : selected === "linkedin"
              ? "text-teal-500 underline"
              : selected === "email"
              ? "text-blue-500 underline"
              : ""
          }
          onMouseEnter={() =>
            setSelected((prev) => {
              if (prev === "linkedin" || prev === "site") {
                return prev;
              }
              return "instagram";
            })
          }
        >
          d
        </span>
        <span
          className={
            selected === "instagram"
              ? "text-fuchsia-500 underline"
              : selected === "site"
              ? "text-indigo-500 underline"
              : selected === "linkedin"
              ? "text-teal-500 underline"
              : selected === "email"
              ? "text-blue-500 underline"
              : ""
          }
          onMouseEnter={() =>
            setSelected((prev) => {
              if (prev === "instagram" || prev === "site") {
                return prev;
              }
              return "linkedin";
            })
          }
        >
          <motion.span
            initial={false}
            variants={{
              visible: {
                opacity: 1,
                transition: {
                  duration: 0.25,
                },
              },
              hidden: {
                opacity: 0,
                width: "0.01rem",
                transition: {
                  duration: 0.5,
                },
              },
            }}
            style={{ display: "inline-block" }}
            className={
              selected === "linkedin" || selected === "site"
                ? "underline"
                : selected === "email"
                ? "text-blue-500 underline"
                : ""
            }
            animate={selected === "instagram" ? "hidden" : "visible"}
          >
            -
          </motion.span>
          exclaimation
        </span>
        <span
          id="website"
          className={
            selected === "site"
              ? "text-indigo-500 underline"
              : selected === "email"
              ? "text-blue-500 underline"
              : ""
          }
          onMouseEnter={() => setSelected("site")}
        >
          .me
        </span>
      </Link>
    </div>
  );
};

export default Card;
