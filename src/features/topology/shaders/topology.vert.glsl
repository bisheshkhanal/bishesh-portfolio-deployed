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
varying float vWorldX;
varying float vWorldZ;
varying float vIsDust;
varying float vIsRung;
varying float vRungT;
varying float vRungIndex;
varying float vWavePhase;
varying float vDelay;

// Constants
const float PI = 3.14159265358979;

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

  // ---------------------------------------------------------------------------
  // Beat 1 Redesign — ykob Math and Visuals (Ground-Up Rewrite)
  // Copyright (c) 2021 Yoichi Kobayashi
  // Released under the MIT license
  // http://opensource.org/licenses/mit-license.php
  // ---------------------------------------------------------------------------
  // SYNC NOTE: These values must match HELIX_CONFIG in src/features/topology/topologyConfig.ts
  float dnaRotations = 3.5;
  float dnaRadius = 5.0; // SCALED UP
  float dnaHeight = 45.0; // SCALED UP

  // Derive delay only from phase, no random scatter noise
  float delay = (aRandom.x * 0.5 + 0.5) * 6.2832;
  vDelay = delay;

  // Map progress to Y-axis
  float progress = clamp(aProgressIndex, 0.0, 1.0);
  float baseY = mix(-dnaHeight * 0.5, dnaHeight * 0.5, progress);

  // Kobayashi-style shared oscillation:
  // - added to helix axis (Y)
  float yVib = sin(uTime * 4.0 + delay) * 0.3;
  float peristaltic = sin(uTime * 3.0 + aProgressIndex * 20.0) * 0.15;
  float y = baseY + yVib + peristaltic;
  float radius = dnaRadius;

  // Y-axis-aligned helix angle, animated like the original
  float angle = progress * dnaRotations * 2.0 * PI + uTime * 0.4;

  // Two strand phases (offset by exactly PI)
  float strandPhase = aHelixSide * PI;
  float angleMain = angle + strandPhase;

  // Main strand position
  vec3 strandPos = vec3(
    sin(angleMain) * radius,
    y,
    cos(angleMain) * radius
  );

  // Quantize rung positions to discrete base-pair intervals
  float numBasePairs = 24.0;
  float rungQuantized = floor(aProgressIndex * numBasePairs) / numBasePairs;
  float rungBaseY = mix(-dnaHeight * 0.5, dnaHeight * 0.5, rungQuantized);
  float rungAngle = rungQuantized * dnaRotations * 2.0 * PI + uTime * 0.4;
  vec3 rungAq = vec3(sin(rungAngle) * radius, rungBaseY, cos(rungAngle) * radius);
  vec3 rungBq = vec3(sin(rungAngle + PI) * radius, rungBaseY, cos(rungAngle + PI) * radius);

  // Use ~50% of particles as rungs.
  // aRungMix in [0.0, 0.2] => rung particles, remapped to [0.0, 1.0]
  float isRung = 1.0 - step(0.2, aRungMix);
  float rungT = clamp(aRungMix / 0.2, 0.0, 1.0);

  // Final helix position (no random scatter, volume comes purely from volumeOsc)
  vec3 rawHelixPos = mix(
    strandPos,
    mix(rungAq, rungBq, rungT),
    isRung
  );

  float rungJitterAmp = isRung * 0.04;
  float rungJitter = sin(uTime * 9.0 + aRandom.x * 15.0) * rungJitterAmp;
  rawHelixPos.x += rungJitter * aRandom.y;
  rawHelixPos.z += rungJitter * aRandom.z;

  // DIAGONAL ROTATION (Bottom-Left to Top-Right)
  // Rotate ~45 degrees (0.785 rad) around the Z axis
  float diagAngle = -0.785; // Negative to go bottom-left to top-right
  mat3 rotZ = mat3(
    cos(diagAngle), -sin(diagAngle), 0.0,
    sin(diagAngle),  cos(diagAngle), 0.0,
    0.0,             0.0,            1.0
  );
  
  vec3 helixPos = rotZ * rawHelixPos;

  // Pass to fragment shader
  vIsDust = step(0.72, abs(aRandom.z)); // Restored for shared point sizing
  vIsRung = isRung;
  vRungT = rungT;
  vRungIndex = floor(progress * 48.0); // Quantize for color pairing
  vWavePhase = 0.0;

  // ---------------------------------------------------------------------------
  // Beat 2 Redesign — Quantized Embedding Matrix
  // 30 token blocks in a 6x5 grid representing discrete LLM tokens
  // ---------------------------------------------------------------------------
  float numTokens = 30.0;
  float tokenIdx = floor(aProgressIndex * numTokens);
  float tokenCol = mod(tokenIdx, 6.0);   // 0-5 (6 columns)
  float tokenRow = floor(tokenIdx / 6.0); // 0-4 (5 rows)

  // Grid spacing — spread across the scene
  float colSpacing = 4.5;
  float rowSpacing = 5.5;
  float gridX = (tokenCol - 2.5) * colSpacing;  // center at 0
  float gridY = (tokenRow - 2.0) * rowSpacing;  // center at 0
  float gridZ = 0.0;

  // Position within token block — tight sphere using aLatticeMix and aRandom
  float withinToken = fract(aProgressIndex * numTokens);
  float blockRadius = 0.9;
  float blockX = aRandom.x * blockRadius;
  float blockY = aRandom.y * blockRadius;
  float blockZ = aRandom.z * blockRadius * 0.5; // flatter in Z for readability

  // Attention flash: periodic wave sweeping left-to-right across the grid
  // Each token lights up in sequence based on its column + row
  float attentionSpeed = 0.4;
  float attentionPhase = fract(uTime * attentionSpeed - tokenIdx / numTokens);
  float isAttended = smoothstep(0.85, 1.0, attentionPhase);

  // When attended: token block expands slightly (embedding vector unpacking)
  float expansion = isAttended * 0.6;
  float expandedBlockRadius = blockRadius * (1.0 + expansion);
  blockX = aRandom.x * expandedBlockRadius;
  blockY = aRandom.y * expandedBlockRadius;
  blockZ = aRandom.z * expandedBlockRadius * 0.5;

  // Discrete tick: subtle quantized pulsing (computational, not biological)
  float tickRate = 3.0;
  float tickPhase = fract(uTime * tickRate + tokenIdx * 0.1);
  float tick = smoothstep(0.0, 0.1, tickPhase) * smoothstep(0.3, 0.2, tickPhase);
  blockX += tick * aRandom.x * 0.15;
  blockY += tick * aRandom.y * 0.15;

  vec3 latticePos = vec3(
    gridX + blockX,
    gridY + blockY,
    gridZ + blockZ
  );

  // NOTE: Do NOT set vWavePhase = isAttended here.
  // Beat 3 (lines ~229-237) overwrites vWavePhase with interference value.
  // The fragment shader will recompute isAttended from vProgressIndex + uTime directly.

  // Beat 3 — Maya: Lattice-based wave interference
  // 3 overlapping sine-wave systems with distinct directions/frequencies/speeds
  float w1 = sin(latticePos.x * 0.8 + latticePos.y * 0.4 + uTime * 1.5);
  float w2 = sin(latticePos.y * 1.2 - latticePos.z * 0.6 + uTime * 0.9);
  float w3 = sin(latticePos.z * 0.9 + latticePos.x * 1.1 - uTime * 2.1);
  
  // Combine waves to create interference pattern
  float interference = (w1 + w2 + w3) / 3.0;
  
  // Export phase for prismatic color mapping in fragment shader
  vWavePhase = interference * 0.5 + 0.5; // Normalize to 0.0 - 1.0
  
  // Apply deformation using uNoiseAmplitude as wave amplitude
  // 2.5 is a tuning constant to boost the visual displacement
  vec3 waveOffset = vec3(w1, w2, w3) * uNoiseAmplitude * 2.5;
  vec3 chaosPos = latticePos + waveOffset;

  // Beat 4 — Torus / Brahman: infinite self-similar structure
  // Torus lies flat with hole along Y axis, so (0,0,0) is inside the hole
  float gridRes = 600.0;
  float cell = aProgressIndex * gridRes * gridRes;
  float cx = mod(floor(cell), gridRes);
  float cz = floor(cell / gridRes);

  vec2 rv = hash12(aProgressIndex * 123456.789);
  float torusU = (cx + rv.x) / gridRes; // 0→1 around major radius (theta)
  float torusV = (cz + rv.y) / gridRes; // 0→1 around minor radius (phi)

  // Parametric torus equations
  float theta = torusU * 2.0 * PI + uTime * 0.1; // slow rotation
  float phi = torusV * 2.0 * PI;
  float R = 12.0; // major radius (center to tube center)
  float r = 4.0;  // minor radius (tube radius)

  // Breathing effect using existing snoise
  float breathNoise = snoise(vec4(torusU * 2.0, torusV * 2.0, uTime * 0.2, 0.0)) * 0.3;

  vec3 torusPos;
  torusPos.x = (R + (r + breathNoise) * cos(phi)) * cos(theta);
  torusPos.y = (r + breathNoise) * sin(phi);
  torusPos.z = (R + (r + breathNoise) * cos(phi)) * sin(theta);

  // Blend all four beats
  vec3 finalPos = helixPos   * uBeatWeights.x
                + latticePos * uBeatWeights.y
                + chaosPos   * uBeatWeights.z
                + torusPos   * uBeatWeights.w;

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

  // Beat 3→4 transition: chaos converging to torus surface
  float t34Phase = smoothstep(0.71, 0.79, uScroll);

  // Converge towards the torus surface instead of collapsing to origin
  vec3 toTorus = torusPos - finalPos;
  vec3 t34Offset = toTorus * t34Phase * uBeatWeights.z * 0.5;
  finalPos += t34Offset;

  vWorldY = finalPos.y;
  vWorldX = finalPos.x;
  vWorldZ = finalPos.z;

  vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
  vDepth = clamp((-mvPosition.z - 2.0) / 30.0, 0.0, 1.0);

  float basePointSize = aSize * uPointScale * (300.0 / -mvPosition.z);
  float pointSize = basePointSize;
  pointSize *= mix(1.0, 2.5, vIsDust); // Boost dust point size
  
  float ykobPointMax = 8.0;
  float beat1PointSize = clamp(pointSize * 1.5, 2.0, 8.0);
  float otherPointSize = clamp(pointSize, 0.5, mix(4.0, 6.0, vIsDust));
  
  gl_PointSize = mix(otherPointSize, beat1PointSize, uBeatWeights.x);
  gl_Position = projectionMatrix * mvPosition;
}
