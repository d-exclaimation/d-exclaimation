//
//  InteractiveHandle.tsx
//  d-exclaimation
//
//  Created by d-exclaimation on 24 Dec 2022
//

import { motion } from "framer-motion";
import Link from "next/link";
import {
  cloneElement,
  FC,
  ReactNode,
  SetStateAction,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { Tooltip as BaseTooltip, TooltipProps } from "react-tippy";
import { manifest, Manifest } from "../../common/Manifest";

const Tooltip = (props: TooltipProps & { children: ReactNode }) =>
  cloneElement(<BaseTooltip />, { ...props });

const DELAY = 750;

const InteractiveHandle: FC = () => {
  const timeoutRef = useRef<number | NodeJS.Timer | null>(null);
  const [selected, setSelected] = useState<keyof Manifest["handles"] | null>(
    null
  );

  const selects = useCallback(
    (change: SetStateAction<keyof Manifest["handles"] | null>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      return setSelected(change);
    },
    [setSelected]
  );

  const href = useMemo(
    () => (selected ? manifest.handles[selected] : "/"),
    [selected]
  );

  return (
    <Tooltip
      html={
        <Link
          href={href}
          className="select-none font-mono font-medium text-xl md:text-4xl opacity-25"
        >
          {selected}
        </Link>
      }
      position="top"
      trigger="manual"
      open={!!selected}
    >
      <span
        id="email"
        className="select-none font-mono font-medium text-2xl md:text-6xl"
        onMouseLeave={() => {
          timeoutRef.current = setTimeout(() => setSelected(null), DELAY);
        }}
      >
        <span
          id="name"
          className={
            selected === "email"
              ? "text-red-600 underline"
              : selected === "name"
              ? "text-blue-600 underline"
              : ""
          }
          onClick={() => selects((prev) => (prev === "email" ? prev : "name"))}
          onMouseEnter={() =>
            selects((prev) => (prev === "email" ? prev : "name"))
          }
        >
          vin
        </span>
        <span
          className={
            selected === "email"
              ? "text-red-600 underline"
              : selected === "name"
              ? "text-blue-600 underline"
              : ""
          }
          onClick={() => selects((prev) => (prev === "name" ? prev : "email"))}
          onMouseEnter={() =>
            selects((prev) => (prev === "name" ? prev : "email"))
          }
        >
          cent
        </span>
        <span
          id="linkedin"
          className={
            selected === "instagram"
              ? "text-fuchsia-500 underline"
              : selected === "email"
              ? "text-red-600 underline"
              : ""
          }
          onClick={() => selects("instagram")}
          onMouseEnter={() => selects("instagram")}
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
              ? "text-red-600 underline"
              : ""
          }
          onClick={() =>
            selects((prev) => {
              if (prev === "linkedin" || prev === "site") {
                return prev;
              }
              return "instagram";
            })
          }
          onMouseEnter={() =>
            selects((prev) => {
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
              ? "text-red-600 underline"
              : ""
          }
          onMouseEnter={() =>
            selects((prev) => {
              if (prev === "instagram" || prev === "site") {
                return prev;
              }
              return "linkedin";
            })
          }
          onClick={() =>
            selects((prev) => {
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
                ? "text-red-600 underline"
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
              ? "text-red-600 underline"
              : ""
          }
          onClick={() => selects("site")}
          onMouseEnter={() => selects("site")}
        >
          .me
        </span>
      </span>
    </Tooltip>
  );
};

export default InteractiveHandle;
