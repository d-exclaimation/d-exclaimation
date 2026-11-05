"use client";

//
//  construct.tsx
//  d-exclaimation
//
//  Mounts a blueprint onto the page's one canvas and holds it inside a stage placed by `className`
//

import { useEffect, useRef } from "react";
import { arcade } from "./arcade";
import { bodyshop } from "./bodyshop";
import { mountConstruct, type Blueprint } from "./engine";
import { capture } from "./capture";
import { commander } from "./commander";
import { drifter } from "./drifter";
import { exploded } from "./exploded";
import { jet } from "./jet";
import { mirage } from "./mirage";
import { partly } from "./partly";
import { repair } from "./repair";
import { shelf } from "./shelf";

const blueprints = { jet, repair, capture, partly, drifter, commander, bodyshop, exploded, mirage, shelf, arcade };

export type Name = keyof typeof blueprints;

/** The box a construct stays inside, the same on every screen. */
export const STAGE =
  "mx-[14%] my-[7%] md:col-start-2 md:row-start-1 md:my-0 md:mr-[7vw] md:ml-0 md:h-[64%] md:self-center";

type Props = {
  /** The one canvas every construct draws on. */
  canvas: HTMLCanvasElement | null;
  name: Name;
  /** Whether it is the one on show. Anything else draws nothing at all. */
  live: boolean;
  /** Places the stage, the box in the parent that the construct never leaves. */
  className?: string;
  /** Which of its things is picked, for a blueprint that has several. */
  picked?: number | null;
};

function Construct({ canvas, name, live, className, picked }: Props) {
  const stage = useRef<HTMLDivElement>(null);
  const world = useRef<ReturnType<typeof mountConstruct> | null>(null);

  // Kept for a blueprint that's still loading what it's drawn from when the page lands on it
  const now = useRef({ live, picked });
  now.current = { live, picked };

  useEffect(() => {
    if (!canvas || !stage.current) return;
    let gone = false;
    const mount = (blueprint: Blueprint) => {
      if (gone || !stage.current) return;
      world.current = mountConstruct(canvas, stage.current, blueprint);
      if (now.current.live) world.current.play();
      world.current.pick(now.current.picked ?? -1);
    };
    // A construct that can't start leaves bare paper rather than taking the whole page down with it
    try {
      const blueprint = blueprints[name]();
      if (blueprint instanceof Promise) blueprint.then(mount).catch(() => {});
      else mount(blueprint);
    } catch {
      return;
    }
    return () => {
      gone = true;
      world.current?.destroy();
      world.current = null;
    };
  }, [canvas, name]);

  useEffect(() => {
    if (live) world.current?.play();
    else world.current?.stop();
  }, [canvas, live]);

  useEffect(() => {
    world.current?.pick(picked ?? -1);
  }, [name, picked]);

  // Touches on the construct's own controls, which shouldn't also slide the page
  useEffect(() => {
    const page = stage.current?.parentElement;
    if (!canvas || !page) return;
    let held = false;
    const down = (e: PointerEvent) => {
      const box = canvas.getBoundingClientRect();
      held = !(e.target as Element).closest("a, button") && !!world.current?.press(e.clientX - box.left, e.clientY - box.top);
    };
    const touch = (e: TouchEvent) => {
      if (held) e.preventDefault();
    };
    page.addEventListener("pointerdown", down);
    page.addEventListener("touchstart", touch, { passive: false });
    return () => {
      page.removeEventListener("pointerdown", down);
      page.removeEventListener("touchstart", touch);
    };
  }, [canvas]);

  return <div ref={stage} className={className} />;
}

export default Construct;
