//
//  engine.ts
//  d-exclaimation
//
//  Plays a blueprint: sand gathers, parts form apart, they lock together, then it all returns to sand
//

import { Mesh, RAD, add, cross, dot, norm, scale, sub, type Vec3 } from "./mesh";
import {
  FAR,
  FLAME_FS,
  INK_FS,
  JET_VS,
  MAX_CUTS,
  MAX_JETS,
  MAX_SECTIONS,
  MESH_FS,
  MESH_VS,
  NEAR,
  QUAD_VS,
  SAND_FS,
  SAND_VS,
} from "./shaders";

export type Section = {
  /** Where the part hangs before it locks in. */
  offset: Vec3;
  /** Parts form and lock in ascending order. */
  rank: number;
  /** Radians per second it turns around the x axis once the construct is whole. */
  spin?: number;
  /** Radians it twists through as it locks in. */
  turn?: number;
  /** The [y, z] it turns around, the x axis if left out. */
  pivot?: [number, number];
  /** Radians it always sits turned by, for parts built upright and then leant over. */
  tilt?: number;
  /** Turns around z rather than x, with `pivot` as [x, y]. */
  upright?: boolean;
  /** Stays out of sight until the construct is whole, for parts that start out shut inside it. */
  late?: boolean;
  /** What it does on its own once the construct is whole, given the seconds since and how far `spin` has run. */
  idle?: (seconds: number, turned: number) => { offset?: Vec3; squash?: number; angle?: number; form?: number };
};

export type Blueprint = {
  mesh: Mesh;
  sections: Section[];
  /** Circles cut from marked surfaces, as [x, z, radius]. */
  cuts?: Vec3[];
  /** Nozzles that fire sand along `blast` when finished. */
  jets?: { nozzles: Vec3[]; blast: Vec3 };
  /** An afterburner lit once the construct is whole, from the nozzle exit at `x` along +x, with fire `bore` back up the nozzle. */
  flame?: { x: number; radius: number; length: number; bore: number };
  /** Returns to sand and builds again, rather than staying finished. */
  loop?: boolean;
  /** Where the viewer stands. How far back and where it looks are worked out from what is on screen. */
  camera: { yaw: number; pitch: number };
  /** Somewhere the camera can lean in to, as far as `amount` says from 0 to 1. */
  closeUp?: { focus: Vec3; width: number; height: number; yaw: number; pitch: number; amount: (t: number) => number };
  /** Parts that can be worked by hand. It's told where things landed on the canvas and says if a touch hit one. */
  press?: (x: number, y: number, project: (point: Vec3) => [number, number]) => boolean;
  /** Seconds: how parts are staggered, how long each forms, when they start locking, and how fast. */
  pace?: { spread: number; form: number; start: number; stagger: number; move: number };
  /** Direction the light falls from. */
  light?: Vec3;
  /** Pixels between hatch lines. */
  hatch: number;
  /** Grains of sand on a desktop screen. */
  grains?: number;
  /** How far the page is washed out to white, given the seconds since the construct was whole. */
  flash?: (seconds: number) => number;
  /** Told which of its things the page has picked, -1 for none. */
  pick?: (index: number) => void;
  /** Anything that moves out once the construct is whole and still has to fit on screen. */
  extent?: Vec3[];
  /** How far sand wanders, relative to the size of the construct. */
  flow: number;
};

export type Construct = {
  /** Builds it from bare paper, then leaves it running. */
  play: () => void;
  /** Stops drawing altogether and goes back to bare paper. */
  stop: () => void;
  /** Tells the blueprint which of its things is picked, -1 for none. */
  pick: (index: number) => void;
  /** Passes a touch on to the construct's own controls, saying whether it landed on one. */
  press: (x: number, y: number) => boolean;
  destroy: () => void;
};

type Program = { id: WebGLProgram; u: Record<string, WebGLUniformLocation> };
type Shot = { focus: Vec3; distance: number };

/** Seconds between planned camera positions. */
const BEAT = 1 / 20;
const LENS = Math.tan(10 * RAD);

