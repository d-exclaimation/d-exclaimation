"use client";

//
//  hand-card.tsx
//  d-exclaimation
//
//  One project card in the dealt hand, plus the packet of screenshots it can hold
//

import { animated, to, type SpringValue } from "@react-spring/web";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
} from "react";
import { angle, closeness, JITTER, PHONE, zOf, type Geo } from "./fan";
import type { Project } from "./hand";

/** Shuffles a packet of `n` stacked shots: `cut` tucks the front one under, `show` brings one to the front. */
export function usePacket(n: number, reduced: boolean) {
  const [order, setOrder] = useState(() => Array.from({ length: n }, (_, i) => i));
  const [lifting, setLifting] = useState<number | null>(null);
  const orderRef = useRef(order);
  const busy = useRef(false);
  const pending = useRef<number | "cut" | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const run = useRef<(request: number | "cut") => void>(() => {});

  useEffect(() => {
    const scheduled = timers.current;
    return () => scheduled.forEach(clearTimeout);
  }, []);

  const move = useCallback(
    (layer: number, next: number[]) => {
      if (n < 2) return;
      busy.current = true;
      setLifting(layer);
      timers.current.push(
        setTimeout(() => {
          orderRef.current = next;
          setOrder(next);
          setLifting(null);
          timers.current.push(
            setTimeout(() => {
              busy.current = false;
              const request = pending.current;
              pending.current = null;
              if (request !== null) run.current(request);
            }, reduced ? 0 : 360)
          );
        }, reduced ? 0 : 200)
      );
    },
    [n, reduced]
  );

  /** Applies a request against the order at the time it runs, or queues it behind the move in flight. */
  const request = useCallback(
    (req: number | "cut") => {
      if (busy.current) {
        pending.current = req;
        return;
      }
      const [front, ...rest] = orderRef.current;
      if (req === "cut") move(front, [...rest, front]);
      else if (front !== req) move(req, [req, ...orderRef.current.filter((l) => l !== req)]);
    },
    [move]
  );

  useEffect(() => {
    run.current = request;
  }, [request]);

  const cut = useCallback(() => request("cut"), [request]);
  const show = useCallback((layer: number) => request(layer), [request]);

  return { order, lifting, front: order[0], cut, show };
}

export type Packet = ReturnType<typeof usePacket>;

type Props = {
  project: Project;
  index: number;
  slot: number;
  geo: Geo;
  deck: { pos: SpringValue<number>; opacity: SpringValue<number> };
  /**
   * This card's intro: `d` 0 in the pile → 1 dealt into the fan, `f` 0 face up → 1 face down,
   * `sx`/`sy`/`sr` where it lies scattered on the table, `x`/`r` its riffle offset.
   */
  card: {
    d: SpringValue<number>;
    f: SpringValue<number>;
    sx: SpringValue<number>;
    sy: SpringValue<number>;
    sr: SpringValue<number>;
    x: SpringValue<number>;
    r: SpringValue<number>;
  };
  /** Stacking while the cards lie scattered face up, in the order they were tossed. */
  toss: number;
  /** Only passed to the centred card when tilting is enabled. */
  tilt?: { rx: SpringValue<number>; ry: SpringValue<number> };
  focused: boolean;
  hovered: boolean;
  ready: boolean;
  packet?: Packet;
  onSelect: () => void;
  onActivate: () => void;
  onTilt?: (e: PointerEvent<HTMLButtonElement>) => void;
  onTiltEnd?: () => void;
};

const FRAME = {
  plain: "bg-white ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10",
  silver:
    "bg-linear-160 from-[#F7F7F7] via-[#E0E2E2] to-[#B2B5B6] ring-1 ring-black/10 dark:from-[#6E6F70] dark:via-[#494B4D] dark:to-[#131414]",
};

