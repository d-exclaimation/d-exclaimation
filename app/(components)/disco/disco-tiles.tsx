"use client";

//
//  disco-tiles.tsx
//  d-exclaimation
//
//  Full-screen disco tile backdrop that fades away from the top of the page
//

import { useEffect, useRef } from "react";
import { currentGlowRamps } from "@/(common)/glow";
import { drawTiles, fitCanvas } from "./field";

function DiscoTiles() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const dark = window.matchMedia("(prefers-color-scheme: dark)");

    const draw = () => {
      const size = fitCanvas(canvas);
      const reach = Math.max(480, size.h * 0.7);
      const ramps = currentGlowRamps(new Date(), dark.matches);
      drawTiles(ctx, size, { x: size.w / 2, y: 0 }, reach, ramps, {
        strength: dark.matches ? 0.8 : 0.45,
      });
    };

    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(canvas);
    dark.addEventListener("change", draw);
    return () => {
      observer.disconnect();
      dark.removeEventListener("change", draw);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
    />
  );
}

export default DiscoTiles;
