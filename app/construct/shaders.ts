//
//  shaders.ts
//  d-exclaimation
//
//  Sand, surfaces, and the ink pass that draws them
//

/** Most components a single construct can have. */
export const MAX_SECTIONS = 96;
/** Most arches a body can have cut out of it. */
export const MAX_CUTS = 4;
/** Most nozzles that can fire sand. */
export const MAX_JETS = 8;
/** Closest the camera sees. */
export const NEAR = 200;
/** Furthest the camera sees, which has to clear a long construct framed on a narrow phone. */
export const FAR = 40000;

const PAPER = "0.957, 0.953, 0.937";
const INK = "0.078, 0.078, 0.078";

const NOISE = /* glsl */ `
float hash(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}
float vnoise(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash(i), hash(i + vec3(1, 0, 0)), f.x), mix(hash(i + vec3(0, 1, 0)), hash(i + vec3(1, 1, 0)), f.x), f.y),
    mix(mix(hash(i + vec3(0, 0, 1)), hash(i + vec3(1, 0, 1)), f.x), mix(hash(i + vec3(0, 1, 1)), hash(i + vec3(1, 1, 1)), f.x), f.y),
    f.z
  );
}
// The order a surface materialises in. Sand and skin share it, so grains land exactly where the part appears.
float grow(vec3 p) {
  float n = vnoise(p * 0.016) * 0.6 + vnoise(p * 0.06) * 0.27 + vnoise(p * 0.21) * 0.13;
  return 0.05 + clamp((n - 0.2) / 0.6, 0.0, 1.0) * 0.95;
}`;

export const MESH_VS = /* glsl */ `#version 300 es
precision highp float;
layout(location = 0) in vec3 aPos;
layout(location = 1) in vec3 aNrm;
layout(location = 2) in float aSec;
layout(location = 3) in float aMark;
uniform mat4 uVP;
uniform vec3 uOff[${MAX_SECTIONS}];
uniform vec4 uTurn[${MAX_SECTIONS}];
out vec3 vL;
out vec3 vN;
out vec3 vW;
out float vMark;
flat out int vS;
void main() {
  int s = int(aSec + 0.5);
  vec3 p = aPos;
  vec3 n = aNrm;
  vL = aPos;
  // Turned by x around the point yz and squashed by w on the way, or around z instead of x if w is negative
  vec4 turn = uTurn[s];
  if (turn.x != 0.0 || abs(turn.w) != 1.0) {
    float c = cos(turn.x);
    float q = sin(turn.x);
    if (turn.w < 0.0) {
      vec2 r = p.xy - turn.yz;
      p.xy = turn.yz + vec2(c * r.x - q * r.y, q * r.x + c * r.y);
      n.xy = vec2(c * n.x - q * n.y, q * n.x + c * n.y);
    } else {
      vec2 r = (p.yz - turn.yz) * vec2(1.0, turn.w);
      p.yz = turn.yz + vec2(c * r.x - q * r.y, q * r.x + c * r.y);
      n.yz = vec2(c * n.y - q * n.z, q * n.y + c * n.z);
    }
  }
  p += uOff[s];
  vW = p;
  vN = n;
  vS = s;
  vMark = aMark;
  gl_Position = uVP * vec4(p, 1.0);
}`;

