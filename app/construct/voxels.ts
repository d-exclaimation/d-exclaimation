//
//  voxels.ts
//  d-exclaimation
//
//  Turns voxels exported from a game into construct geometry, so its scenes build like anything else here
//

import { add, type Mesh, type Vec3 } from "./mesh";

/** A game's world uses y for up, in metres. */
export type Placement = {
  /** Metres per voxel. */
  size: number;
  /** The point in the model's own voxels that it stands from. */
  anchor: readonly number[];
  /** Metres in the game's world. */
  at: [number, number];
  /** Radians it's turned around the game's up axis. */
  yaw: number;
};

/** The six faces of a voxel from its low corner, each with the bit that says it's open. */
const FACES: { normal: Vec3; corners: [Vec3, Vec3, Vec3, Vec3] }[] = [
  { normal: [1, 0, 0], corners: [[1, 0, 0], [1, 1, 0], [1, 1, 1], [1, 0, 1]] },
  { normal: [-1, 0, 0], corners: [[0, 0, 0], [0, 1, 0], [0, 1, 1], [0, 0, 1]] },
  { normal: [0, 1, 0], corners: [[0, 1, 0], [1, 1, 0], [1, 1, 1], [0, 1, 1]] },
  { normal: [0, -1, 0], corners: [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]] },
  { normal: [0, 0, 1], corners: [[0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]] },
  { normal: [0, 0, -1], corners: [[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0]] },
];

/** Roughly how bright a colour reads, from 0 to 1. */
export const brightness = (hex: number) =>
  (0.2126 * ((hex >> 16) & 255) + 0.7152 * ((hex >> 8) & 255) + 0.0722 * (hex & 255)) / 255;

/** Eyes shut for a moment every few seconds, each pair on its own time. */
export const blink = (seconds: number, lag: number) => {
  const shut = (seconds + lag) % 4.2;
  return shut < 0.16 ? Math.max(0.08, Math.abs(shut - 0.08) / 0.08) : 1;
};

/**
 * Adds one exported group to the mesh, from the game's axes to a construct's, and returns the middle of it.
 * @param M The mesh, with its section already chosen
 * @param data The group, as packed by the export
 * @param palette The colours its voxels index into
 * @param place Where the model stands
 * @param units Construct units per metre
 * @param ink Whether a colour is drawn solid black rather than paper
 */
export function addVoxels(
  M: Mesh,
  data: string,
  palette: readonly number[],
  { size, anchor, at, yaw }: Placement,
  units: number,
  ink: (hex: number) => boolean
): Vec3 {
  const bytes = Uint8Array.from(atob(data), (c) => c.charCodeAt(0));
  const c = Math.cos(yaw);
  const s = Math.sin(yaw);
  // Turned in the game's world, then its y up and z towards the viewer become a construct's z up and -y
  const turn = ([x, y, z]: Vec3): Vec3 => [x * c + z * s, -(z * c - x * s), y];
  const put = (p: Vec3): Vec3 => {
    const [x, y, z] = turn([(p[0] - anchor[0]) * size, (p[1] - anchor[1]) * size, (p[2] - anchor[2]) * size]);
    return [(x + at[0]) * units, (y - at[1]) * units, z * units];
  };
  let middle: Vec3 = [0, 0, 0];
  for (let i = 0; i < bytes.length; i += 5) {
    const voxel: Vec3 = [bytes[i] - 128, bytes[i + 1] - 128, bytes[i + 2] - 128];
    const mask = bytes[i + 4];
    M.ink = ink(palette[bytes[i + 3]]);
    FACES.forEach(({ normal, corners }, face) => {
      if (!(mask & (1 << face))) return;
      const [a, b, d, e] = corners.map((corner) => put(add(voxel, corner)));
      M.quad(a, b, d, e, turn(normal));
    });
    middle = add(middle, put(voxel));
  }
  const count = bytes.length / 5 || 1;
  return [middle[0] / count, middle[1] / count, middle[2] / count];
}
