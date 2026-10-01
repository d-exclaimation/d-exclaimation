"use client";

//
//  hand.tsx
//  d-exclaimation
//
//  Projects dealt as a hand of cards that turns like a dial
//

import { currentGlowRamps, glowOf } from "@/(common)/glow";
import Link from "@/(components)/link";
import ResponsiveParallaxLayer from "@/(components)/responsive-parallax-layer";
import Scrambled from "@/(components)/scrambled";
import { useInView, useReducedMotion, useSpring, useSprings } from "@react-spring/web";
import { useGesture } from "@use-gesture/react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
  type RefObject,
} from "react";
import {
  bounds,
  clamp,
  DESKTOP,
  hitTest,
  indexAt,
  PHONE,
  rubber,
  SCATTER,
  scatterOf,
  slotOf,
  tossRank,
} from "./fan";
import HandCard, { usePacket } from "./hand-card";

export type Shot = {
  src: string;
  alt: string;
  /** CSS object-position of the shot inside the card, when the default crop misses the good part. */
  position?: string;
};

export type Project = {
  name: string;
  description: string;
  href: string;
  year: string;
  /** The first shot is the cover; more than one makes a packet (first project only). */
  shots: [Shot, ...Shot[]];
  /** `iphone` crops off the status bar; `clean` keeps the top of the page. */
  capture: "iphone" | "clean";
  finish?: "silver";
};

type Props = {
  projects: Project[];
  /** Called when focus moves into the section from outside, so the page can snap to it. */
  onFocusEnter?: () => void;
};

const AUTOPLAY_MS = 2600;
const IN_VIEW = { amount: 0.5 } as const;
/** Screens roomy enough for the wider desktop fan. */
const WIDE = "(min-width: 898px) and (min-height: 548px)";

/** Intro timings in ms: toss the cards onto the table, flip them face down, gather and riffle, deal. */
const TOSS_GAP = 45;
const FLIP_AT = 850;
const FLIP_GAP = 30;
const GATHER_AT = 1350;
const GATHER_GAP = 28;
const RIFFLE_AT = 1900;
const RIFFLE_SPLIT = 240;
const DEAL_AT = 2450;
const DEAL_GAP = 80;
/** Cards turn face up a beat after they leave the pile. */
const DEAL_FLIP_LAG = 90;
/** How far the riffle splits the halves (% of card width) and tilts them (deg); phones keep the deck on screen. */
const RIFFLE = { wide: { spread: 58, tilt: 5 }, narrow: { spread: 22, tilt: 1.5 } };
const TOSS = { tension: 170, friction: 18 };
const FLIP = { tension: 260, friction: 24 };
const GATHER = { tension: 220, friction: 26 };
const SPLIT = { tension: 340, friction: 28 };
const MERGE = { tension: 420, friction: 32 };
const DEAL = { tension: 240, friction: 22 };