export const MESH_FS = /* glsl */ `#version 300 es
precision highp float;
in vec3 vL;
in vec3 vN;
in vec3 vW;
in float vMark;
flat in int vS;
uniform float uForm[${MAX_SECTIONS}];
uniform vec3 uCuts[${MAX_CUTS}];
uniform int uCutCount;
uniform vec3 uEye;
layout(location = 0) out vec4 o0;
layout(location = 1) out vec4 o1;
${NOISE}
void main() {
  float g = uForm[vS] < 1.0 ? grow(vL) : 0.0;
  if (g > uForm[vS]) discard;
  int mark = int(vMark + 0.5);
  // Ink soaks in just behind the surface, and insides only go black once a part is whole
  bool soaked = uForm[vS] >= g * 0.7 + 0.3;
  float ink = (mark & 1) != 0 && soaked ? 1.0 : 0.0;
  if ((mark & 2) != 0) {
    for (int i = 0; i < uCutCount; i++) {
      if (length(vL.xz - uCuts[i].xy) < uCuts[i].z) discard;
    }
  }
  vec3 n = normalize(vN);
  bool back = dot(n, normalize(uEye - vW)) < 0.0;
  if (back) n = -n;
  if (back && (mark & 4) == 0 && uForm[vS] >= 1.0) ink = 1.0;
  o0 = vec4(n * 0.5 + 0.5, float(vS + 1) / 255.0);
  o1 = vec4(vL, (mark >> 3) > 0 && soaked ? float(mark >> 3) + 1.0 : ink);
}`;

export const QUAD_VS = /* glsl */ `#version 300 es
precision highp float;
out vec2 vUv;
void main() {
  vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  vUv = p;
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

// Turns the geometry buffers into ink: wobbling contour lines, form-following hatching, solid black recesses
export const INK_FS = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uA;
uniform sampler2D uB;
uniform sampler2D uZ;
uniform vec2 uPx;
uniform float uLine;
uniform float uHatch;
uniform vec3 uLight;
uniform vec4 uFire;
uniform float uWash;
out vec4 color;
${NOISE}
float lin(float z) {
  float n = ${NEAR.toFixed(1)};
  float f = ${FAR.toFixed(1)};
  return (2.0 * n * f) / (f + n - (2.0 * z - 1.0) * (f - n));
}
void main() {
  // Most of the page is bare, so leave before doing any work if nothing is close enough to draw
  float near = texture(uA, vUv).a;
  for (float r = 0.7; r < 1.5; r += 0.7) {
    vec2 q = uPx * uLine * r;
    near += texture(uA, vUv + vec2(q.x, 0.0)).a + texture(uA, vUv - vec2(q.x, 0.0)).a;
    near += texture(uA, vUv + vec2(0.0, q.y)).a + texture(uA, vUv - vec2(0.0, q.y)).a;
  }
  if (near == 0.0) {
    color = vec4(uWash);
    return;
  }
  vec2 wob = vec2(vnoise(vec3(vUv * 110.0, 1.0)), vnoise(vec3(vUv * 110.0, 7.0))) - 0.5;
  vec2 uv = vUv + wob * uPx * uLine * 0.7;
  vec4 a = texture(uA, uv);
  vec4 b = texture(uB, uv);
  float z = lin(texture(uZ, uv).r);
  bool solid = a.a > 0.001;
  vec3 n = a.xyz * 2.0 - 1.0;

  float edge = 0.0;
  vec2 dirs[4] = vec2[4](vec2(1, 0), vec2(-1, 0), vec2(0, 1), vec2(0, -1));
  for (int i = 0; i < 4; i++) {
    vec2 q = uv + dirs[i] * uPx * uLine;
    vec4 c = texture(uA, q);
    if (abs(c.a - a.a) > 0.001) edge = 1.0;
    if (solid && c.a > 0.001) {
      vec3 m = c.xyz * 2.0 - 1.0;
      if (dot(m, n) < 0.8) edge = 1.0;
    }
  }
  if (solid) {
    // Whole pixels either side, or uneven rounding makes any slope read as a crease
    vec2 mid = (floor(uv / uPx) + 0.5) * uPx;
    vec2 step = uPx * floor(uLine + 0.5);
    float here = 2.0 * lin(texture(uZ, mid).r);
    float zx = lin(texture(uZ, mid + vec2(step.x, 0.0)).r) + lin(texture(uZ, mid - vec2(step.x, 0.0)).r) - here;
    float zy = lin(texture(uZ, mid + vec2(0.0, step.y)).r) + lin(texture(uZ, mid - vec2(0.0, step.y)).r) - here;
    if (abs(zx) > 7.0 || abs(zy) > 7.0) edge = 1.0;
  }

  float ink = edge;
  if (solid) {
    float l = dot(n, uLight);
    float dark = clamp((0.62 - l) / 0.8, 0.0, 1.0);
    float patches = smoothstep(0.22, 0.6, vnoise(b.xyz * 0.012 + 3.0));
    float soft = 1.5 / uHatch;
    float w1 = dark * 0.62 * patches;
    float s1 = abs(fract(dot(gl_FragCoord.xy, vec2(0.71, 0.7)) / uHatch) - 0.5) * 2.0;
    if (w1 > 0.04) ink = max(ink, 1.0 - smoothstep(w1 - soft, w1 + soft, s1));
    if (dark > 0.7) {
      float w2 = (dark - 0.7) * 1.2 * patches;
      float s2 = abs(fract(dot(gl_FragCoord.xy, vec2(-0.71, 0.7)) / uHatch) - 0.5) * 2.0;
      ink = max(ink, 1.0 - smoothstep(w2 - soft, w2 + soft, s2));
    }
    if (b.a > 0.5 && b.a < 1.5) ink = 1.0;
  }
  // Whatever stands near the fire catches it, most of all the walls looking straight into it
  vec3 page = vec3(${PAPER});
  vec3 pen = vec3(${INK});
  if (b.a > 1.5) {
    vec3 palette[6] = vec3[6](vec3(0.87, 0.2, 0.17), vec3(0.96, 0.53, 0.11), vec3(0.98, 0.78, 0.13), vec3(0.28, 0.67, 0.32), vec3(0.1, 0.52, 0.86), vec3(0.66, 0.91, 0.8));
    page = palette[int(b.a + 0.5) - 2];
  }
  if (solid && uFire.w > 0.0) {
    float along = (b.x - uFire.x) / uFire.y;
    float lip = exp(-along * along * 0.8);
    float faces = clamp(dot(n, -normalize(vec3(0.0, b.yz))), 0.0, 1.0) * (1.0 - smoothstep(1.2, 1.3, length(b.yz) / uFire.y));
    float lit = clamp(lip * (0.26 + 0.7 * faces) * uFire.w * (1.0 + uFire.z * 1.4), 0.0, 1.0);
    page = mix(page, vec3(1.0, 0.56, 0.12), lit);
    pen = mix(pen, vec3(0.5, 0.14, 0.0), lit);
  }
  // Bare paper is left clear, so constructs can pass in front of one another
  color = solid ? vec4(mix(page, pen, ink), 1.0) : vec4(pen * ink, ink);
  color = mix(color, vec4(1.0), uWash);
}`;

