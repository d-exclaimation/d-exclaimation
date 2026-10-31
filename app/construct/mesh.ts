//
//  mesh.ts
//  d-exclaimation
//
//  Geometry builders for constructs, every triangle tagged with the component it belongs to
//

export type Vec3 = [number, number, number];
export type Flat = [number, number];

export const TAU = Math.PI * 2;
export const RAD = Math.PI / 180;

export const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const scale = (a: Vec3, k: number): Vec3 => [a[0] * k, a[1] * k, a[2] * k];
export const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
export const norm = (v: Vec3): Vec3 => scale(v, 1 / (Math.hypot(v[0], v[1], v[2]) || 1));

/** A local axis for turned parts: `at(radius, along, angle)` gives a point around it. */
export type Axis = { origin: Vec3; along: Vec3; u: Vec3; v: Vec3 };

export function axis(origin: Vec3, along: Vec3): Axis {
  const a = norm(along);
  const help: Vec3 = Math.abs(a[2]) > 0.9 ? [1, 0, 0] : [0, 0, 1];
  const u = norm(cross(a, help));
  return { origin, along: a, u, v: cross(a, u) };
}

/** A rounded rectangle centred on the origin, walked all the way around. */
export function rounded(w: number, h: number, r: number, steps = 8): Flat[] {
  const corners: Flat[] = [
    [w / 2 - r, h / 2 - r],
    [r - w / 2, h / 2 - r],
    [r - w / 2, r - h / 2],
    [w / 2 - r, r - h / 2],
  ];
  return corners.flatMap(([x, y], q) =>
    Array.from({ length: steps + 1 }, (_, i): Flat => {
      const a = ((q + i / steps) * TAU) / 4;
      return [x + r * Math.cos(a), y + r * Math.sin(a)];
    })
  );
}

/** A circle with teeth cut around it, for knurled dials and gears. */
export const ridged = (r: number, depth: number, teeth: number) =>
  Array.from({ length: teeth * 2 }, (_, i): Flat => {
    const a = (i / (teeth * 2)) * TAU;
    const q = i % 2 === 0 ? r : r - depth;
    return [q * Math.cos(a), q * Math.sin(a)];
  });

const around = (f: Axis, r: number, x: number, t: number): Vec3 =>
  add(add(f.origin, scale(f.along, x)), add(scale(f.u, Math.cos(t) * r), scale(f.v, Math.sin(t) * r)));

const radial = (f: Axis, t: number): Vec3 => add(scale(f.u, Math.cos(t)), scale(f.v, Math.sin(t)));

export class Mesh {
  positions: number[] = [];
  normals: number[] = [];
  sections: number[] = [];
  marks: number[] = [];
  /** Component the next triangles belong to. */
  section = 0;
  /** Solid black, rather than paper with hatching. */
  ink = false;
  /** Cut by the blueprint's wheel arches. */
  cut = false;
  /** A thin sheet, drawn as paper from both sides rather than a dark cavity. */
  thin = false;
  /** A colour from the palette rather than paper, counted from 1. */
  paint = 0;

  private vertex(p: Vec3, n: Vec3) {
    this.positions.push(p[0], p[1], p[2]);
    this.normals.push(n[0], n[1], n[2]);
    this.sections.push(this.section);
    this.marks.push((this.ink ? 1 : 0) + (this.cut ? 2 : 0) + (this.thin ? 4 : 0) + this.paint * 8);
  }

  quad(a: Vec3, b: Vec3, c: Vec3, d: Vec3, na: Vec3, nb = na, nc = na, nd = na) {
    this.vertex(a, na);
    this.vertex(b, nb);
    this.vertex(c, nc);
    this.vertex(a, na);
    this.vertex(c, nc);
    this.vertex(d, nd);
  }

  /** A turned part from [radius, along] pairs, walking outward, along the outside, then back in. */
  lathe(f: Axis, profile: [number, number][], segments = 64) {
    for (let k = 0; k < profile.length - 1; k++) {
      const [r0, x0] = profile[k];
      const [r1, x1] = profile[k + 1];
      const l = Math.hypot(x1 - x0, r1 - r0) || 1;
      const nx = -(r1 - r0) / l;
      const nr = (x1 - x0) / l;
      for (let j = 0; j < segments; j++) {
        const a = (j / segments) * TAU;
        const b = ((j + 1) / segments) * TAU;
        const na = add(scale(f.along, nx), scale(radial(f, a), nr));
        const nb = add(scale(f.along, nx), scale(radial(f, b), nr));
        this.quad(around(f, r0, x0, a), around(f, r1, x1, a), around(f, r1, x1, b), around(f, r0, x0, b), na, na, nb, nb);
      }
    }
  }

  /** A flat disc closing the end of a turned part. */
  disc(f: Axis, r: number, x: number, facing: 1 | -1, segments = 32) {
    const n = scale(f.along, facing);
    for (let j = 0; j < segments; j++) {
      const a = (j / segments) * TAU;
      const b = ((j + 1) / segments) * TAU;
      this.quad(around(f, 0, x, a), around(f, r, x, a), around(f, r, x, b), around(f, 0, x, b), n);
    }
  }