function Hand({ projects, onFocusEnter }: Props) {
  const reduced = !!useReducedMotion();
  const [lo, hi] = bounds(projects.length);
  const [inViewRef, inView] = useInView(IN_VIEW);
  const tablist = inViewRef as RefObject<HTMLDivElement | null>;

  const [focus, setFocus] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  const [preview, setPreview] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const [dealt, setDealt] = useState(false);
  const [ready, setReady] = useState(false);
  const [geo, setGeo] = useState(DESKTOP);
  const [canTilt, setCanTilt] = useState(false);
  const [colors, setColors] = useState<{ left: string; right: string }>(glowOf(new Date(0)));

  const focusRef = useRef(0);
  const hoverRef = useRef<number | null>(null);
  const previewRef = useRef<number | null>(null);
  const inViewNow = useRef(false);
  const hovering = useRef(false);
  const interacted = useRef(false);
  const refocus = useRef(false);
  const prevName = useRef("");
  const readyRef = useRef(false);

  const [deck, api] = useSpring(() => ({ pos: 0, opacity: 0 }));
  // Per card intro state (see HandCard); cards start above the table, ready to be tossed on
  const [cards, cardsApi] = useSprings(projects.length, (i) => ({
    d: 0,
    f: 0,
    sx: 0,
    sy: -260,
    sr: SCATTER[i % SCATTER.length].r * 2,
    x: 0,
    r: 0,
  }));
  const [back, setBack] = useState<[string, string]>(["#fb923c", "#a3e635"]);
  const [tilt, tiltApi] = useSpring(() => ({ rx: 0, ry: 0 }));

  const lead = projects[0];
  const packet = usePacket(lead.shots.length, reduced);
  const project = projects[focus];
  const previewing = preview ?? hover;
  const previewProject = previewing !== null && previewing !== focus ? projects[previewing] : null;

  useEffect(() => {
    inViewNow.current = inView;
  }, [inView]);

  useEffect(() => {
    readyRef.current = ready;
  }, [ready]);

  useEffect(() => {
    setColors(glowOf(new Date()));
    const ramps = currentGlowRamps(new Date(), window.matchMedia("(prefers-color-scheme: dark)").matches);
    setBack([`rgb(${ramps[0][2].join(" ")})`, `rgb(${ramps[1][2].join(" ")})`]);
    const wide = window.matchMedia(WIDE);
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => {
      setGeo(wide.matches ? DESKTOP : PHONE);
      setCanTilt(fine.matches);
    };
    sync();
    wide.addEventListener("change", sync);
    fine.addEventListener("change", sync);
    return () => {
      wide.removeEventListener("change", sync);
      fine.removeEventListener("change", sync);
    };
  }, []);

  // Intro: the cards are tossed onto the table face up in a mess, flipped face down, gathered
  // and riffled, then dealt out from the edges in, turning face up, so the first project lands last
  useEffect(() => {
    if (!inView || ready) return;
    if (reduced) {
      api.set({ opacity: 1 });
      cardsApi.set({ d: 1, f: 0, sx: 0, sy: 0, sr: 0, x: 0, r: 0 });
      setDealt(true);
      setReady(true);
      return;
    }
    const n = projects.length;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const at = (ms: number, run: () => void) => timers.push(setTimeout(run, ms));
    const side = (i: number) => (slotOf(i) > 0 ? 1 : -1);
    const { spread, tilt } = RIFFLE[geo === PHONE ? "narrow" : "wide"];
    // Bottom of the pile first: the outermost cards sit lowest and are dealt first
    const pile = projects
      .map((_, i) => i)
      .sort((a, b) => Math.abs(slotOf(b)) - Math.abs(slotOf(a)) || slotOf(a) - slotOf(b));

    api.start({ opacity: 1, config: { duration: 150 } });
    cardsApi.start((i) => {
      const { x, y, r } = scatterOf(i, geo);
      return { sx: x, sy: y, sr: r, delay: tossRank(i, n) * TOSS_GAP, config: TOSS };
    });
    at(FLIP_AT, () => cardsApi.start((i) => ({ f: 1, delay: tossRank(i, n) * FLIP_GAP, config: FLIP })));
    at(GATHER_AT, () =>
      cardsApi.start((i) => ({ sx: 0, sy: 0, sr: 0, delay: pile.indexOf(i) * GATHER_GAP, config: GATHER }))
    );
    at(RIFFLE_AT, () =>
      cardsApi.start((i) => ({ x: side(i) * spread, r: side(i) * tilt, delay: pile.indexOf(i) * 8, config: SPLIT }))
    );
    at(RIFFLE_AT + RIFFLE_SPLIT, () =>
      cardsApi.start((i) => ({ x: 0, r: 0, delay: pile.indexOf(i) * 24, config: MERGE }))
    );
    at(DEAL_AT, () => {
      cardsApi.start((i) => ({ d: 1, delay: pile.indexOf(i) * DEAL_GAP, config: DEAL }));
      cardsApi.start((i) => ({ f: 0, delay: pile.indexOf(i) * DEAL_GAP + DEAL_FLIP_LAG, config: FLIP }));
    });
    const last = DEAL_AT + (n - 1) * DEAL_GAP;
    at(last, () => setDealt(true));
    at(last + 450, () => setReady(true));
    return () => timers.forEach(clearTimeout);
  }, [inView, ready, reduced, api, cardsApi, projects, geo]);

  const resetTilt = useCallback(
    () => tiltApi.start({ rx: 0, ry: 0, config: { tension: 180, friction: 20 } }),
    [tiltApi]
  );

  const setHoverOnce = useCallback((index: number | null) => {
    if (hoverRef.current === index) return;
    hoverRef.current = index;
    setHover(index);
  }, []);

  /** Turn the hand so the card in `slot` is centred. */
  const go = useCallback(
    (slot: number, velocity = 0) => {
      const target = clamp(Math.round(slot), lo, hi);
      setHoverOnce(null);
      focusRef.current = indexAt(target);
      setFocus(indexAt(target));
      resetTilt();
      api.start({
        pos: target,
        config: velocity
          ? { tension: 240, friction: 26, velocity }
          : { tension: 280, friction: 30 },
      });
    },
    [lo, hi, api, resetTilt, setHoverOnce]
  );

  /** Card under a viewport point, other than the centred one. */
  const cardAt = (x: number, y: number) => {
    const box = tablist.current;
    const card = box?.querySelector<HTMLElement>("[data-card]");
    if (!box || !card) return null;
    const rect = box.getBoundingClientRect();
    const W = card.offsetWidth;
    const H = card.offsetHeight;
    const pos = deck.pos.get();
    const others = projects
      .map((_, index) => ({ index, t: slotOf(index) - pos }))
      .filter(({ index }) => index !== focusRef.current);
    return hitTest(x - (rect.left + rect.width / 2), rect.top + 0.12 * H + (1 + geo.pivot) * H - y, others, geo, W, H);
  };

  const bind = useGesture(
    {
      onDrag: ({ first, last, tap, event, movement: [mx], velocity: [vx], direction: [dirX], memo }) => {
        if (!readyRef.current) return memo;
        if (tap) {
          const e = event as unknown as globalThis.PointerEvent;
          if ((e.target as HTMLElement | null)?.closest('[aria-selected="true"]')) return;
          const hit = cardAt(e.clientX, e.clientY);
          if (hit !== null) {
            interacted.current = true;
            go(slotOf(hit));
          }
          return;
        }
        const card = tablist.current?.querySelector<HTMLElement>("[data-card]");
        const m: { start: number; px: number } =
          memo ?? { start: deck.pos.get(), px: 0.45 * (card?.offsetWidth ?? 240) };
        if (first) {
          interacted.current = true;
          setDragging(true);
          setHoverOnce(null);
          resetTilt();
        }
        const p = rubber(m.start - mx / m.px, lo, hi);
        if (last) {
          setDragging(false);
          previewRef.current = null;
          setPreview(null);
          if (event.type === "pointercancel") {
            go(slotOf(focusRef.current));
            return m;
          }
          const signed = dirX * vx;
          const start = Math.round(m.start);
          const target = clamp(Math.round(p - (signed * 120) / m.px), start - 3, start + 3);
          go(target, -signed / m.px);
          return m;
        }
        api.start({ pos: p, immediate: true });
        const next = indexAt(clamp(Math.round(p), lo, hi));
        if (previewRef.current !== next) {
          previewRef.current = next;
          setPreview(next);
        }
        return m;
      },
      onMove: ({ event, dragging: busy, last }) => {
        const e = event as unknown as globalThis.PointerEvent;
        if (busy || last || e.pointerType !== "mouse") return;
        const overCentre = (e.target as HTMLElement | null)?.closest('[aria-selected="true"]');
        setHoverOnce(overCentre ? null : cardAt(e.clientX, e.clientY));
      },
      onHover: ({ hovering: over }) => {
        hovering.current = !!over;
        if (!over) setHoverOnce(null);
      },
    },
    {
      drag: {
        axis: "x",
        axisThreshold: { mouse: 4, touch: 10, pen: 8 },
        filterTaps: true,
        tapsThreshold: 8,
        pointer: { keys: false },
      },
    }
  );

  // ←/→ turn the hand while the section is on screen; ↑/↓ stay with the page
  useEffect(() => {
    let last = 0;
    const onKeydown = (e: KeyboardEvent) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      if (!inViewNow.current || !readyRef.current || e.defaultPrevented) return;
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      const target = e.target instanceof Element ? e.target : null;
      if (target?.closest("[data-shots], input, textarea, select, [contenteditable]")) return;
      const now = performance.now();
      if (e.repeat && now - last < 120) return;
      last = now;
      e.preventDefault();
      interacted.current = true;
      const slot = slotOf(focusRef.current) + (e.key === "ArrowRight" ? 1 : -1);
      if (slot < lo || slot > hi) return;
      refocus.current = !!tablist.current?.contains(document.activeElement);
      go(slot);
    };
    window.addEventListener("keydown", onKeydown);
    return () => window.removeEventListener("keydown", onKeydown);
  }, [go, lo, hi, tablist]);

  useEffect(() => {
    if (!refocus.current) return;
    refocus.current = false;
    document.getElementById(`project-tab-${focus}`)?.focus({ preventScroll: true });
  }, [focus]);

  // The scramble morphs from the last project shown
  useEffect(() => {
    if (ready) prevName.current = project.name;
  }, [ready, project.name]);

  // Partly's packet cuts through its shots once, then stops for good
  const { cut } = packet;
  useEffect(() => {
    if (!ready || reduced || lead.shots.length < 2) return;
    let cuts = 0;
    const id = setInterval(() => {
      if (interacted.current) return clearInterval(id);
      if (!inViewNow.current || document.hidden || hovering.current || focusRef.current !== 0) return;
      cut();
      if (++cuts >= lead.shots.length) clearInterval(id);
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [ready, reduced, cut, lead.shots.length]);

  const onTilt = (e: PointerEvent<HTMLButtonElement>) => {
    if (!canTilt || reduced || dragging || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    tiltApi.start({ rx: (0.5 - py) * 10, ry: (px - 0.5) * 14, config: { tension: 300, friction: 24 } });
  };

  const order = useMemo(
    () => projects.map((p, index) => ({ p, index, slot: slotOf(index) })).sort((a, b) => a.slot - b.slot),
    [projects]
  );

  return (
    <ResponsiveParallaxLayer className="z-10 h-dvh w-full overflow-hidden" offset={1} speed={0.2}>
      <section
        aria-label="Projects"
        className="hand relative flex h-full w-full flex-col items-center justify-center px-4"
        style={{ "--back-from": back[0], "--back-to": back[1] } as CSSProperties}
        onPointerDownCapture={() => (interacted.current = true)}
        onFocusCapture={(e) => {
          interacted.current = true;
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) onFocusEnter?.();
        }}
      >
        <div
          ref={inViewRef}
          {...bind()}
          role="tablist"
          aria-label="Projects"
          data-hover={hover !== null}
          data-dragging={dragging}
          className="relative z-0 h-(--box-h) w-full touch-pan-y select-none [-webkit-touch-callout:none] data-[dragging=true]:cursor-grabbing data-[hover=true]:cursor-pointer"
        >
          <div
            aria-hidden
            data-on={dealt}
            className="absolute left-1/2 top-0 h-(--card-h) w-(--card-w) -translate-x-1/2 opacity-0 transition-opacity duration-1000 data-[on=true]:opacity-100 motion-reduce:transition-none"
          >
            <span className={`absolute -left-[14%] top-[22%] size-[78%] rounded-full blur-3xl ${colors.left} dark:bg-orange-400/30`} />
            <span className={`absolute left-[36%] top-[22%] size-[78%] rounded-full blur-3xl ${colors.right} dark:bg-lime-400/30`} />
          </div>
          {order.map(({ p, index, slot }) => (
            <HandCard
              key={p.name}
              project={p}
              index={index}
              slot={slot}
              geo={geo}
              deck={deck}
              card={cards[index]}
              toss={tossRank(index, projects.length)}
              tilt={index === focus && canTilt && !reduced ? tilt : undefined}
              focused={index === focus}
              hovered={index === hover && index !== focus}
              ready={ready}
              packet={index === 0 && p.shots.length > 1 ? packet : undefined}
              onSelect={() => go(slot)}
              onActivate={() => {
                if (index === 0 && p.shots.length > 1) packet.cut();
              }}
              onTilt={onTilt}
              onTiltEnd={resetTilt}
            />
          ))}
        </div>

        <div
          role="tabpanel"
          id="project-panel"
          aria-labelledby={`project-tab-${focus}`}
          data-ready={ready}
          className="relative z-10 mt-5 flex w-full max-w-[34ch] flex-col items-center gap-2 text-center opacity-0 transition-opacity duration-300 data-[ready=true]:opacity-100 md:mt-6 md:max-w-[52ch]"
        >
          <Link className="group flex min-h-8 items-center justify-center md:min-h-10" href={project.href} external>
            {!ready ? (
              <span className="sr-only">{project.name}</span>
            ) : reduced ? (
                <span className="font-mono text-2xl font-bold group-hover:underline md:text-4xl dark:text-white">
                  {project.name}
                </span>
              ) : (
                <Scrambled
                  key={project.name}
                  from={prevName.current}
                  label={project.name}
                  className="text-2xl font-bold group-hover:underline md:text-4xl dark:text-white dark:data-[dud=true]:text-white/50"
                  align="items-start"
                  justify="justify-center"
                  phrases={[project.name, project.name]}
                  speed={25}
                  delay={10_000}
                />
              )}
          </Link>
          <p
            key={project.name}
            className="line-clamp-3 min-h-[3lh] animate-appear text-sm text-balance text-black md:line-clamp-2 md:min-h-[2lh] md:text-base dark:text-white"
          >
            {project.description}
          </p>
          <div className="flex h-6 items-center gap-2 font-mono text-xs text-black/55 dark:text-white/55">
            {previewProject ? (
              <span aria-hidden>
                → {previewProject.name} · {previewProject.year}
              </span>
            ) : (
              <span>
                {project.year} · {new URL(project.href).host}
              </span>
            )}
            {focus === 0 && lead.shots.length > 1 && (
              <div
                role="group"
                aria-label={`${lead.name} screenshots`}
                data-shots
                className="flex items-center transition-opacity data-[hidden=true]:pointer-events-none data-[hidden=true]:opacity-0"
                data-hidden={!!previewProject}
              >
                {lead.shots.map((shot, i) => (
                  <button
                    key={shot.src}
                    type="button"
                    className="grid size-6 place-items-center"
                    aria-label={`Show ${shot.alt}`}
                    aria-pressed={packet.front === i}
                    onClick={() => packet.show(i)}
                  >
                    <span
                      className={`size-1.5 rounded-[1.5px] ${
                        packet.front === i ? "bg-current" : "ring-1 ring-current ring-inset"
                      }`}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <p className="sr-only" aria-live="polite">
          {ready ? `${project.name}, ${project.year}. ${project.description}` : ""}
        </p>
      </section>
    </ResponsiveParallaxLayer>
  );
}

export default Hand;