// Sand: every grain belongs to a point on a part, and arrives there at the moment that point materialises
export const SAND_VS = /* glsl */ `#version 300 es
precision highp float;
layout(location = 0) in vec4 aT;
layout(location = 1) in vec3 aSeed;
uniform mat4 uVP;
uniform vec3 uOff[${MAX_SECTIONS}];
uniform vec3 uCore[${MAX_SECTIONS}];
uniform float uForm[${MAX_SECTIONS}];
uniform float uFree[${MAX_SECTIONS}];
uniform float uTime;
uniform float uSize;
uniform float uFlow;
uniform vec3 uMid;
${NOISE}
void main() {
  int s = int(aT.w + 0.5);
  float f = uForm[s];
  gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
  gl_PointSize = 0.0;
  if (f <= 0.001 || aSeed.x > smoothstep(0.0, 0.3, f) * 1.02) return;
  vec3 b = aT.xyz;
  bool loose = aSeed.z < 0.11;
  float q;
  if (loose) {
    if (uFree[s] >= 1.0 || uFree[s] > aSeed.y) return;
    q = 0.12 + aSeed.y * 0.3;
  } else {
    float g = grow(b);
    if (f > g + 0.015) return;
    float w = 0.3 + aSeed.y * 0.24;
    q = 1.0 - clamp((f + 0.08 - g + w) / w, 0.0, 1.0);
    q *= q;
  }
  float t = uTime * 0.32;
  vec3 core = uCore[s];
  vec2 r = b.yz - core.yz;
  float ang = atan(r.y, r.x) + q * (2.4 + aSeed.x * 1.2) + uTime * 0.5 * q;
  float rad = length(r) * (1.0 + q * (0.26 + aSeed.x * 0.3)) + q * 16.0 * uFlow;
  vec3 c = vec3(b.x, core.y + cos(ang) * rad, core.z + sin(ang) * rad);
  vec3 flow = vec3(vnoise(b * 0.011 + vec3(t, 0, 0)), vnoise(b * 0.011 + vec3(9.0, t, 0)), vnoise(b * 0.011 + vec3(0, 17.0, t))) - 0.5;
  vec3 fine = vec3(vnoise(b * 0.05 + t * 2.0), vnoise(b * 0.05 + 31.0 + t * 2.0), vnoise(b * 0.05 + 57.0 + t * 2.0)) - 0.5;
  c += (flow * 150.0 + fine * 34.0) * q * uFlow;
  c.x += (aSeed.x - 0.5) * q * 36.0 * uFlow;
  if (loose) c += (b - uMid) * uFree[s] * 0.2;
  float bloom = smoothstep(0.0, 0.22, f);
  c = mix(core + (aSeed - 0.5) * 40.0, c, bloom);
  c += uOff[s];
  gl_Position = uVP * vec4(c, 1.0);
  gl_PointSize = uSize * (0.75 + aSeed.y * 0.6) * smoothstep(0.001, 0.03, f);
}`;

