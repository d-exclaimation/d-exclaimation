"use client";

//
//  showcase.tsx
//  d-exclaimation
//
//  Constructs on pages side by side: swipe between them, or step through them from the name at the bottom, and only the page you land on builds
//

import { manifest, type Stories } from "@/(common)/manifest";
import { tw } from "@/(common)/tailwind";
import Link from "@/(components)/link";
import Scrambled from "@/(components)/scrambled";
import { useReducedMotion } from "@react-spring/web";
import { useCallback, useEffect, useRef, useState } from "react";
import Arrow from "./arrow";
import Construct, { STAGE, type Name } from "./construct";
import Icon, { type IconName } from "./icons";
import Selection from "./selection";

type Destination = {
  label: string;
  href: string;
  external: boolean;
  icon?: IconName;
  /** Puts a game on the arcade cabinet, rather than going anywhere. */
  play?: boolean;
};

type Page = {
  name: Name;
  /** The names the title cycles through. A lone one glitches in place. */
  titles: string[];
  about: string;
  links: Destination[];
  /** Lists the links one per line, for ones too long to share a row. */
  stacked?: boolean;
};

const story = (label: keyof Stories): Destination => ({ label, ...manifest.stories[label] });

const pages: Page[] = [
  {
    name: "jet",
    titles: ["vincent", "talker", "d-exclaimation"],
    about:
      "There's always one person already in the air while everyone else is still arguing about the jump. From the ground it looks like a stupid idea. Maybe it's brave, nobody really knows until it lands. Every good thing that ever existed looked like a bad idea for a long time, until it wasn't. It's just a matter of whether they fall or fly.",
    links: [story("github"), story("linkedin"), story("resume")],
  },
  {
    name: "repair",
    titles: ["partly repair ai"],
    about:
      "We became extraordinary at building things, but we haven't done that with repair. Almost everything about a modern car is engineered, except what happens when it breaks. Then it's back to guesswork, phone calls and whoever remembers how it came apart last time. There's no good reason repair can't be extraordinary too.",
    stacked: true,
    links: [
      { label: "partly.com/us/repair", href: "https://www.partly.com/us/repair", external: true },
      { label: "partly.com/nz/repair", href: "https://www.partly.com/nz/repair", external: true },
      { label: "partly.com/uk/repair", href: "https://www.partly.com/uk/repair", external: true },
    ],
  },
  {
    name: "capture",
    titles: ["partly capture"],
    about:
      "Making repair extraordinary is a big job, so it starts right next to the damage. That means a quick look, a walk back to the desk and a lot of typing. It doesn't have to be that hard. All of it could happen right there next to the car, in the palm of your hand.",
    links: [{ label: "capture.partly.com", href: "https://capture.partly.com", external: true }],
  },
  {
    name: "partly",
    titles: ["partly"],
    about:
      "Partly is building frontier AI for repair, because anything that gets built should be fixable, by anyone. My time there has gone to the people doing the fixing: Partly Repair, Partly Capture, and now Repair AI on mobile.",
    links: [
      { label: "partly.com", href: manifest.stories.partly.href, external: true },
      { label: "partly.com/repair", href: "https://partly.com/repair", external: true },
    ],
  },
  {
    name: "bodyshop",
    titles: ["vroomline"],
    about:
      "Run a body shop for a day. Write the estimates, fight the insurers, calm the customers and try to stop the crew punching each other. You can also shove your coworkers. It costs money. It's worth it.",
    links: [{ label: "bodyshop.talker.dev", href: "https://bodyshop.talker.dev", external: true }],
  },
  {
    name: "exploded",
    titles: ["exploded view"],
    about:
      "Two idiots share one magic tablet that can build anything. Whoever's holding it gets the powers, so most of the game is throwing it at each other.",
    links: [{ label: "epc.talker.dev", href: "https://epc.talker.dev", external: true }],
  },
  {
    name: "mirage",
    titles: ["mirage ai"],
    about:
      "Give it a sentence and it makes you a short video. We pointed some very serious AI at a very unserious problem: memes.",
    links: [{ label: "mirageai.xyz", href: "https://mirageai.xyz", external: true }],
  },
  {
    name: "shelf",
    titles: ["more projects"],
    about: "Smaller things, built for fun.",
    stacked: true,
    links: [
      { label: "pioneer", href: "https://github.com/d-exclaimation/pioneer", external: true, icon: "dish" },
      { label: "spotlight", href: "https://spotlight.d-exclaimation.me", external: true, icon: "spotlight" },
      { label: "pixle", href: "https://pixle.d-exclaimation.me", external: true, icon: "photo" },
      { label: "seraph", href: "https://github.com/d-exclaimation/seraph", external: true, icon: "wing" },
      { label: "downpour", href: "https://downpour.talker.dev", external: true, icon: "rain" },
    ],
  },
  {
    name: "arcade",
    titles: ["arcade"],
    about: "Little games, for when you should be working.",
    stacked: true,
    links: [
      { label: "snake", href: "#snake", external: false, icon: "snake", play: true },
      { label: "memory", href: "#memory", external: false, icon: "cards", play: true },
      { label: "escape the 404", href: "https://spotlight.d-exclaimation.me/404", external: true, icon: "door" },
    ],
  },
];
/** Milliseconds in, once the intro has finished, that the remaining pages load one at a time. */
const LOADS = [4600, 5400, 6200, 7000, 7800, 8600, 9400];
/** Milliseconds without scrolling before the pager counts as having landed. */
const LANDED = 120;
/** Milliseconds the title holds still between glitches. */
const REST = 6000;
/** The pages each key moves by. */
const KEYS: Record<string, number> = { arrowleft: -1, a: -1, arrowright: 1, d: 1 };
/** How far the wheel has to travel in one go to turn the page: a real swipe, or four notches of a mouse wheel. */
const WHEEL_REACH = 400;
/** Milliseconds without the wheel that end a go, which a trackpad's momentum never leaves. */
const WHEEL_QUIET = 300;
/** Milliseconds a page holds the wheel off for, so it gets taken in before it can be left. */
const WHEEL_REST = 3000;