  /** A block from its centre and three half-extent vectors. */
  block(c: Vec3, x: Vec3, y: Vec3, z: Vec3) {
    const P = (i: number, j: number, k: number) => add(c, add(add(scale(x, i), scale(y, j)), scale(z, k)));
    const nx = norm(x);
    const ny = norm(y);
    const nz = norm(z);
    this.quad(P(1, -1, -1), P(1, 1, -1), P(1, 1, 1), P(1, -1, 1), nx);
    this.quad(P(-1, -1, -1), P(-1, 1, -1), P(-1, 1, 1), P(-1, -1, 1), scale(nx, -1));
    this.quad(P(-1, 1, -1), P(1, 1, -1), P(1, 1, 1), P(-1, 1, 1), ny);
    this.quad(P(-1, -1, -1), P(1, -1, -1), P(1, -1, 1), P(-1, -1, 1), scale(ny, -1));
    this.quad(P(-1, -1, 1), P(1, -1, 1), P(1, 1, 1), P(-1, 1, 1), nz);
    this.quad(P(-1, -1, -1), P(1, -1, -1), P(1, 1, -1), P(-1, 1, -1), scale(nz, -1));
  }

  /** An axis-aligned box from its low corner and size. */
  box(x: number, y: number, z: number, w: number, d: number, h: number) {
    this.block([x + w / 2, y + d / 2, z + h / 2], [w / 2, 0, 0], [0, d / 2, 0], [0, 0, h / 2]);
  }

  tube(points: Vec3[], radius: number, segments = 12) {
    const rings = points.map((p, i) => {
      const t = norm(sub(points[Math.min(points.length - 1, i + 1)], points[Math.max(0, i - 1)]));
      const f = axis(p, t);
      return Array.from({ length: segments + 1 }, (_, j) => {
        const a = (j / segments) * TAU;
        return { p: around(f, radius, 0, a), n: radial(f, a) };
      });
    });
    for (let i = 0; i < rings.length - 1; i++) {
      for (let j = 0; j < segments; j++) {
        const [a, b, c, d] = [rings[i][j], rings[i + 1][j], rings[i + 1][j + 1], rings[i][j + 1]];
        this.quad(a.p, b.p, c.p, d.p, a.n, b.n, c.n, d.n);
      }
    }
  }

  /** A spring wound around an axis. */
  coil(f: Axis, r: number, length: number, turns: number, wire: number) {
    const steps = turns * 18;
    this.tube(
      Array.from({ length: steps + 1 }, (_, i) => around(f, r, (i / steps) * length, (i / steps) * turns * TAU)),
      wire,
      6
    );
  }

  /** A flat polygon, fanned from its centre. */
  fan(points: Vec3[], normal: Vec3) {
    const c = scale(points.reduce(add, [0, 0, 0] as Vec3), 1 / points.length);
    for (let i = 0; i < points.length; i++) {
      this.quad(c, c, points[i], points[(i + 1) % points.length], normal);
    }
  }

  /** A sheet of the same section along an axis, capped at both ends if it closes. Gentle bends stay smooth and sharp ones crease. */
  prism(f: Axis, edge: Flat[], length: number, closed = true) {
    const at = ([a, b]: Flat, x: number): Vec3 => add(add(f.origin, scale(f.along, x)), add(scale(f.u, a), scale(f.v, b)));
    const count = edge.length;
    const facing = edge.map((p, i) => norm(cross(sub(at(edge[(i + 1) % count], 0), at(p, 0)), f.along)));
    const blend = (a: Vec3, b: Vec3) => (dot(a, b) > 0.8 ? norm(add(a, b)) : a);
    const thin = this.thin;
    this.thin = true;
    for (let i = 0; i < (closed ? count : count - 1); i++) {
      const j = (i + 1) % count;
      const na = blend(facing[i], facing[(i + count - 1) % count]);
      const nb = blend(facing[i], facing[j]);
      this.quad(at(edge[i], 0), at(edge[j], 0), at(edge[j], length), at(edge[i], length), na, nb, nb, na);
    }
    if (closed) {
      this.fan(edge.map((p) => at(p, 0)), scale(f.along, -1));
      this.fan(edge.map((p) => at(p, length)), f.along);
    }
    this.thin = thin;
  }

  /** A smooth skin over a grid of points, with normals taken from the grid itself. */
  skin(grid: Vec3[][]) {
    const I = grid.length - 1;
    const J = grid[0].length - 1;
    const normal = (i: number, j: number) => {
      const di = sub(grid[Math.min(I, i + 1)][j], grid[Math.max(0, i - 1)][j]);
      const dj = sub(grid[i][Math.min(J, j + 1)], grid[i][Math.max(0, j - 1)]);
      return norm(cross(di, dj));
    };
    for (let i = 0; i < I; i++) {
      for (let j = 0; j < J; j++) {
        this.quad(grid[i][j], grid[i + 1][j], grid[i + 1][j + 1], grid[i][j + 1], normal(i, j), normal(i + 1, j), normal(i + 1, j + 1), normal(i, j + 1));
      }
    }
  }
}