export const SAND_FS = /* glsl */ `#version 300 es
precision mediump float;
out vec4 color;
void main() {
  vec2 d = gl_PointCoord - 0.5;
  if (dot(d, d) > 0.25) discard;
  color = vec4(vec3(${INK}), 1.0);
}`;

// Sand blasted out of nozzles once a construct is finished
export const JET_VS = /* glsl */ `#version 300 es
precision highp float;
uniform mat4 uVP;
uniform vec3 uNozzles[${MAX_JETS}];
uniform int uNozzleCount;
uniform vec3 uDirection;
uniform float uTime;
uniform float uPower;
uniform float uSize;
float rand(float x) {
  return fract(sin(x * 12.9898) * 43758.5453);
}
void main() {
  float id = float(gl_VertexID);
  float a = rand(id);
  float b = rand(id + 41.7);
  float c = rand(id + 93.1);
  float u = fract(uTime * 1.5 + a);
  gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
  gl_PointSize = 0.0;
  if (b > uPower || c < u * 0.55) return;
  vec3 p = uNozzles[gl_VertexID % uNozzleCount] + uDirection * u + vec3(0.0, b - 0.5, c - 0.5) * (6.0 + u * length(uDirection) * 0.34);
  gl_Position = uVP * vec4(p, 1.0);
  gl_PointSize = uSize;
}`;