const ease = (t: number) => t * t * (3 - 2 * t);
const clamp = (v: number) => Math.min(1, Math.max(0, v));
const snap = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const kick = (t: number) => 1 + 2.4 * Math.pow(t - 1, 3) + 1.4 * Math.pow(t - 1, 2);

/** Every construct draws through the same shaders, so each is only built once. */
const compiled = new WeakMap<WebGL2RenderingContext, Map<string, Program>>();

function compile(gl: WebGL2RenderingContext, vs: string, fs: string): Program {
  const known = compiled.get(gl) ?? new Map<string, Program>();
  compiled.set(gl, known);
  const built = known.get(vs + fs);
  if (built) return built;
  const stage = (type: number, source: string) => {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) ?? "Shader failed");
    return shader;
  };
  const id = gl.createProgram()!;
  gl.attachShader(id, stage(gl.VERTEX_SHADER, vs));
  gl.attachShader(id, stage(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(id);
  if (!gl.getProgramParameter(id, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(id) ?? "Link failed");
  const u: Program["u"] = {};
  const count = gl.getProgramParameter(id, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < count; i++) {
    const name = gl.getActiveUniform(id, i)!.name.replace("[0]", "");
    u[name] = gl.getUniformLocation(id, name)!;
  }
  known.set(vs + fs, { id, u });
  return { id, u };
}

function perspective(fovy: number, aspect: number, near: number, far: number, shiftX: number, shiftY: number) {
  const f = 1 / Math.tan(fovy / 2);
  const nf = 1 / (near - far);
  return [f / aspect, 0, 0, 0, 0, f, 0, 0, -shiftX, -shiftY, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0];
}

function lookAt(eye: Vec3, at: Vec3, up: Vec3) {
  const z = norm(sub(eye, at));
  const x = norm(cross(up, z));
  const y = cross(z, x);
  return [x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -dot(x, eye), -dot(y, eye), -dot(z, eye), 1];
}

function multiply(a: number[], b: number[]) {
  const out = new Float32Array(16);
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 4; r++) {
      out[c * 4 + r] = a[r] * b[c * 4] + a[r + 4] * b[c * 4 + 1] + a[r + 8] * b[c * 4 + 2] + a[r + 12] * b[c * 4 + 3];
    }
  }
  return out;
}

/** Scatters grains over the mesh by area, so sand lands evenly across every surface. */
function scatter(position: Float32Array, section: Float32Array, grains: number, lows: Float32Array, highs: Float32Array) {
  const triangles = position.length / 9;
  const sizes = new Float32Array(triangles);
  const surface = new Float32Array(MAX_SECTIONS);
  for (let i = 0; i < triangles; i++) {
    const o = i * 9;
    const ab: Vec3 = [position[o + 3] - position[o], position[o + 4] - position[o + 1], position[o + 5] - position[o + 2]];
    const ac: Vec3 = [position[o + 6] - position[o], position[o + 7] - position[o + 1], position[o + 8] - position[o + 2]];
    const n = cross(ab, ac);
    sizes[i] = Math.hypot(n[0], n[1], n[2]) / 2;
    surface[section[i * 3]] += sizes[i];
  }
  // A bladed part has far more surface than it shows, so it gets the sand of its outline rather than of every blade
  const worth = surface.map((area, id) => {
    const [x, y, z] = [0, 1, 2].map((c) => highs[id * 3 + c] - lows[id * 3 + c]);
    return area > 0 ? Math.min(1, Math.max(x * y, x * z, y * z) / area) : 0;
  });
  const areas = new Float32Array(triangles);
  let total = 0;
  for (let i = 0; i < triangles; i++) {
    total += sizes[i] * worth[section[i * 3]];
    areas[i] = total;
  }
  const target = new Float32Array(grains * 4);
  const seeds = new Float32Array(grains * 3);
  for (let g = 0; g < grains; g++) {
    const pick = Math.random() * total;
    let lo = 0;
    let hi = triangles - 1;
    while (lo < hi) {
      const m = (lo + hi) >> 1;
      if (areas[m] < pick) lo = m + 1;
      else hi = m;
    }
    const t = lo * 9;
    let u = Math.random();
    let v = Math.random();
    if (u + v > 1) {
      u = 1 - u;
      v = 1 - v;
    }
    const w = 1 - u - v;
    target[g * 4] = position[t] * w + position[t + 3] * u + position[t + 6] * v;
    target[g * 4 + 1] = position[t + 1] * w + position[t + 4] * u + position[t + 7] * v;
    target[g * 4 + 2] = position[t + 2] * w + position[t + 5] * u + position[t + 8] * v;
    target[g * 4 + 3] = section[lo * 3];
    seeds[g * 3] = Math.random();
    seeds[g * 3 + 1] = Math.random();
    seeds[g * 3 + 2] = Math.random();
  }
  return { target, seeds };
}

