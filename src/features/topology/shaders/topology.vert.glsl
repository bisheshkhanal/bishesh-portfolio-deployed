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
  float y = baseY + yVib;
  float radius = dnaRadius;

  // Y-axis-aligned helix angle, animated like the original
  float angle = progress * dnaRotations * 2.0 * PI + uTime * 0.4;

  // Two strand phases (offset by exactly PI)
  float strandPhase = aHelixSide * PI;
  float angleMain = angle + strandPhase;
  float angleA = angle;
  float angleB = angle + PI;

  // Main strand position
  vec3 strandPos = vec3(
    sin(angleMain) * radius,
    y,
    cos(angleMain) * radius
  );

  // Rung endpoints at the same Y/phase, spanning between strands
  vec3 rungA = vec3(sin(angleA) * radius, y, cos(angleA) * radius);
  vec3 rungB = vec3(sin(angleB) * radius, y, cos(angleB) * radius);

  // Use ~50% of particles as rungs.
  // aRungMix in [0.0, 0.2] => rung particles, remapped to [0.0, 1.0]
  float isRung = 1.0 - step(0.2, aRungMix);
  float rungT = clamp(aRungMix / 0.2, 0.0, 1.0);

  // Final helix position (no random scatter, volume comes purely from volumeOsc)
  vec3 rawHelixPos = mix(
    strandPos,
    mix(rungA, rungB, rungT),
    isRung
  );

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
  // Beat 2 Redesign — Token Processing Field
  // ---------------------------------------------------------------------------
  float bankDir = aHelixSide * 2.0 - 1.0; // -1 (left) or 1 (right)
  float bankX = bankDir * 6.0; // Distance from center
  
  float numLanes = 3.0;
  float laneId = floor(aLatticeMix * numLanes);
  float laneOffset = (laneId - (numLanes - 1.0) * 0.5) * 2.5; // -2.5, 0, 2.5
  
  float processSpeed = 0.15;
  float processHeight = 30.0; // 30.0
  float gateInterval = 5.0;
  
  float numTokens = 24.0;
  float tokenIndex = floor(aProgressIndex * numTokens);
  float tokenCenterProgress = (tokenIndex + 0.5) / numTokens;
  float particleOffset = (aProgressIndex - tokenCenterProgress) * numTokens; // -0.5 to 0.5
  
  float tokenFlowY = tokenCenterProgress - uTime * processSpeed;
  float tokenWrappedY = fract(tokenFlowY);
  float tokenRawY = (tokenWrappedY - 0.5) * processHeight;
  
  float nearestGateY = floor(tokenRawY / gateInterval + 0.5) * gateInterval;
  float distToGate = abs(tokenRawY - nearestGateY);
  float gateInfluence = smoothstep(gateInterval * 0.3, 0.0, distToGate);
  
  float tokenWarpedY = mix(tokenRawY, nearestGateY, gateInfluence * 0.8);
  float tokenCompression = mix(1.0, 0.15, gateInfluence);
  
  // Token internal structure (4x4 grid)
  float gridX = floor((aRandom.x * 0.5 + 0.5) * 4.0);
  float gridZ = floor((aRandom.y * 0.5 + 0.5) * 4.0);
  float tokenGridX = (gridX - 1.5) * 0.3;
  float tokenGridZ = (gridZ - 1.5) * 0.3;
  
  // Jitter to fill the volume
  float jitterX = aRandom.y * 0.15;
  float jitterZ = aRandom.z * 0.15;
  float jitterY = aRandom.x * 0.15;
  
  float horizontalSpread = mix(1.0, 2.5, gateInfluence);
  
  vec3 processPos;
  processPos.x = bankX + laneOffset + (tokenGridX + jitterX) * horizontalSpread;
  processPos.y = tokenWarpedY + (particleOffset * 1.2 + jitterY) * tokenCompression;
  processPos.z = (tokenGridZ + jitterZ) * horizontalSpread;
  
  // Add a subtle "processing" vibration when inside the gate
  processPos.x += aRandom.y * 0.2 * gateInfluence;
  processPos.z += aRandom.z * 0.2 * gateInfluence;
  
  vec3 latticePos = processPos;

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

  // Beat 4 — Plane / Brahman: luminous underlying field
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
  
  float planeY = sin(planeX * 10.0 + uTime * 2.0) * 0.08
               + sin(planeZ * 10.0 + uTime * 2.3) * 0.08;
               
  planeY += sin(planeX * 0.3 + uTime * 0.4) * 0.06
          + sin(planeZ * 0.3 + uTime * 0.5) * 0.06;
               
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

  // Beat 3→4 transition: chaos resolving into order
  float t34Phase = smoothstep(0.71, 0.79, uScroll);
  float t34Arc = t34Phase * (1.0 - t34Phase) * 4.0; // peaks at midpoint
  
  float collapseY = -finalPos.y * t34Phase * uBeatWeights.z * 0.6;
  vec3 collapseOffset = vec3(0.0, collapseY, 0.0);
  
  float convergenceStrength = t34Arc * uBeatWeights.z * 0.4;
  vec3 convergenceOffset = vec3(-finalPos.x, 0.0, -finalPos.z) * convergenceStrength;
  
  finalPos += collapseOffset + convergenceOffset;

  vWorldY = finalPos.y;

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