// An afterburner marched through as real gas: fire packed up the bore, a white cone off the lip, standing shock diamonds, and a blue column burning out orange.
// The gas races downstream through the diamonds, which hold still.
export const FLAME_FS = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uZ;
uniform vec3 uEye;
uniform vec3 uFwd;
uniform vec3 uRight;
uniform vec3 uUp;
uniform vec2 uShift;
uniform float uExit;
uniform float uRadius;
uniform float uLength;
uniform float uBore;
uniform float uFire;
uniform float uReach;
uniform float uShock;
uniform float uFlash;
uniform float uTime;
out vec4 color;
${NOISE}
const int STEPS = 28;
const int CELLS = 5;
const vec3 BLUE = vec3(0.06, 0.22, 1.0);
const vec3 VIOLET = vec3(0.42, 0.2, 1.0);
const vec3 ORANGE = vec3(1.0, 0.4, 0.04);
const vec3 EMBER = vec3(1.0, 0.16, 0.0);
const vec3 HOT = vec3(1.0, 0.76, 0.3);
float lin(float z) {
  float n = ${NEAR.toFixed(1)};
  float f = ${FAR.toFixed(1)};
  return (2.0 * n * f) / (f + n - (2.0 * z - 1.0) * (f - n));
}
// The standing waves: a cone off the lip, then a row of diamonds, each smaller and dimmer than the last
float waves(float s, float r, float spread) {
  float t = uTime;
  float tip = 1.02;
  float front = uShock * float(CELLS + 1);
  float cone = 0.76 * spread * pow(max(1.0 - max(s, 0.0) / tip, 0.0), 0.72);
  float lit = (1.0 - smoothstep(0.0, 1.0, r / max(cone, 0.001))) * step(s, tip) * smoothstep(0.0, 0.4, front);
  float at = tip + 0.05 + 0.016 * sin(t * 31.0);
  float size = 0.66;
  float width = 0.5;
  float power = 1.0;
  for (int i = 0; i < CELLS; i++) {
    float u = (s - at) / (size * 0.88);
    if (u > 0.0 && u < 1.0) {
      float peak = u < 0.3 ? u / 0.3 : pow((1.0 - u) / 0.7, 0.8);
      float flick = 0.92 + 0.14 * sin(t * 37.0 + float(i) * 2.1) * sin(t * 23.0 + float(i));
      float born = smoothstep(float(i) + 0.3, float(i) + 1.2, front);
      lit = max(lit, born * power * flick * (1.0 - smoothstep(0.0, 1.0, r / max(width * spread * peak, 0.001))));
    }
    at += size;
    size *= 0.93;
    width *= 0.86;
    power *= 1.02;
  }
  return lit;
}
void main() {
  vec3 rd = normalize(uFwd + uRight * (vUv.x * 2.0 - 1.0 - uShift.x) + uUp * (vUv.y * 2.0 - 1.0 - uShift.y));
  vec3 ro = uEye;
  float D = uRadius * 2.0;
  float L = uLength * max(uReach, 0.001);
  float t = uTime;
  float surge = 1.0 + 0.05 * sin(t * 13.0) * sin(t * 7.3);

  float bound = uRadius * 1.14;
  float A = dot(rd.yz, rd.yz);
  float B = dot(ro.yz, rd.yz);
  float C = dot(ro.yz, ro.yz) - bound * bound;
  float disc = B * B - A * C;

  // Light adds up along the ray, so blue through orange goes white rather than grey
  vec3 gathered = vec3(0.0);
  float body = 0.0;
  if (disc > 0.0) {
    float root = sqrt(disc);
    float x0 = (uExit - uBore - ro.x) / rd.x;
    float x1 = (uExit + L * 1.1 - ro.x) / rd.x;
    float t0 = max((-B - root) / A, min(x0, x1));
    float t1 = min((-B + root) / A, max(x0, x1));
    t1 = min(t1, lin(texture(uZ, vUv).r) / dot(rd, uFwd));
    if (t1 > t0) {
      float dt = (t1 - t0) / float(STEPS);
      float jitter = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
      for (int i = 0; i < STEPS; i++) {
        vec3 p = ro + rd * (t0 + (float(i) + jitter) * dt);
        float s = (p.x - uExit) / D;
        float r = length(p.yz) / uRadius;
        float f = clamp((p.x - uExit) / (L * surge), 0.0, 1.0);
        vec3 tint;
        float thick;
        if (s < 0.0) {
          // Up the bore: packed fire, deep against the walls and hot down the middle
          tint = mix(EMBER, ORANGE, smoothstep(-0.7, -0.02, s));
          tint = mix(tint, HOT, 1.0 - smoothstep(0.05, 0.62, r));
          thick = (1.0 - smoothstep(0.92, 1.04, r)) * 0.032 * uFire;
        } else {
          vec3 q = vec3(s * 1.5 - t * 6.5, p.yz / uRadius * 2.6);
          float n = vnoise(q) * 0.62 + vnoise(q * vec3(2.1, 2.3, 2.3) + 5.0) * 0.38;
          float wall = (1.0 - pow(f, 2.6)) * (0.97 + 0.045 * cos(s * 10.1) * (1.0 - f) + (n - 0.5) * (0.14 + 0.9 * f));
          float edge = 1.0 - smoothstep(mix(0.93, 0.4, f), 1.0, r / max(wall, 0.001));
          edge *= 1.0 - smoothstep(0.55, 1.0, f + (n - 0.5) * 0.34);
          tint = mix(BLUE, VIOLET, smoothstep(0.14, 0.42, f));
          tint = mix(tint, ORANGE, smoothstep(0.42, 0.7, f));
          tint = mix(tint, EMBER, smoothstep(0.8, 1.0, f));
          tint = mix(tint, HOT, (1.0 - smoothstep(0.3, 0.9, r / max(wall, 0.001))) * (1.0 - smoothstep(0.1, 0.62, s)));
          thick = edge * mix(0.024, 0.016, f) * (0.6 + n * 0.8) * uFire;

          vec2 sway = vec2(sin(s * 2.1 - t * 5.0), cos(s * 1.7 - t * 4.0)) * 0.04 * min(s, 3.0);
          float centred = length(p.yz / uRadius - sway);
          float fade = 1.0 - smoothstep(0.6, 0.84, f);
          float lit = waves(s, centred, 1.0) * fade;
          float wide = waves(s, centred, 1.9) * fade;
          gathered += mix(HOT, ORANGE, smoothstep(0.3, 0.9, f)) * lit * dt * 0.042;
          gathered += (tint + 0.4) * wide * dt * 0.01;
          body += (1.0 - body) * (1.0 - exp(-lit * dt * 0.03));
        }
        float a = 1.0 - exp(-thick * dt);
        gathered += tint * a;
        body += (1.0 - body) * a;
      }
    }
  }

  // Churn the light as it races downstream
  float tc = -B / max(A, 0.0001);
  vec3 near = ro + rd * tc;
  float sx = (near.x - uExit) / D;
  float v = near.z / uRadius;
  float puff = vnoise(vec3(sx * 2.6 - t * 9.0, v * 3.4, t * 1.7)) * 0.62 + vnoise(vec3(sx * 5.2 - t * 15.0, v * 7.0, t * 2.9)) * 0.38;
  vec3 c = 1.0 - exp(-gathered * (0.84 + puff * 0.32) * (1.0 + uFlash * 1.5) * 0.55);
  c = min(c, vec3(body));

  // A tight bloom hugging the column, which falls on the engine as well as the paper
  float x = clamp(near.x, uExit, uExit + L * 0.8);
  float along = (x - uExit) / uLength;
  float d = length(near - vec3(x, 0.0, 0.0)) / (uRadius * mix(1.0, 0.4, along));
  float h = exp(-d * d * 0.5) * 0.12 * (1.0 - along * along) * uFire;
  vec3 tint = mix(vec3(1.0, 0.6, 0.2), vec3(0.24, 0.42, 1.0), smoothstep(0.0, 0.18, along));
  tint = mix(tint, ORANGE, smoothstep(0.3, 0.7, along));

  // The light-off: one burst at the nozzle
  vec3 lip = vec3(uExit, 0.0, 0.0);
  float gap = length(ro + rd * dot(lip - ro, rd) - lip) / uRadius;
  float burst = exp(-gap * gap * 0.3) * uFlash * 0.6;

  vec3 glow = tint * h + vec3(1.0, 0.72, 0.3) * burst;
  float veil = 1.0 - (1.0 - h) * (1.0 - burst);
  float dither = (fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715)))) - 0.5) / 255.0;
  color = vec4(c + glow * (1.0 - body) + dither, body + veil * (1.0 - body));
}`;