/** Draws onto the whole of `canvas`, keeping the construct inside `stage`, which has to share its positioned parent. */
export function mountConstruct(canvas: HTMLCanvasElement, stage: HTMLElement, blueprint: Blueprint): Construct {
  const gl = canvas.getContext("webgl2", {
    antialias: false,
    alpha: true,
    depth: false,
    powerPreference: "high-performance",
  });
  if (!gl) throw new Error("WebGL2 is unavailable");
  if (!gl.getExtension("EXT_color_buffer_float")) throw new Error("Float render targets are unavailable");

  const { mesh, sections, cuts = [], jets, flame, camera, loop = true } = blueprint;
  const pace = blueprint.pace ?? { spread: 2.3, form: 1.9, start: 4.7, stagger: 2.8, move: 0.6 };
  const light = norm(blueprint.light ?? [-0.3, -0.55, 0.78]);
  if (sections.length > MAX_SECTIONS) throw new Error(`Too many sections: ${sections.length}`);
  if (cuts.length > MAX_CUTS) throw new Error(`Too many cuts: ${cuts.length}`);
  if (jets && jets.nozzles.length > MAX_JETS) throw new Error(`Too many jets: ${jets.nozzles.length}`);

  const position = new Float32Array(mesh.positions);
  const normal = new Float32Array(mesh.normals);
  const section = new Float32Array(mesh.sections);
  const mark = new Float32Array(mesh.marks);
  const vertices = section.length;

  const core = new Float32Array(MAX_SECTIONS * 3);
  const tally = new Float32Array(MAX_SECTIONS);
  const lows = new Float32Array(MAX_SECTIONS * 3).fill(Infinity);
  const highs = new Float32Array(MAX_SECTIONS * 3).fill(-Infinity);
  for (let v = 0; v < vertices; v++) {
    const id = section[v];
    tally[id]++;
    for (let c = 0; c < 3; c++) {
      const value = position[v * 3 + c];
      core[id * 3 + c] += value;
      lows[id * 3 + c] = Math.min(lows[id * 3 + c], value);
      highs[id * 3 + c] = Math.max(highs[id * 3 + c], value);
    }
  }
  for (let id = 0; id < MAX_SECTIONS; id++) {
    for (let c = 0; c < 3; c++) core[id * 3 + c] /= tally[id] || 1;
  }

  const buffers: WebGLBuffer[] = [];
  const buffer = (data: Float32Array) => {
    const b = gl.createBuffer()!;
    buffers.push(b);
    gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    return b;
  };

  const meshVao = gl.createVertexArray();
  gl.bindVertexArray(meshVao);
  ([[position, 3], [normal, 3], [section, 1], [mark, 1]] as const).forEach(([data, size], i) => {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer(data));
    gl.enableVertexAttribArray(i);
    gl.vertexAttribPointer(i, size, gl.FLOAT, false, 0, 0);
  });

  const grains = Math.round((blueprint.grains ?? 960_000) * (window.innerWidth < 800 ? 0.375 : 1));
  const { target, seeds } = scatter(position, section, grains, lows, highs);
  const sandVao = gl.createVertexArray();
  gl.bindVertexArray(sandVao);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer(target));
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer(seeds));
  gl.enableVertexAttribArray(1);
  gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);
  const emptyVao = gl.createVertexArray();
  gl.bindVertexArray(null);

  const meshProgram = compile(gl, MESH_VS, MESH_FS);
  const inkProgram = compile(gl, QUAD_VS, INK_FS);
  const sandProgram = compile(gl, SAND_VS, SAND_FS);
  const jetProgram = compile(gl, JET_VS, SAND_FS);
  const flameProgram = compile(gl, QUAD_VS, FLAME_FS);

  // Parts form apart, lock in by rank, hold, then return to sand
  const ordered = [...sections].sort((a, b) => a.rank - b.rank);
  const times = new Map(
    ordered.map((s, i) => {
      const p = i / ordered.length;
      const moveAt = pace.start + p * pace.stagger;
      return [s, { formAt: 0.15 + p * pace.spread, moveAt, moveEnd: moveAt + pace.move, undoAt: 0 }];
    })
  );
  const locked = Math.max(...[...times.values()].map((t) => t.moveEnd));
  const undo = locked + 3.4;
  ordered.forEach((s, i) => {
    times.get(s)!.undoAt = undo + ((ordered.length - i) / ordered.length) * 0.5;
  });
  const end = loop ? undo + 2.3 : Infinity;

  const forms = new Float32Array(MAX_SECTIONS);
  const frees = new Float32Array(MAX_SECTIONS);
  const offsets = new Float32Array(MAX_SECTIONS * 3);
  const cutData = new Float32Array(MAX_CUTS * 3);
  cuts.forEach((c, i) => cutData.set(c, i * 3));
  const jetData = new Float32Array(MAX_JETS * 3);
  jets?.nozzles.forEach((n, i) => jetData.set(n, i * 3));
  const turns = new Float32Array(MAX_SECTIONS * 4);
  const mid = [0, 1, 2].map((c) => (Math.min(...lows.filter((_, i) => i % 3 === c)) + Math.max(...highs.filter((_, i) => i % 3 === c))) / 2) as Vec3;
  const yawAt = (t: number) => camera.yaw + 0.1 * Math.sin((Math.min(t, locked + 3.4) / (locked + 5.7)) * Math.PI * 2);
  const backAt = (t: number, leaning = 0): Vec3 => {
    const yaw = yawAt(t) + ((blueprint.closeUp?.yaw ?? 0) - yawAt(t)) * leaning;
    const pitch = camera.pitch + ((blueprint.closeUp?.pitch ?? 0) - camera.pitch) * leaning;
    return [Math.sin(yaw) * Math.cos(pitch), -Math.cos(yaw) * Math.cos(pitch), Math.sin(pitch)];
  };

  /** Every corner of what stands on screen at a moment: each part where it hangs then, and the flame once it is lit. */
  const cornersAt = (t: number) => {
    const points: Vec3[] = [];
    sections.forEach((s, i) => {
      const time = times.get(s)!;
      const rest = 1 - snap(clamp((t - time.moveAt) / pace.move));
      // Room for the sand still swirling around anything not locked in
      const swirl = 150 * blueprint.flow * rest;
      for (let c = 0; c < 8; c++) {
        points.push([
          (c & 1 ? lows[i * 3] - swirl : highs[i * 3] + swirl) + s.offset[0] * rest,
          (c & 2 ? lows[i * 3 + 1] - swirl : highs[i * 3 + 1] + swirl) + s.offset[1] * rest,
          (c & 4 ? lows[i * 3 + 2] - swirl : highs[i * 3 + 2] + swirl) + s.offset[2] * rest,
        ]);
      }
    });
    if (t >= locked) points.push(...(blueprint.extent ?? []));
    if (flame && t >= locked) {
      for (const [r, x] of [[flame.radius, flame.x], [flame.radius, flame.x + flame.length * 0.4], [flame.radius * 0.3, flame.x + flame.length]]) {
        for (const [y, z] of [[r, r], [r, -r], [-r, r], [-r, -r]]) points.push([x, y, z]);
      }
    }
    return points;
  };

  /** The closest shot that keeps all of it inside the stage, measured through the lens so the near end counts for more. */
  const frameAt = (t: number): Shot => {
    const back = backAt(t);
    const right = norm(cross([0, 0, 1], back));
    const up = cross(back, right);
    const points = cornersAt(t).map((p): Vec3 => [dot(p, right), dot(p, up), dot(p, back)]);
    const depth = points.reduce((sum, p) => sum + p[2], 0) / points.length;
    let across = (Math.min(...points.map((p) => p[0])) + Math.max(...points.map((p) => p[0]))) / 2;
    let along = (Math.min(...points.map((p) => p[1])) + Math.max(...points.map((p) => p[1]))) / 2;
    let distance = 0;
    for (let pass = 0; pass < 4; pass++) {
      distance = Math.max(...points.map((p) => p[2] - depth + Math.max(Math.abs(p[0] - across) / (LENS * wide), Math.abs(p[1] - along) / (LENS * tall))));
      const xs = points.map((p) => (p[0] - across) / (distance - (p[2] - depth)));
      const ys = points.map((p) => (p[1] - along) / (distance - (p[2] - depth)));
      across += ((Math.min(...xs) + Math.max(...xs)) / 2) * distance;
      along += ((Math.min(...ys) + Math.max(...ys)) / 2) * distance;
    }
    return { focus: add(add(scale(right, across), scale(up, along)), scale(back, depth)), distance };
  };

  /** How far back to stand to fit a moment while looking at `focus`, which may not be its centre. */
  const roomFor = (t: number, focus: Vec3) => {
    const back = backAt(t);
    const right = norm(cross([0, 0, 1], back));
    const up = cross(back, right);
    return Math.max(
      ...cornersAt(t).map((corner) => {
        const p = sub(corner, focus);
        return dot(p, back) + Math.max(Math.abs(dot(p, right)) / (LENS * wide), Math.abs(dot(p, up)) / (LENS * tall));
      })
    );
  };

  /** Plans the whole shot ahead of time. Room is widened by as much as it is then softened, so the camera never cuts anything off. */
  const plan = () => {
    const reach = 5;
    const soften = (values: number[]) => {
      let out = values;
      for (let pass = 0; pass < 2; pass++) {
        out = out.map((_, i) => {
          const near = out.slice(Math.max(0, i - reach), i + reach + 1);
          return near.reduce((sum, v) => sum + v, 0) / near.length;
        });
      }
      return out;
    };
    const raw = Array.from({ length: Math.ceil((locked + 1.6) / BEAT) + 1 }, (_, i) => frameAt(i * BEAT));
    const axes = [0, 1, 2].map((c) => soften(raw.map((s) => s.focus[c])));
    const focuses = raw.map((_, i): Vec3 => [axes[0][i], axes[1][i], axes[2][i]]);
    const room = focuses.map((focus, i) => roomFor(i * BEAT, focus));
    const distances = soften(room.map((_, i) => Math.max(...room.slice(Math.max(0, i - reach * 2), i + reach * 2 + 1))));
    return distances.map((distance, i): Shot => ({ focus: focuses[i], distance }));
  };

  let shots: Shot[] = [];
  const shotAt = (t: number): Shot => {
    const at = Math.min(t / BEAT, shots.length - 1);
    const a = shots[Math.floor(at)];
    const b = shots[Math.ceil(at)];
    const k = at - Math.floor(at);
    return { focus: add(a.focus, scale(sub(b.focus, a.focus), k)), distance: a.distance + (b.distance - a.distance) * k };
  };

  type Targets = {
    a: WebGLTexture;
    b: WebGLTexture;
    z: WebGLTexture;
    color: WebGLTexture;
    geometry: WebGLFramebuffer;
    flat: WebGLFramebuffer;
    final: WebGLFramebuffer;
  };
  let W = 0;
  let H = 0;
  let ratio = 1;
  // The stage in pixels, then its size against the canvas's height and its centre on the canvas from -1 to 1
  let box = [0, 0, 0, 0];
  let wide = 1;
  let tall = 1;
  let shiftX = 0;
  let shiftY = 0;
  let targets: Targets | null = null;
  let clock = 0;
  let turning = 0;
  let last = 0;
  let lens: ArrayLike<number> = [];
  let raf = 0;

  const texture = (internal: number, format: number, type: number, filter: number) => {
    const t = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, internal, W * ratio, H * ratio, 0, format, type, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  };

  const release = () => {
    if (!targets) return;
    [targets.a, targets.b, targets.z, targets.color].forEach((t) => gl.deleteTexture(t));
    [targets.geometry, targets.flat, targets.final].forEach((f) => gl.deleteFramebuffer(f));
    targets = null;
  };

  const fit = () => {
    const w = canvas.clientWidth || 1440;
    const h = canvas.clientHeight || 900;
    const r = Math.min(window.devicePixelRatio || 1, 2);
    const area = [stage.offsetLeft, stage.offsetTop, stage.offsetWidth || w, stage.offsetHeight || h];
    const resized = w !== W || h !== H || r !== ratio || area.some((value, i) => value !== box[i]);
    if (!resized && targets) return targets;
    W = w;
    H = h;
    ratio = r;
    box = area;
    wide = box[2] / H;
    tall = box[3] / H;
    shiftX = ((box[0] + box[2] / 2) / W) * 2 - 1;
    shiftY = 1 - ((box[1] + box[3] / 2) / H) * 2;
    if (resized) shots = plan();
    canvas.width = W * ratio;
    canvas.height = H * ratio;
    release();
    const a = texture(gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, gl.NEAREST);
    const b = texture(gl.RGBA16F, gl.RGBA, gl.HALF_FLOAT, gl.NEAREST);
    const z = texture(gl.DEPTH_COMPONENT24, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, gl.NEAREST);
    const color = texture(gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, gl.LINEAR);
    const geometry = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, geometry);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, a, 0);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, b, 0);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, z, 0);
    gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1]);
    const flat = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, flat);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, color, 0);
    const final = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, final);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, color, 0);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, z, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    targets = { a, b, z, color, geometry, flat, final };
    return targets;
  };

  const render = (t: number) => {
    const rt = fit();
    const near = blueprint.closeUp;
    const leaning = near?.amount(t) ?? 0;
    const shot = shotAt(t);
    const focus = near ? add(shot.focus, scale(sub(near.focus, shot.focus), leaning)) : shot.focus;
    const closest = near ? Math.max(near.width / (2 * LENS * wide), near.height / (2 * LENS * tall)) : shot.distance;
    const distance = shot.distance + (closest - shot.distance) * leaning;
    const back = backAt(t, leaning);
    const right = norm(cross([0, 0, 1], back));
    const up = cross(back, right);
    const eye = add(focus, scale(back, distance));
    sections.forEach((s, i) => {
      const time = times.get(s)!;
      let form = ease(clamp((t - time.formAt) / pace.form)) * 1.02;
      if (loop && t > time.undoAt) form *= 1 - ease(clamp((t - time.undoAt) / 1.3));
      forms[i] = form;
      frees[i] = clamp((t - time.moveEnd + 0.15) / 0.8);
      const rest = 1 - snap(clamp((t - time.moveAt) / pace.move));
      const hang = scale(s.offset, rest);
      const pose = turning > 0 ? s.idle?.(Math.max(0, t - locked), turning) : undefined;
      if (pose?.form !== undefined) forms[i] = pose.form;
      if (s.late && t < locked) forms[i] = 0;
      offsets.set(add(hang, pose?.offset ?? [0, 0, 0]), i * 3);
      const angle = (s.tilt ?? 0) + turning * (s.spin ?? 0) + rest * (s.turn ?? 0) + (pose?.angle ?? 0);
      turns.set([angle, s.pivot?.[0] ?? 0, s.pivot?.[1] ?? 0, s.upright ? -1 : (pose?.squash ?? 1)], i * 4);
    });

    const viewProjection = multiply(perspective(20 * RAD, W / H, NEAR, FAR, shiftX, shiftY), lookAt(eye, focus, [0, 0, 1]));
    lens = viewProjection;

    gl.viewport(0, 0, W * ratio, H * ratio);
    gl.bindFramebuffer(gl.FRAMEBUFFER, rt.geometry);
    gl.clearColor(0, 0, 0, 0);
    gl.depthMask(true);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.disable(gl.BLEND);
    gl.useProgram(meshProgram.id);
    gl.uniformMatrix4fv(meshProgram.u.uVP, false, viewProjection);
    gl.uniform3fv(meshProgram.u.uOff, offsets);
    gl.uniform1fv(meshProgram.u.uForm, forms);
    gl.uniform3fv(meshProgram.u.uEye, eye);
    gl.uniform3fv(meshProgram.u.uCuts, cutData);
    gl.uniform1i(meshProgram.u.uCutCount, cuts.length);
    gl.uniform4fv(meshProgram.u.uTurn, turns);
    gl.bindVertexArray(meshVao);
    gl.drawArrays(gl.TRIANGLES, 0, vertices);

    gl.bindFramebuffer(gl.FRAMEBUFFER, rt.flat);
    gl.disable(gl.DEPTH_TEST);
    gl.depthMask(false);
    gl.useProgram(inkProgram.id);
    [rt.a, rt.b, rt.z].forEach((tex, i) => {
      gl.activeTexture(gl.TEXTURE0 + i);
      gl.bindTexture(gl.TEXTURE_2D, tex);
    });
    gl.uniform1i(inkProgram.u.uA, 0);
    gl.uniform1i(inkProgram.u.uB, 1);
    gl.uniform1i(inkProgram.u.uZ, 2);
    gl.uniform2f(inkProgram.u.uPx, 1 / (W * ratio), 1 / (H * ratio));
    gl.uniform1f(inkProgram.u.uLine, 1.1 * ratio);
    gl.uniform1f(inkProgram.u.uHatch, blueprint.hatch * ratio);
    gl.uniform3fv(inkProgram.u.uLight, light);
    const fire = flame ? ease(clamp((t - locked + 0.05) / 0.2)) : 0;
    const flash = flame ? Math.exp(-Math.pow((t - locked - 0.16) / 0.11, 2)) : 0;
    gl.uniform4f(inkProgram.u.uFire, flame?.x ?? 0, flame?.radius ?? 1, flash, fire);
    gl.uniform1f(inkProgram.u.uWash, t > locked ? (blueprint.flash?.(t - locked) ?? 0) : 0);
    gl.bindVertexArray(emptyVao);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    for (let i = 0; i < 3; i++) {
      gl.activeTexture(gl.TEXTURE0 + i);
      gl.bindTexture(gl.TEXTURE_2D, null);
    }

    if (flame && fire > 0) {
      const aspect = W / H;
      const lens = LENS;
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.useProgram(flameProgram.id);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, rt.z);
      gl.uniform1i(flameProgram.u.uZ, 0);
      gl.uniform3fv(flameProgram.u.uEye, eye);
      gl.uniform3fv(flameProgram.u.uFwd, [-back[0], -back[1], -back[2]]);
      gl.uniform3f(flameProgram.u.uRight, right[0] * lens * aspect, right[1] * lens * aspect, right[2] * lens * aspect);
      gl.uniform3f(flameProgram.u.uUp, up[0] * lens, up[1] * lens, up[2] * lens);
      gl.uniform2f(flameProgram.u.uShift, shiftX, shiftY);
      gl.uniform1f(flameProgram.u.uExit, flame.x);
      gl.uniform1f(flameProgram.u.uRadius, flame.radius);
      gl.uniform1f(flameProgram.u.uLength, flame.length);
      gl.uniform1f(flameProgram.u.uBore, flame.bore);
      gl.uniform1f(flameProgram.u.uFire, fire);
      gl.uniform1f(flameProgram.u.uFlash, flash);
      gl.uniform1f(flameProgram.u.uReach, kick(clamp((t - locked - 0.12) / 0.5)));
      gl.uniform1f(flameProgram.u.uShock, clamp((t - locked - 0.25) / 0.75));
      gl.uniform1f(flameProgram.u.uTime, t);
      gl.bindVertexArray(emptyVao);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.bindTexture(gl.TEXTURE_2D, null);
      gl.disable(gl.BLEND);
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, rt.final);
    gl.enable(gl.DEPTH_TEST);
    gl.useProgram(sandProgram.id);
    gl.uniformMatrix4fv(sandProgram.u.uVP, false, viewProjection);
    gl.uniform3fv(sandProgram.u.uOff, offsets);
    gl.uniform3fv(sandProgram.u.uCore, core);
    gl.uniform1fv(sandProgram.u.uForm, forms);
    gl.uniform1fv(sandProgram.u.uFree, frees);
    gl.uniform1f(sandProgram.u.uTime, t);
    gl.uniform1f(sandProgram.u.uSize, 1.5 * ratio);
    gl.uniform1f(sandProgram.u.uFlow, blueprint.flow);
    gl.uniform3fv(sandProgram.u.uMid, mid);
    gl.bindVertexArray(sandVao);
    gl.drawArrays(gl.POINTS, 0, grains);

    if (jets) {
      const power = clamp((t - locked - 0.3) / 0.4) * (1 - clamp((t - undo + 0.9) / 0.6));
      if (power > 0) {
        gl.useProgram(jetProgram.id);
        gl.uniformMatrix4fv(jetProgram.u.uVP, false, viewProjection);
        gl.uniform3fv(jetProgram.u.uNozzles, jetData);
        gl.uniform1i(jetProgram.u.uNozzleCount, jets.nozzles.length);
        gl.uniform3fv(jetProgram.u.uDirection, jets.blast);
        gl.uniform1f(jetProgram.u.uTime, t);
        gl.uniform1f(jetProgram.u.uPower, power);
        gl.uniform1f(jetProgram.u.uSize, 1.5 * ratio);
        gl.bindVertexArray(emptyVao);
        gl.drawArrays(gl.POINTS, 0, 42_000);
      }
    }
    gl.bindVertexArray(null);

    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, rt.final);
    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);
    gl.blitFramebuffer(0, 0, W * ratio, H * ratio, 0, 0, W * ratio, H * ratio, gl.COLOR_BUFFER_BIT, gl.NEAREST);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  };

  const step = (seconds: number) => {
    clock += seconds;
    if (clock >= end) {
      clock = 0;
      turning = 0;
    }
    turning += seconds * clamp((clock - locked + 0.4) / 1.4);
    render(clock);
  };

  const tick = (now: number) => {
    raf = requestAnimationFrame(tick);
    const delta = Math.min((now - last) / 1000, 1 / 20);
    last = now;
    step(delta);
  };

  const stop = () => {
    cancelAnimationFrame(raf);
    // The canvas is shared, so only wipe it if this was the one drawing
    if (!targets) return;
    release();
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
  };

  const play = () => {
    stop();
    clock = 0;
    turning = 0;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      render(locked + 0.1);
      return;
    }
    raf = requestAnimationFrame((now) => {
      last = now;
      raf = requestAnimationFrame(tick);
    });
  };

  /** Where a point in the construct lands on the canvas right now, in pixels from its top left. */
  const project = ([x, y, z]: Vec3): [number, number] => {
    const m = lens;
    const w = m[3] * x + m[7] * y + m[11] * z + m[15];
    return [((m[0] * x + m[4] * y + m[8] * z + m[12]) / w / 2 + 0.5) * W, (0.5 - (m[1] * x + m[5] * y + m[9] * z + m[13]) / w / 2) * H];
  };

  return {
    play,
    stop,
    pick: (index) => blueprint.pick?.(index),
    press: (x, y) => blueprint.press?.(x, y, project) ?? false,
    destroy: () => {
      stop();
      buffers.forEach((b) => gl.deleteBuffer(b));
    },
  };
}
