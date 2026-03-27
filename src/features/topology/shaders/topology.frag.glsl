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
varying float vWorldX;
varying float vWorldZ;
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
  // Strand color: cyan from uniform, modulated by delay for subtle variation
  vec3 strandColor = uColorBioStrand1 * (0.7 + vDelay * 0.05);
  // Rung color: white/green from uniform, brighter to stand out as base pairs
  vec3 rungColor = uColorBioStrand2 * 1.2;
  // Blend strand vs rung based on vIsRung
  vec3 kobColor = mix(strandColor, rungColor, vIsRung);
  
  // Combine shape with base color and Kobayashi variation
  vec3 bioColor = kobColor * bioShape;

  // Beat 2: Quantized Embedding Matrix — orange tokens, green attention flash
  // IMPORTANT: Cannot use vWavePhase for attention state — Beat 3 overwrites it with
  // interference value. Recompute isAttended here from vProgressIndex + uTime directly,
  // using the same formula as the vertex shader Beat 2 section.
  float numTokensFrag = 30.0;
  float tokenIdxFrag = floor(vProgressIndex * numTokensFrag);
  float attentionSpeedFrag = 0.4;
  float attentionPhaseFrag = fract(uTime * attentionSpeedFrag - tokenIdxFrag / numTokensFrag);
  float isAttended = smoothstep(0.85, 1.0, attentionPhaseFrag);

  // Base token color: orange (raw/unprocessed data)
  vec3 tokenRaw = uColorLatticeCyan; // uniform repurposed to orange (see shaderUniforms.ts)
  // Attended token color: bright green (active processing)
  vec3 tokenActive = uColorLatticeGreen;

  // Resting state: dim orange glow
  vec3 tokenBase = uColorLatticeSlate + tokenRaw * 0.3;
  // Attention flash: bright green burst
  vec3 attentionFlash = tokenActive * isAttended * 3.0;
  // Subtle inner glow that pulses with time (independent of attention)
  float innerPulse = 0.5 + 0.5 * sin(uTime * 2.0 + vProgressIndex * 10.0);
  vec3 tokenGlow = tokenRaw * innerPulse * 0.2;

  vec3 latticeColor = tokenBase + tokenGlow + attentionFlash;

  // Beat 3: Maya — Prismatic color derived from wave interference
  // Hue shifts with phase, saturation drops at peaks (vWavePhase -> 1.0) for white-hot interference
  float hue = fract(vWavePhase * 1.5 + uTime * 0.1);
  float saturation = mix(0.8, 0.1, smoothstep(0.7, 1.0, vWavePhase));
  float value = mix(0.4, 1.0, smoothstep(0.5, 1.0, vWavePhase));
  vec3 chaosColor = hsv2rgb(vec3(hue, saturation, value));

  // Beat 4: Torus — geometry-based coloring
  // Distance from Y-axis (center hole): inner edge R-r=8, outer edge R+r=16
  float distFromCenter = length(vec2(vWorldX, vWorldZ));

  // Inner edge of torus (R - r = 8) to outer edge (R + r = 16)
  float innerEdge = smoothstep(8.0, 10.0, distFromCenter);
  float outerEdge = smoothstep(14.0, 16.0, distFromCenter);

  // Base color: obsidian at inner edge, silver at outer
  vec3 torusBase = mix(uColorPlaneObsidian, uColorPlaneSilver, innerEdge);
  torusBase = mix(torusBase, uColorPlaneMoonlight, outerEdge * 0.5);

  // Gold coherence bands at top of torus (positive Y)
  float topBand = smoothstep(0.0, 4.0, vWorldY);
  vec3 torusColor = mix(torusBase, uColorPlaneGold, topBand * 0.6);

  vec3 finalColor = bioColor   * uBeatWeights.x
                  + latticeColor * uBeatWeights.y
                  + chaosColor   * uBeatWeights.z
                  + torusColor   * uBeatWeights.w;

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
