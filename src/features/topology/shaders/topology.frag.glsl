// Topology fragment shader
uniform vec4 uBeatWeights;
uniform vec3 uColorBioStrand1;
uniform vec3 uColorBioStrand2;
uniform vec3 uColorBioRung;
uniform vec3 uColorLatticeSlate;
uniform vec3 uColorLatticeCyan;
uniform vec3 uColorLatticeGreen;
uniform vec3 uColorPlaneObsidian;
uniform vec3 uColorPlaneSilver;
uniform vec3 uColorPlaneMoonlight;
uniform float uTime;

varying float vDepth;
varying float vProgressIndex;
varying float vHelixSide;
varying float vRungMix;
varying float vWorldY;
varying float vIsDust;

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
  float isRung = step(0.39, vRungMix);

  float strandMask = (1.0 - isRung) * (1.0 - vIsDust);
  float rungMask = isRung * (1.0 - vIsDust);
  float dustMask = vIsDust;

  // Break the remaining comb read by letting only a subset of rung particles glow strongly.
  float rungPulse = smoothstep(0.55, 0.95, fract(vProgressIndex * 37.0 + vHelixSide * 11.0));

  vec3 dimStrandColor = strandColor * mix(0.42, 0.18, vDepth);
  vec3 rungColor = mix(uColorBioRung, strandColor, 0.18) * mix(1.15, 0.7, vDepth) * mix(0.6, 1.0, rungPulse);
  vec3 dustColor = mix(strandColor, vec3(0.82, 0.92, 1.0), 0.72) * mix(0.48, 0.22, vDepth);

  vec3 bioColor = dimStrandColor * strandMask
                + rungColor * rungMask
                + dustColor * dustMask;

  // Beat 2: Lattice — dark slate / cyan-green streams with downward worldY-based pulses
  // Make the pulse wider and more visible
  float pulsePhase = fract(vWorldY * 0.2 + uTime * 1.5);
  // Sharp pulse to stand out against the dark background
  float pulse = smoothstep(0.7, 0.9, pulsePhase) * smoothstep(1.0, 0.9, pulsePhase);
  
  // Base color is pure black, pulse adds bright cyan/green
  vec3 latticeBase = uColorLatticeSlate;
  vec3 pulseColor = mix(uColorLatticeCyan, uColorLatticeGreen, vDepth);
  // Boost pulse intensity significantly so it reads clearly
  vec3 latticeColor = latticeBase + pulseColor * pulse * 3.0;

  // Beat 3: Chaos — white/prismatic
  vec3 chaosColor = vec3(0.4, 0.35, 0.3);

  // Beat 4: Plane — obsidian mirror with faint pale-silver / moonlight-blue glimmers on ripple peaks
  // vWorldY ranges from -0.02 to 0.02. Isolate just the very highest peaks.
  float ripplePeak = smoothstep(0.01, 0.02, vWorldY);
  vec3 glimmerColor = mix(uColorPlaneSilver, uColorPlaneMoonlight, vDepth);
  
  // Base is pure black, only add glimmer on peaks
  vec3 planeColor = mix(uColorPlaneObsidian, glimmerColor, ripplePeak);

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
  float planeAlpha = alpha * (0.05 + vDepth * 0.05);
  
  float finalAlpha = bioAlpha * uBeatWeights.x
                   + baseAlpha * uBeatWeights.y
                   + baseAlpha * uBeatWeights.z
                   + planeAlpha * uBeatWeights.w;
  
  gl_FragColor = vec4(finalColor, finalAlpha);
}
