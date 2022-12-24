//
//  Me.tsx
//  d-exclaimation
//
//  Created by d-exclaimation on 24 Dec 2022
//

//
//  Me.tsx
//  d-exclaimation
//
//  Created by d-exclaimation on 24 Dec 2022
//

import { motion } from "framer-motion";
import { FC, useState } from "react";

const Me: FC = () => {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <span
      id="email"
      className="select-none font-mono font-medium text-lg md:text-3xl"
      onMouseLeave={() => setSelected(null)}
    >
      <span
        id="name"
        className={selected === "email" ? "text-blue-600 underline" : ""}
        onClick={() => setSelected("email")}
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
            ? "text-blue-600 underline"
            : ""
        }
        onClick={() => setSelected("instagram")}
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
            ? "text-blue-600 underline"
            : ""
        }
        onClick={() =>
          setSelected((prev) => {
            if (prev === "linkedin" || prev === "site") {
              return prev;
            }
            return "instagram";
          })
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
            ? "text-blue-600 underline"
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
        onClick={() =>
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
              ? "text-blue-600 underline"
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
            ? "text-blue-600 underline"
            : ""
        }
        onClick={() => setSelected("site")}
        onMouseEnter={() => setSelected("site")}
      >
        .me
      </span>
    </span>
  );
};

export default Me;
