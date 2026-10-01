//
//  glow.ts
//  d-exclaimation
//
//  Colour pairs for the profile picture glow, shared with the disco tiles
//

/** A colour ramp from darkest to lightest (Tailwind 900, 600, 400, 200, 50). */
export type Ramp = number[][];

const ramps = {
  fuchsia: [[112, 26, 117], [192, 38, 211], [232, 121, 249], [245, 208, 254], [253, 244, 255]],
  blue: [[30, 58, 138], [37, 99, 235], [96, 165, 250], [191, 219, 254], [239, 246, 255]],
  orange: [[124, 45, 18], [234, 88, 12], [251, 146, 60], [254, 215, 170], [255, 247, 237]],
  lime: [[54, 83, 20], [101, 163, 13], [163, 230, 53], [217, 249, 157], [247, 254, 231]],
  purple: [[88, 28, 135], [147, 51, 234], [192, 132, 252], [233, 213, 255], [250, 245, 255]],
  emerald: [[6, 78, 59], [5, 150, 105], [52, 211, 153], [167, 243, 208], [236, 253, 245]],
} satisfies Record<string, Ramp>;

/** Glow pairs, rotated by day of the week. Dark mode always uses `dark`. */
const glows = [
  { left: "bg-fuchsia-400/75", right: "bg-blue-400/75", ramps: [ramps.fuchsia, ramps.blue] },
  { left: "bg-orange-400/75", right: "bg-lime-400/75", ramps: [ramps.orange, ramps.lime] },
  { left: "bg-purple-400/75", right: "bg-emerald-400/75", ramps: [ramps.purple, ramps.emerald] },
] as const;

export const darkGlow = { ramps: [ramps.orange, ramps.lime] } as const;

/** Today's glow pair. */
export const glowOf = (date: Date) => glows[date.getDay() % 3];

/** The glow pair currently on screen, accounting for dark mode. */
export const currentGlowRamps = (date: Date, dark: boolean): readonly [Ramp, Ramp] =>
  dark ? darkGlow.ramps : glowOf(date).ramps;