function HandCard({
  project,
  index,
  slot,
  geo,
  deck,
  card,
  toss,
  tilt,
  focused,
  hovered,
  ready,
  packet,
  onSelect,
  onActivate,
  onTilt,
  onTiltEnd,
}: Props) {
  const layers = packet ? project.shots : project.shots.slice(0, 1);
  const crop = project.capture === "iphone" ? "50% 16%" : "50% 0%";

  /** Where a shot sits in the packet: lifted out, fanned when centred, or squared up in the hand. */
  const placement = (layer: number) => {
    const k = packet ? packet.order.indexOf(layer) : 0;
    const transform =
      packet?.lifting === layer
        ? "translate(18%, 0) rotate(6deg)"
        : focused && ready && geo !== PHONE
          ? `translate(${5 * k}px, ${-4 * k}px) rotate(${2 * k}deg)`
          : `translate(${1.5 * k}px, ${-k}px) rotate(${0.6 * k}deg)`;
    return { k, style: { transform, zIndex: 10 - k, transformOrigin: "50% 100%" } };
  };
  // Cards only take their place in the hand (size, lift, dimming) once dealt
  const dim = to([deck.pos, card.d], (p, d) => (1 - closeness(slot - p)) * d);

  return (
    <animated.div
      data-card
      className="absolute left-[calc(50%_-_var(--card-w)/2)] top-[calc(var(--card-h)*0.12)] h-(--card-h) w-(--card-w) origin-[50%_160%] will-change-transform"
      style={{
        // Fan rotation turns about the pivot below the card; scatter rotation about the card's centre
        transform: to(
          [deck.pos, card.d, card.x, card.r, card.sx, card.sy, card.sr],
          (p, d, x, r, sx, sy, sr) =>
            `translate(${x + sx}%, ${sy}%) translateY(-110%) rotate(${sr}deg) translateY(110%) rotate(${
              angle(slot - p, geo) * d + JITTER[index % JITTER.length] * (1 - d) + r
            }deg)`
        ),
        zIndex: to([deck.pos, card.f, card.d], (p, f, d) =>
          f < 0.5 && d < 0.01 ? 5 + toss : zOf(slot - p)
        ),
        opacity: deck.opacity,
      }}
    >
      <animated.button
        type="button"
        role="tab"
        id={`project-tab-${index}`}
        aria-selected={focused}
        aria-controls="project-panel"
        aria-label={`${project.name}, ${project.year}`}
        tabIndex={focused ? 0 : -1}
        className={`block size-full origin-bottom rounded-(--radius) outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-4 focus-visible:outline-black dark:focus-visible:outline-white ${
          focused ? (packet ? "cursor-pointer" : "") : "pointer-events-none"
        }`}
        style={{
          transform: to([deck.pos, card.d], (p, d) => {
            const c = closeness(slot - p) * d;
            return `translateY(${-geo.lift * c}%) scale(${geo.fan + (1 - geo.fan) * c})`;
          }),
        }}
        onClick={focused ? onActivate : onSelect}
        onPointerMove={focused ? onTilt : undefined}
        onPointerLeave={focused ? onTiltEnd : undefined}
      >
        <div
          className="size-full transition-transform duration-200 ease-out data-[hover=true]:-translate-y-[5%] motion-reduce:transition-none"
          data-hover={hovered}
        >
          <animated.div
            className="relative size-full transform-3d"
            style={{ transform: card.f.to((f) => `perspective(1000px) rotateY(${f * 180}deg)`) }}
          >
            <animated.div
              className="absolute inset-0 backface-hidden"
              style={
                tilt && {
                  transform: to(
                    [tilt.rx, tilt.ry],
                    (x, y) => `perspective(900px) rotateX(${x}deg) rotateY(${y}deg)`
                  ),
                }
              }
            >
              {layers.map((shot, layer) => {
                const { k, style } = placement(layer);
                return (
                  <div
                    key={shot.src}
                    className={`absolute inset-0 rounded-(--radius) p-(--pad) shadow-[0_1px_2px_rgb(0_0_0/.06),0_10px_24px_-12px_rgb(0_0_0/.28)] transition-transform duration-300 ease-[cubic-bezier(.2,.8,.2,1)] motion-reduce:transition-none dark:shadow-[0_1px_2px_rgb(0_0_0/.4),0_16px_32px_-12px_rgb(0_0_0/.7)] ${
                      FRAME[project.finish ?? "plain"]
                    } ${k > 0 ? "pointer-events-none" : ""}`}
                    style={style}
                  >
                    <div
                      className={`relative size-full overflow-hidden rounded-[calc(var(--radius)_-_var(--pad))] ${
                        project.finish === "silver" ? "ring-1 ring-[#C62127]" : ""
                      }`}
                    >
                      <Image
                        fill
                        src={shot.src}
                        alt=""
                        sizes="240px"
                        loading="eager"
                        draggable={false}
                        className="select-none object-cover"
                        style={{ objectPosition: shot.position ?? crop }}
                      />
                    </div>
                    <animated.span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 rounded-(--radius) bg-white/35 dark:bg-black/50"
                      style={{ opacity: dim }}
                    />
                  </div>
                );
              })}
            </animated.div>
            <div
              aria-hidden
              className="absolute inset-0 rounded-(--radius) bg-white p-(--pad) shadow-[0_1px_2px_rgb(0_0_0/.06),0_10px_24px_-12px_rgb(0_0_0/.28)] ring-1 ring-black/5 backface-hidden [transform:rotateY(180deg)] dark:bg-neutral-900 dark:shadow-[0_1px_2px_rgb(0_0_0/.4),0_16px_32px_-12px_rgb(0_0_0/.7)] dark:ring-white/10"
            >
              <div className="card-back grid size-full place-items-center rounded-[calc(var(--radius)_-_var(--pad))]">
                <span className="font-mono text-4xl font-bold text-white">d!</span>
              </div>
            </div>
          </animated.div>
        </div>
      </animated.button>
    </animated.div>
  );
}

export default HandCard;
