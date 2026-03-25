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
  vec3 legacyHelixPos = mix(backbonePos, rungPos, isRung);
  legacyHelixPos = mix(legacyHelixPos, dustPos, isDust);
  
  // ---------------------------------------------------------------------------
  // Beat 1 Redesign — Anatomical DNA
  // ---------------------------------------------------------------------------
  float dnaRotations = 5.0; // Slightly fewer rotations for better legibility
  float dnaRadius = 3.5;
  float dnaHeight = 22.0;
  
  float dnaAngle = aProgressIndex * dnaRotations * 2.0 * PI + uTime * 0.15;
  float dnaPhaseOffset = aHelixSide * PI; // Two distinct backbones
  float dnaTotalAngle = dnaAngle + dnaPhaseOffset;
  
  float dnaY = (aProgressIndex - 0.5) * dnaHeight;
  vec3 dnaBasePos = vec3(cos(dnaTotalAngle) * dnaRadius, dnaY, sin(dnaTotalAngle) * dnaRadius);
  
  // Backbone thickness (Anatomical ribbon)
  float dnaSlope = dnaHeight / (dnaRotations * 2.0 * PI);
  vec3 dnaTangent = normalize(vec3(-sin(dnaTotalAngle) * dnaRadius, dnaSlope, cos(dnaTotalAngle) * dnaRadius));
  vec3 dnaNormal = normalize(vec3(cos(dnaTotalAngle), 0.0, sin(dnaTotalAngle)));
  vec3 dnaBinormal = cross(dnaTangent, dnaNormal);
  
  // Ribbon shape: wider along the binormal (up/down), narrow along normal (in/out)
  float ribbonW = 0.5 + 0.3 * abs(aRandom.x);
  float ribbonH = 0.1 + 0.05 * abs(aRandom.y);
  float ribbonTheta = aRandom.z * 2.0 * PI;
  vec3 dnaBackboneOffset = dnaBinormal * (cos(ribbonTheta) * ribbonW) + dnaNormal * (sin(ribbonTheta) * ribbonH);
  vec3 dnaBackbonePos = dnaBasePos + dnaBackboneOffset;

  // Rungs (Base Pairs)
  float dnaNumRungs = 45.0; // More frequent, legible rungs
  float dnaQuantizedProgress = (floor(aProgressIndex * dnaNumRungs) + 0.5) / dnaNumRungs;
  float dnaRungAngle = dnaQuantizedProgress * dnaRotations * 2.0 * PI + uTime * 0.15;
  float dnaRungY = (dnaQuantizedProgress - 0.5) * dnaHeight;
  
  vec3 dnaStrand1 = vec3(cos(dnaRungAngle) * dnaRadius, dnaRungY, sin(dnaRungAngle) * dnaRadius);
  vec3 dnaStrand2 = vec3(cos(dnaRungAngle + PI) * dnaRadius, dnaRungY, sin(dnaRungAngle + PI) * dnaRadius);
  
  float dnaRungT = fract(abs(aRandom.x) * 13.37); // 0.0 to 1.0 along the rung
  vec3 dnaRungBasePos = mix(dnaStrand1, dnaStrand2, dnaRungT);
  
  // Add slight twist/sag to the rungs
  float rungSag = sin(dnaRungT * PI) * 0.3;
  vec3 dnaRungPos = dnaRungBasePos + vec3(0.0, -rungSag, 0.0) + vec3(aRandom.y, aRandom.z, aRandom.x) * 0.05;
  
  // Dust
  float dnaIsDust = step(0.85, abs(aRandom.z)); // Less dust, more focus on anatomy
  float dnaDustR = dnaRadius + 1.5 + abs(aRandom.x) * 6.0;
  float dnaDustAngle = aRandom.y * 2.0 * PI + uTime * 0.05;
  float dnaDustY = (aRandom.z - 0.5) * dnaHeight * 1.2;
  vec3 dnaDustPos = vec3(cos(dnaDustAngle) * dnaDustR, dnaDustY, sin(dnaDustAngle) * dnaDustR);
  
  // Mix components for Beat 1
  float dnaIsRung = step(0.5, aRungMix); // Increase rung population
  vec3 newHelixPos = mix(dnaBackbonePos, dnaRungPos, dnaIsRung);
  newHelixPos = mix(newHelixPos, dnaDustPos, dnaIsDust);
  
  vec3 helixPos = newHelixPos; // Beat 1 geometry (isolated for future redesign)
  
  // Pass to fragment shader
  vIsDust = dnaIsDust;
  vIsRung = dnaIsRung;
  vRungT = dnaRungT;
  vRungIndex = dnaQuantizedProgress * dnaNumRungs;
  vWavePhase = 0.0; // Safe default for non-Beat-3 paths

  // ---------------------------------------------------------------------------
  // Beat 2 Redesign — Token Processing Field
  // ---------------------------------------------------------------------------
  float bankDir = aHelixSide * 2.0 - 1.0; // -1 (left) or 1 (right)
  float bankX = bankDir * 6.0; // Distance from center
  
  float numLanes = 3.0;
  float laneId = floor(aLatticeMix * numLanes);
  float laneOffset = (laneId - (numLanes - 1.0) * 0.5) * 2.5; // -2.5, 0, 2.5
  
  float processSpeed = 0.15;
  float processHeight = HEIGHT * 1.5; // 30.0
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

  float pointSize = aSize * uPointScale * (300.0 / -mvPosition.z);
  pointSize *= mix(1.0, 2.5, vIsDust); // Boost dust point size
  gl_PointSize = clamp(pointSize, 0.5, mix(4.0, 6.0, vIsDust));
  gl_Position = projectionMatrix * mvPosition;
}
