// Topology vertex shader — full implementation
uniform float uTime;
uniform float uScroll;
uniform vec4 uBeatWeights;
uniform float uNoiseAmplitude;
uniform float uPointScale;
uniform float uCameraProgress;

attribute float aProgressIndex;
attribute float aHelixSide;
attribute float aRungMix;
attribute float aLatticeMix;
attribute vec2 aPlaneUv;
attribute vec3 aRandom;
attribute float aSize;

varying float vDepth;
varying float vProgressIndex;
varying float vHelixSide;
varying float vRungMix;
varying float vWorldY;
varying float vIsDust;

// Constants
const float PI = 3.14159265358979;
const float ROTATIONS = 8.0;
const float RADIUS = 3.0;
const float HEIGHT = 20.0;

// ─── Ashima 4D Simplex Noise (MIT License) ───────────────────────────────────
// https://github.com/ashima/webgl-noise
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
float mod289(float x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
float permute(float x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
float taylorInvSqrt(float r) { return 1.79284291400159 - 0.85373472095314 * r; }
vec4 grad4(float j, vec4 ip) {
  const vec4 ones = vec4(1.0, 1.0, 1.0, -1.0);
  vec4 p, s;
  p.xyz = floor(fract(vec3(j) * ip.xyz) * 7.0) * ip.z - 1.0;
  p.w = 1.5 - dot(abs(p.xyz), ones.xyz);
  s = vec4(lessThan(p, vec4(0.0)));
  p.xyz = p.xyz + (s.xyz * 2.0 - 1.0) * s.www;
  return p;
}
float snoise(vec4 v) {
  const vec4 C = vec4( 0.138196601125011, 0.276393202250021, 0.414589803375032,-0.447213595499958);
  vec4 i  = floor(v + dot(v, vec4(0.309016994374947451)));
  vec4 x0 = v -   i + dot(i, C.xxxx);
  vec4 i1, i2, i3;
  i1.xyz = step(x0.yzw, x0.xxx); i1.w = 1.0 - i1.x - i1.y - i1.z;
  i2.xy  = step(x0.zw,  x0.xy);  i2.z = step(x0.w, x0.z); i2.w = 1.0 - i2.x - i2.y - i2.z;
  i3.x   = step(x0.y, x0.x) * step(x0.z, x0.x) * step(x0.w, x0.x);
  i3.y   = step(x0.z, x0.y) * step(x0.w, x0.y) * (1.0 - i3.x);
  i3.z   = step(x0.w, x0.z) * (1.0 - i3.x - i3.y);
  i3.w   = 1.0 - i3.x - i3.y - i3.z;
  vec4 x1 = x0 - i1 + C.xxxx; vec4 x2 = x0 - i2 + C.yyyy;
  vec4 x3 = x0 - i3 + C.zzzz; vec4 x4 = x0 + C.wwww;
  i = mod289(i);
  float j0 = permute(permute(permute(permute(i.w)+i.z)+i.y)+i.x);
  vec4 j1 = permute(permute(permute(permute(
    i.w + vec4(i1.w, i2.w, i3.w, 1.0))
   +i.z + vec4(i1.z, i2.z, i3.z, 1.0))
   +i.y + vec4(i1.y, i2.y, i3.y, 1.0))
   +i.x + vec4(i1.x, i2.x, i3.x, 1.0));
  vec4 ip = vec4(1.0/294.0, 1.0/49.0, 1.0/7.0, 0.0);
  vec4 p0 = grad4(j0, ip); vec4 p1 = grad4(j1.x, ip);
  vec4 p2 = grad4(j1.y, ip); vec4 p3 = grad4(j1.z, ip); vec4 p4 = grad4(j1.w, ip);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  p4 *= taylorInvSqrt(dot(p4,p4));
  vec3 m0 = max(0.6 - vec3(dot(x0,x0), dot(x1,x1), dot(x2,x2)), 0.0);
  vec2 m1 = max(0.6 - vec2(dot(x3,x3), dot(x4,x4)), 0.0);
  m0 = m0 * m0; m1 = m1 * m1;
  return 49.0 * (dot(m0*m0, vec3(dot(p0,x0), dot(p1,x1), dot(p2,x2)))
               + dot(m1*m1, vec2(dot(p3,x3), dot(p4,x4))));
}
// ─────────────────────────────────────────────────────────────────────────────

// ─── Hash Function ───────────────────────────────────────────────────────────
vec2 hash12(float p) {
  vec3 p3 = fract(vec3(p) * vec3(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.xx + p3.yz) * p3.zy);
}
// ─────────────────────────────────────────────────────────────────────────────

void main() {
  vProgressIndex = aProgressIndex;
  vHelixSide = aHelixSide;
  vRungMix = aRungMix;

  // Beat 1 — Helix: double strand with rung connectors
  float angle = aProgressIndex * ROTATIONS * 2.0 * PI + uTime * 0.2;
  float phaseOffset = aHelixSide * PI;
  float totalAngle = angle + phaseOffset;
  
  float helixX = cos(totalAngle) * RADIUS;
  float helixZ = sin(totalAngle) * RADIUS;
  float helixY = (aProgressIndex - 0.5) * HEIGHT;
  vec3 baseHelixPos = vec3(helixX, helixY, helixZ);
  
  // Backbone thickness (Narrow shell/annulus)
  float slope = HEIGHT / (ROTATIONS * 2.0 * PI);
  vec3 tangent = normalize(vec3(-sin(totalAngle) * RADIUS, slope, cos(totalAngle) * RADIUS));
  vec3 normal = normalize(vec3(cos(totalAngle), 0.0, sin(totalAngle)));
  vec3 binormal = cross(tangent, normal);
  
  float rOffset = 0.15 + 0.1 * abs(aRandom.x); // Tight annulus instead of filled circle
  float thetaOffset = aRandom.y * 2.0 * PI;
  vec3 backboneOffset = normal * (cos(thetaOffset) * rOffset) + binormal * (sin(thetaOffset) * rOffset);
  vec3 backbonePos = baseHelixPos + backboneOffset;

  // Discrete rungs
  float numRungs = 10.0;
  float quantizedProgress = (floor(aProgressIndex * numRungs) + 0.5) / numRungs;
  float jitter = (aRandom.y - 0.5) * 0.08; // Tiny angle jitter to reduce moire/combing
  float rungAngle = quantizedProgress * ROTATIONS * 2.0 * PI + uTime * 0.2 + jitter;
  float rungY = (quantizedProgress - 0.5) * HEIGHT + (aRandom.z - 0.5) * 0.1;
  
  vec3 strand1 = vec3(cos(rungAngle) * RADIUS, rungY, sin(rungAngle) * RADIUS);
  vec3 strand2 = vec3(cos(rungAngle + PI) * RADIUS, rungY, sin(rungAngle + PI) * RADIUS);
  
  float rungT = fract(abs(aRandom.x) * 13.37);
  vec3 rungBasePos = mix(strand1, strand2, rungT);
  vec3 rungPos = rungBasePos + vec3(aRandom.y, aRandom.z, aRandom.x) * 0.02;
  
  // Dust
  float isDust = step(0.72, abs(aRandom.z));
  float dustR = RADIUS + 2.0 + abs(aRandom.x) * 7.5; // Start outside the helix mass
  float dustAngle = aRandom.y * 2.0 * PI + uTime * 0.1;
  float dustY = (aRandom.z - 0.5) * HEIGHT * 1.5; // Symmetric vertical placement
  vec3 dustPos = vec3(cos(dustAngle) * dustR, dustY, sin(dustAngle) * dustR);
  
  // Mix components
  float isRung = step(0.398, aRungMix); // Sharply reduce rung population
  vec3 helixPos = mix(backbonePos, rungPos, isRung);
  helixPos = mix(helixPos, dustPos, isDust);
  
  vIsDust = isDust;

  // Beat 2 — Data Streams: clustered vertical columns
  float streamId = floor(aLatticeMix * 16.0);
  float sAngle = fract(sin(streamId * 12.9898) * 43758.5453) * PI * 2.0;
  float sRadius = fract(sin(streamId * 78.233) * 43758.5453) * 4.0 + 1.0;
  
  vec3 latticePos;
  latticePos.x = cos(sAngle) * sRadius + (aRandom.x - 0.5) * 0.3;
  latticePos.z = sin(sAngle) * sRadius + (aRandom.y - 0.5) * 0.3;
  
  float speed = 0.1 + fract(sin(streamId * 93.989) * 43758.5453) * 0.2;
  float yPos = aProgressIndex - uTime * speed;
  latticePos.y = (fract(yPos) - 0.5) * HEIGHT * 1.5;

  // Beat 3 — Chaos / Maya: 4D simplex noise fractures the helix
  float noiseScale = 0.3;
  float noiseSpeed = uTime * 0.5;
  vec3 noiseInput = helixPos * noiseScale + vec3(aRandom.x, aRandom.y, noiseSpeed);
  float nx = snoise(vec4(noiseInput, 0.0));
  float ny = snoise(vec4(noiseInput + 31.416, 0.0));
  float nz = snoise(vec4(noiseInput + 62.832, 0.0));
  vec3 chaosPos = helixPos + vec3(nx, ny, nz) * uNoiseAmplitude;

  // Beat 4 — Plane / Brahman: flat obsidian mirror with micro-ripples
  // Map normalized aProgressIndex to a 2D grid to ensure uniform coverage without lines
  float gridRes = 600.0;
  float cell = aProgressIndex * gridRes * gridRes;
  float cx = mod(floor(cell), gridRes);
  float cz = floor(cell / gridRes);
  
  vec2 rv = hash12(aProgressIndex * 123456.789);
  float planeNx = (cx + rv.x) / gridRes;
  float planeNz = (cz + rv.y) / gridRes;
  
  float planeX = (planeNx - 0.5) * 40.0;
  float planeZ = (planeNz - 0.5) * 40.0;
  
  float planeY = sin(planeX * 10.0 + uTime * 2.0) * 0.01
               + sin(planeZ * 10.0 + uTime * 2.3) * 0.01;
               
  vec3 planePos = vec3(planeX, planeY, planeZ);

  // Blend all four beats
  vec3 finalPos = helixPos   * uBeatWeights.x
                + latticePos * uBeatWeights.y
                + chaosPos   * uBeatWeights.z
                + planePos   * uBeatWeights.w;

  // Custom transition between Beat 1 and Beat 2
  float transitionPhase = smoothstep(0.21, 0.29, uScroll);
  float transArc = transitionPhase * (1.0 - transitionPhase) * 4.0;
  
  // Outward push based on helix side
  float sideDir = aHelixSide * 2.0 - 1.0;
  vec3 outwardOffset = vec3(sideDir * 12.0 * transArc, 0.0, 0.0);
  
  // Fall downward with quadratic acceleration, staggered by progress index
  float fallAmount = -50.0 * (transitionPhase * transitionPhase) * (1.0 - transitionPhase) * (1.0 + aProgressIndex);
  vec3 fallOffset = vec3(0.0, fallAmount, 0.0);
  
  // Apply transition motion
  finalPos += outwardOffset + fallOffset;

  vWorldY = finalPos.y;

  vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
  vDepth = clamp((-mvPosition.z - 2.0) / 30.0, 0.0, 1.0);

  float pointSize = aSize * uPointScale * (300.0 / -mvPosition.z);
  pointSize *= mix(1.0, 2.5, vIsDust); // Boost dust point size
  gl_PointSize = clamp(pointSize, 0.5, mix(4.0, 6.0, vIsDust));
  gl_Position = projectionMatrix * mvPosition;
}
