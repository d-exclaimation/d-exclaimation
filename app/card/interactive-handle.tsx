"use client";

//
//  InteractiveHandle.tsx
//  d-exclaimation
//
//  Created by d-exclaimation on 24 Dec 2022
//

import Link from "next/link";
import {
  ReactNode,
  SetStateAction,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { manifest, Manifest } from "../(common)/manifest";

type TooltipProps = {
  html: ReactNode;
  open: boolean;
  children: ReactNode;
};

const Tooltip = ({ html, open, children }: TooltipProps) => (
  <span className="relative inline-block">
    <span
      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap
      transition-all duration-300 data-[open=false]:opacity-0 data-[open=false]:translate-y-1
      data-[open=false]:pointer-events-none"
      data-open={open}
    >
      {html}
    </span>
    {children}
  </span>
);

const DELAY = 750;

function InteractiveHandle() {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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
}

export default InteractiveHandle;
