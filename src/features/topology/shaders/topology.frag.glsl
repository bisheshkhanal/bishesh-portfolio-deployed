// Topology fragment shader
uniform vec4 uBeatWeights;
uniform vec3 uColorBioStrand1;
uniform vec3 uColorBioStrand2;
uniform vec3 uColorLatticeSlate;
uniform vec3 uColorLatticeCyan;
uniform vec3 uColorLatticeGreen;
uniform vec3 uColorPlaneObsidian;
uniform vec3 uColorPlaneSilver;
uniform vec3 uColorPlaneMoonlight;
uniform vec3 uColorPlaneGold;
uniform float uTime;

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

// Helper for prismatic color mapping
vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
  // Soft circular point
  vec2 uv = gl_PointCoord - 0.5;
  float dist = length(uv);
  if (dist > 0.5) discard;
  float alpha = smoothstep(0.5, 0.1, dist);

  // ---------------------------------------------------------------------------
  // Beat 1 Redesign — ykob Math and Visuals (Ground-Up Rewrite)
  // Copyright (c) 2021 Yoichi Kobayashi
  // Released under the MIT license
  // http://opensource.org/licenses/mit-license.php
  // ---------------------------------------------------------------------------
  // --- KOBAYASHI-INSPIRED COLOR & SHAPE ---
  // Distance from center, scaled up slightly for the ring
  float r = length(gl_PointCoord - vec2(0.5)) * 2.0;
  
  // Hollow glow shape
  float core = (1.0 - smoothstep(0.5, 0.7, r)) * 0.5;
  float ring = smoothstep(0.8, 0.9, r) * smoothstep(1.2, 1.0, r) * 0.5;
  float bioShape = core + ring;
  
  // Color variation based on delay
  float rVal = 0.8 - vDelay * 0.1;
  rVal = clamp(rVal, 0.17, 0.8);
  vec3 kobColor = vec3(rVal, 0.6, 0.6);
  
  // Dim rungs
  kobColor = mix(kobColor, kobColor * 0.7, vIsRung);
  
  // Combine shape with base color and Kobayashi variation
  vec3 bioColor = kobColor * bioShape;

  // Beat 2: Token Processing Field
  float gateInterval = 5.0;
  float nearestGateY = floor(vWorldY / gateInterval + 0.5) * gateInterval;
  float distToGate = abs(vWorldY - nearestGateY);
  
  // Gate glow: bright when particles are compressed at the gate
  float gateGlow = smoothstep(0.8, 0.0, distToGate);
  
  // Processed state: enter at top (+Y) as Cyan, exit at bottom (-Y) as Green
  float processState = smoothstep(10.0, -10.0, vWorldY);
  vec3 tokenActive = mix(uColorLatticeCyan, uColorLatticeGreen, processState);
  
  vec3 tokenBase = uColorLatticeSlate + tokenActive * 0.15; // Dim when traveling
  
  // Traveling pulse
  float pulsePhase = fract(vWorldY * 0.15 + uTime * 1.5);
  float pulse = smoothstep(0.7, 0.9, pulsePhase) * smoothstep(1.0, 0.9, pulsePhase);
  
  vec3 latticeColor = tokenBase + tokenActive * pulse + tokenActive * gateGlow * 2.5;

  // Beat 3: Maya — Prismatic color derived from wave interference
  // Hue shifts with phase, saturation drops at peaks (vWavePhase -> 1.0) for white-hot interference
  float hue = fract(vWavePhase * 1.5 + uTime * 0.1);
  float saturation = mix(0.8, 0.1, smoothstep(0.7, 1.0, vWavePhase));
  float value = mix(0.4, 1.0, smoothstep(0.5, 1.0, vWavePhase));
  vec3 chaosColor = hsv2rgb(vec3(hue, saturation, value));

  // Beat 4: Plane — luminous underlying field
  // vWorldY ranges from ~-0.14 to 0.14
  float waveCrest = smoothstep(0.0, 0.14, vWorldY);
  float deepTrough = smoothstep(0.0, -0.14, vWorldY);
  
  // Depth-based color shift: deeper = cooler/bluer, shallower = warmer/silver
  vec3 fieldColor = mix(uColorPlaneSilver, uColorPlaneMoonlight, vDepth);
  
  // Base luminous glow (deep indigo-black base)
  vec3 planeBase = mix(uColorPlaneObsidian, fieldColor, 0.15);
  
  // Brighter coherence bands at wave crests
  vec3 crestColor = mix(fieldColor, uColorPlaneGold, smoothstep(0.08, 0.14, vWorldY));
  
  vec3 planeColor = mix(planeBase, crestColor, waveCrest * 0.8);

  vec3 finalColor = bioColor   * uBeatWeights.x
                  + latticeColor * uBeatWeights.y
                  + chaosColor   * uBeatWeights.z
                  + planeColor   * uBeatWeights.w;

  // Final Beat 1 Alpha
  float bioAlpha = bioShape * mix(1.0, 0.3, vDepth);

  // Beat 1 & 2 need enough alpha to be visible but not blow out
  float baseAlpha = alpha * (0.04 + vDepth * 0.02);
  
  // Beat 4 alpha adjusted for the new lower particle count (15k instead of 500k)
  float waveCrestAlpha = smoothstep(0.0, 0.14, vWorldY);
  float planeAlpha = alpha * (0.15 + vDepth * 0.1);
  planeAlpha *= (1.0 + waveCrestAlpha * 0.5);
  
  float finalAlpha = bioAlpha * uBeatWeights.x
                   + baseAlpha * uBeatWeights.y
                   + baseAlpha * uBeatWeights.z
                   + planeAlpha * uBeatWeights.w;
  
  gl_FragColor = vec4(finalColor, finalAlpha);
}