function Showcase() {
  const pager = useRef<HTMLDivElement>(null);
  const reduced = !!useReducedMotion();
  const [active, setActive] = useState(0);
  // The page on show, which only changes once a slide has finished, so nothing plays in passing
  const [live, setLive] = useState(0);
  const landing = useRef<ReturnType<typeof setTimeout>>(undefined);
  // A click names its page straight away, so the scroll catching up mustn't name the ones behind it
  const steered = useRef(false);
  // Pages load in the quiet after the intro, or sooner if they are reached first
  const [loaded, setLoaded] = useState(1);
  // Which link is being pointed at, for a construct with a thing to match it
  const [picked, setPicked] = useState<number | null>(null);
  // Which game the arcade cabinet is showing, if any
  const [playing, setPlaying] = useState<number | null>(null);
  // How far this go of the wheel has come, and whether it has already had its one page
  const wheel = useRef({ travel: 0, at: 0, spent: false, restUntil: 0 });
  // Only one construct ever draws, so there's one canvas, sat over whichever page is on show
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const { titles } = pages[active];

  useEffect(() => {
    const timers = LOADS.map((delay, n) => setTimeout(() => setLoaded((was) => Math.max(was, n + 2)), delay));
    return () => timers.forEach(clearTimeout);
  }, []);

  // An address can land straight on a page
  useEffect(() => {
    const index = pages.findIndex(({ name }) => `#${name}` === location.hash);
    if (index < 1 || !pager.current) return;
    setActive(index);
    setLive(index);
    setLoaded((was) => Math.max(was, index));
    pager.current.scrollTo({ left: index * pager.current.clientWidth, behavior: "auto" });
  }, []);

  // Walking away from the cabinet leaves the game behind
  useEffect(() => {
    if (pages[active].name !== "arcade") setPlaying(null);
  }, [active]);

  const onScroll = useCallback(() => {
    if (!pager.current) return;
    const at = pager.current.scrollLeft / pager.current.clientWidth;
    if (!steered.current) setActive(Math.round(at));
    setLoaded((was) => Math.max(was, Math.ceil(at)));
    clearTimeout(landing.current);
    landing.current = setTimeout(() => {
      steered.current = false;
      setActive(Math.round(at));
      setLive(Math.round(at));
    }, LANDED);
  }, []);

  const go = useCallback(
    (index: number) => {
      if (!pager.current || index < 0 || index >= pages.length) return;
      steered.current = true;
      setActive(index);
      setLoaded((was) => Math.max(was, index));
      pager.current.scrollTo({ left: index * pager.current.clientWidth, behavior: reduced ? "auto" : "smooth" });
    },
    [reduced]
  );

  useEffect(() => {
    function onKeydown(e: KeyboardEvent) {
      if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
      const by = KEYS[e.key.toLowerCase()];
      if (!by) return;
      e.preventDefault();
      go(active + by);
    }
    window.addEventListener("keydown", onKeydown);
    return () => window.removeEventListener("keydown", onKeydown);
  }, [active, go]);

  // Every page gets its moment, however it was reached and from when it lands
  useEffect(() => {
    wheel.current.restUntil = performance.now() + WHEEL_REST;
  }, [active, live]);

  useEffect(() => {
    function onWheel(e: WheelEvent) {
      // Pinches and sideways swipes aren't asking for this, and a game shouldn't be left by accident
      if (e.ctrlKey || playing !== null || Math.abs(e.deltaX) >= Math.abs(e.deltaY)) return;
      const turn = wheel.current;
      // A go that starts while the page is resting doesn't count, even if it carries on past the rest
      if (e.timeStamp - turn.at > WHEEL_QUIET) {
        turn.travel = 0;
        turn.spent = e.timeStamp < turn.restUntil;
      }
      turn.at = e.timeStamp;
      if (turn.spent) return;
      const by = e.deltaMode === WheelEvent.DOM_DELTA_PIXEL ? e.deltaY : e.deltaY * 33;
      turn.travel = by * turn.travel < 0 ? by : turn.travel + by;
      const to = active + Math.sign(turn.travel);
      if (Math.abs(turn.travel) < WHEEL_REACH || !pages[to]) return;
      turn.spent = true;
      go(to);
    }
    window.addEventListener("wheel", onWheel, { passive: true });
    return () => window.removeEventListener("wheel", onWheel);
  }, [active, go, playing]);

  return (
    <div className="fixed inset-0 z-20" style={{ background: "#f4f3ef" }}>
      <div
        ref={pager}
        onScroll={onScroll}
        className="relative flex h-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden"
        style={{ scrollbarWidth: "none" }}
      >
        <canvas
          ref={setCanvas}
          className="pointer-events-none absolute top-0 block h-full w-full"
          style={{ left: `${live * 100}%` }}
        />
        {pages.map(({ name, about, links, stacked }, index) => (
          <section
            key={name}
            className="relative grid h-full w-full shrink-0 snap-center snap-always grid-rows-[minmax(0,1fr)_auto] pb-24 md:grid-cols-[43%_minmax(0,1fr)] md:grid-rows-[minmax(0,1fr)]"
          >
            {index <= loaded && (
              <Construct
                canvas={canvas}
                name={name}
                live={index === live}
                picked={name === "arcade" ? playing : index === active ? picked : null}
                className={STAGE}
              />
            )}
            <div
              inert={index !== active}
              className="relative z-10 row-start-2 px-6 pb-6 text-[#141414] md:col-start-1 md:row-start-1 md:self-center md:pr-[3vw] md:pb-0 md:pl-[6vw]"
            >
              <p className="max-w-md md:text-lg">{about}</p>
              <div className={tw("mt-3 -ml-3 flex flex-wrap gap-y-1 md:mt-5", stacked && "flex-col items-start")}>
                {links.map(({ label, href, external, icon, play }, n) => {
                  const face = (
                    <Selection selected={play && playing === n}>
                      <span className="inline-flex items-center gap-2">
                        {icon && <Icon name={icon} />}
                        <span>
                          <span className="underline decoration-black/30 underline-offset-4 group-hover:no-underline group-focus-visible:no-underline">
                            {label}
                          </span>
                          {external && <span aria-hidden> ↗</span>}
                        </span>
                      </span>
                    </Selection>
                  );
                  return (
                    <div
                      key={href}
                      onMouseEnter={() => setPicked(n)}
                      onMouseLeave={() => setPicked(null)}
                      onFocus={() => setPicked(n)}
                      onBlur={() => setPicked(null)}
                    >
                      {play ? (
                        <button
                          type="button"
                          aria-pressed={playing === n}
                          className="group focus-visible:outline-hidden"
                          onClick={() => setPlaying(playing === n ? null : n)}
                        >
                          {face}
                        </button>
                      ) : (
                        <Link className="group focus-visible:outline-hidden" href={href} external={external}>
                          {face}
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        ))}
      </div>
      <nav className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-center justify-center pb-6 font-mono text-[28px] font-bold text-[#141414] md:pb-8 md:text-5xl">
        <Arrow direction="previous" disabled={active === 0} onClick={() => go(active - 1)} />
        <div className="flex w-[17ch] justify-center">
          {reduced ? (
            titles[0]
          ) : (
            <Scrambled
              label={titles[0]}
              className="text-[28px] font-bold md:text-5xl"
              color={{ normal: "text-neutral-900", dud: "data-[dud=true]:text-neutral-300" }}
              align="items-start"
              justify="justify-center"
              phrases={titles}
              speed={25}
              delay={REST}
            />
          )}
        </div>
        <Arrow direction="next" disabled={active === pages.length - 1} onClick={() => go(active + 1)} />
      </nav>
    </div>
  );
}

export default Showcase;
