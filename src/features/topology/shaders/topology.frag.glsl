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

  // Beat 1: Solid filled DNA helix dots — matches sidebar DNA scrollbar aesthetic
  // Solid disc shape (replaces hollow ring)
  // Reuse the existing shared soft-circle mask so line 40 stays the source of truth.
  // Suppress dust in Beat 1 so filled-disc dust does not create a haze absent from the sidebar reference.
  float bioShape = alpha * mix(1.0, 0.2, vIsDust);

  // Gray/white palette with depth variation (near=bright, far=dim)
  // Matches Helix.tsx: color.setRGB(0.90 + depthFactor * 0.10, ...)
  // vDepth: 0 = near (bright), 1 = far (dim) — CRITICAL: direction is inverted from naive assumption
  float depthBrightness = 1.0 - vDepth * 0.15; // 1.0 near, 0.85 far
  // Reference uniforms for live-tunability (not hardcoded)
  vec3 strandColor = uColorBioStrand1 * depthBrightness;
  vec3 rungColor = uColorBioStrand2 * depthBrightness;
  vec3 kobColor = mix(strandColor, rungColor, vIsRung);
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

  // Beat 1 Alpha — thinned for additive blending with 80k particles
  // With AdditiveBlending, ~100 overlapping particles at strand spine:
  // 100 * 0.85 * 0.008 ≈ 0.68 brightness — visible but not blown out
  // Start at 0.008, tune in T3 if needed
  float bioAlpha = bioShape * mix(0.008, 0.003, vDepth);

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
