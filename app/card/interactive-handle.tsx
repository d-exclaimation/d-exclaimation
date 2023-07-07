"use client";

//
//  InteractiveHandle.tsx
//  d-exclaimation
//
//  Created by d-exclaimation on 24 Dec 2022
//

import { rc } from "@d-exclaimation/next";
import Link from "next/link";
import {
  cloneElement,
  ReactNode,
  SetStateAction,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { Tooltip as BaseTooltip, TooltipProps } from "react-tippy";
import { manifest, Manifest } from "../../common/manifest";

const Tooltip = (props: TooltipProps & { children: ReactNode }) =>
  cloneElement(<BaseTooltip />, { ...props });

const DELAY = 750;

const InteractiveHandle = rc(() => {
  const timeoutRef = useRef<number | NodeJS.Timer | null>(null);
  const [selected, setSelected] = useState<keyof Manifest["handles"] | null>(
    null
  );

  const selects = useCallback(
    (change: SetStateAction<keyof Manifest["handles"] | null>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setSelected(change);
    },
    [setSelected]
  );

  const click = useCallback(
    (change: SetStateAction<keyof Manifest["handles"] | null>) => {
      selects(change);
      timeoutRef.current = setTimeout(() => setSelected(null), DELAY);
    },
    [selects]
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
          className="select-none font-mono font-medium text-xl 
          md:text-4xl opacity-25 dark:text-white"
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
        className="select-none font-mono font-medium text-2xl md:text-5xl lg:text-6xl dark:text-white"
        onMouseLeave={() => {
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          timeoutRef.current = setTimeout(() => setSelected(null), DELAY);
        }}
      >
        <span
          id="name"
          className={
            selected === "email"
              ? "text-red-400 underline"
              : selected === "name"
              ? "text-blue-400 underline"
              : "dark:text-white"
          }
          onClick={() => click((prev) => (prev === "email" ? prev : "name"))}
          onMouseEnter={() =>
            selects((prev) => (prev === "email" ? prev : "name"))
          }
        >
          vin
        </span>
        <span
          className={
            selected === "email"
              ? "text-red-400 underline"
              : selected === "name"
              ? "text-blue-400 underline"
              : "dark:text-white"
          }
          onClick={() => click((prev) => (prev === "name" ? prev : "email"))}
          onMouseEnter={() =>
            selects((prev) => (prev === "name" ? prev : "email"))
          }
        >
          cent
        </span>
        <span
          id="linkedin"
          className={
            selected === "email" ? "text-red-400 underline" : "dark:text-white"
          }
        >
          @
        </span>
        <span
          className={
            selected === "site"
              ? "text-indigo-400 underline"
              : selected === "linkedin"
              ? "text-teal-400 underline"
              : selected === "email"
              ? "text-red-400 underline"
              : "dark:text-white"
          }
          onClick={() =>
            selects((prev) => {
              if (prev === "site") {
                return prev;
              }
              return "linkedin";
            })
          }
          onMouseEnter={() =>
            selects((prev) => {
              if (prev === "site") {
                return prev;
              }
              return "linkedin";
            })
          }
        >
          d
        </span>
        <span
          className={
            selected === "site"
              ? "text-indigo-400 underline"
              : selected === "linkedin"
              ? "text-teal-400 underline"
              : selected === "email"
              ? "text-red-400 underline"
              : "dark:text-white"
          }
          onMouseEnter={() =>
            selects((prev) => {
              if (prev === "site") {
                return prev;
              }
              return "linkedin";
            })
          }
          onClick={() =>
            selects((prev) => {
              if (prev === "site") {
                return prev;
              }
              return "linkedin";
            })
          }
        >
          -exclaimation
        </span>
        <span
          id="website"
          className={
            selected === "site"
              ? "text-indigo-400 underline"
              : selected === "email"
              ? "text-red-400 underline"
              : "dark:text-white"
          }
          onClick={() => click("site")}
          onMouseEnter={() => selects("site")}
        >
          .me
        </span>
      </span>
    </Tooltip>
  );
});

export default InteractiveHandle;
