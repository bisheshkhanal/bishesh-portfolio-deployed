// Topology fragment shader
uniform vec4 uBeatWeights;
uniform vec3 uColorBioStrand1;
uniform vec3 uColorBioStrand2;
uniform vec3 uColorBioRung1;
uniform vec3 uColorBioRung2;
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
  float strandCore = smoothstep(0.38, 0.0, dist);
  float dustCore = smoothstep(0.42, 0.02, dist);

  // Beat 1: Bio — separate dense strands, sparse rungs, and atmospheric dust
  float side = step(0.5, vHelixSide);
  vec3 strandColor = mix(uColorBioStrand1, uColorBioStrand2, side);

  float strandMask = (1.0 - vIsRung) * (1.0 - vIsDust);
  float rungMask = vIsRung * (1.0 - vIsDust);
  float dustMask = vIsDust;

  // Base pair colors (A-T, C-G)
  // Use vRungIndex to determine which pair type it is
  float pairType = step(0.5, fract(vRungIndex * 0.618)); // Pseudo-random pair type
  
  // Color the two halves of the rung differently
  vec3 rungColorLeft = mix(uColorBioRung1, uColorBioRung2, pairType);
  vec3 rungColorRight = mix(uColorBioRung2, uColorBioRung1, pairType);
  
  vec3 rungBaseColor = mix(rungColorLeft, rungColorRight, step(0.5, vRungT));

  // Break the remaining comb read by letting only a subset of rung particles glow strongly.
  float rungPulse = smoothstep(0.55, 0.95, fract(vProgressIndex * 37.0 + vHelixSide * 11.0));

  vec3 dimStrandColor = strandColor * mix(0.6, 0.3, vDepth);
  vec3 rungColor = rungBaseColor * mix(1.2, 0.8, vDepth) * mix(0.7, 1.0, rungPulse);
  vec3 dustColor = mix(strandColor, vec3(0.82, 0.92, 1.0), 0.72) * mix(0.5, 0.25, vDepth);

  vec3 bioColor = dimStrandColor * strandMask
                + rungColor * rungMask
                + dustColor * dustMask;

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

  // Adjust alpha to prevent blowout
  float strandAlpha = strandCore * mix(0.07, 0.03, vDepth);
  float rungAlpha = alpha * mix(0.09, 0.04, vDepth) * mix(0.6, 1.0, rungPulse);
  float dustAlpha = dustCore * mix(0.04, 0.018, vDepth);
  float bioAlpha = strandAlpha * strandMask
                 + rungAlpha * rungMask
                 + dustAlpha * dustMask;

  // Beat 1 & 2 need enough alpha to be visible but not blow out
  float baseAlpha = alpha * (0.04 + vDepth * 0.02);
  
  // Beat 4 needs extremely low alpha because of the dense particle grid (500k particles)
  // Even a tiny alpha will add up to bright white if we're not careful
  float waveCrestAlpha = smoothstep(0.0, 0.14, vWorldY);
  float planeAlpha = alpha * (0.012 + vDepth * 0.008);
  planeAlpha *= (1.0 + waveCrestAlpha * 0.5);
  
  float finalAlpha = bioAlpha * uBeatWeights.x
                   + baseAlpha * uBeatWeights.y
                   + baseAlpha * uBeatWeights.z
                   + planeAlpha * uBeatWeights.w;
  
  gl_FragColor = vec4(finalColor, finalAlpha);
}
